const express = require('express');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Simple CORS middleware for all routes
app.use((req, res, next) => {
	// Allow any origin - adjust this in production to a specific origin if needed
	res.setHeader('Access-Control-Allow-Origin', '*');
	// Allowed methods
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	// Allowed headers (reflect request or default common headers)
	const requestHeaders = req.headers['access-control-request-headers'];
	res.setHeader('Access-Control-Allow-Headers', requestHeaders || 'Content-Type, Authorization');
	// Optional: allow credentials if required (false by default here)
	// res.setHeader('Access-Control-Allow-Credentials', 'true');

	// Handle preflight
	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	return next();
});

// Helper to perform HTTP/HTTPS requests and return status, headers and body
function forwardRequest({ url, method = 'GET', headers = {}, body }) {
	return new Promise((resolve, reject) => {
		let parsed;
		try {
			parsed = new URL(url);
		} catch (err) {
			return reject(new Error('Invalid URL'));
		}

		const isHttps = parsed.protocol === 'https:';
		const lib = isHttps ? https : http;

		const options = {
			hostname: parsed.hostname,
			port: parsed.port || (isHttps ? 443 : 80),
			path: parsed.pathname + parsed.search,
			method: method.toUpperCase(),
			headers: Object.assign({}, headers),
		};

		const req = lib.request(options, (res) => {
			const chunks = [];
			res.on('data', (c) => chunks.push(c));
			res.on('end', () => {
				const buffer = Buffer.concat(chunks);
				const contentType = (res.headers['content-type'] || '').toLowerCase();
				let parsedBody = buffer.toString('utf8');

				if (contentType.includes('application/json')) {
					try {
						parsedBody = JSON.parse(parsedBody);
					} catch (e) {
						// leave as string if JSON parse fails
					}
				}

				resolve({ status: res.statusCode, headers: res.headers, body: parsedBody });
			});
		});

		req.on('error', (err) => reject(err));

		if (body !== undefined && body !== null) {
			// If body is an object and content-type not set, stringify as JSON
			const hasContentType = Object.keys(options.headers).some(
				(h) => h.toLowerCase() === 'content-type'
			);

			let payload = body;
			if (typeof body === 'object' && !Buffer.isBuffer(body)) {
				if (!hasContentType) {
					req.setHeader('Content-Type', 'application/json');
				}
				payload = JSON.stringify(body);
			}

			req.write(payload);
		}

		req.end();
	});
}

/**
 * Create nested directories from a path (e.g. "/src/main/java") and write a file inside.
 *
 * Behavior:
 * - pathStr may start with or without a leading slash. Leading slashes are ignored and treated as
 *   relative to the project root (process.cwd()).
 * - fileName is the file to create inside the final directory (e.g. "Text.js").
 * - content is written as UTF-8.
 *
 * @param {string} pathStr - A slash-separated path like "/src/main/java" or "src/main/java".
 * @param {string} fileName - File name to create, e.g. "Text.js".
 * @param {string|Buffer} content - File content to write.
 * @returns {{ success: boolean, filePath?: string, error?: string }}
 */
function writeNestedFile(pathStr, fileName, content) {
	if(pathStr==fileName) {
		pathStr = "/projects"
	} else if(pathStr.endsWith(fileName)) {
		pathStr = "/projects/"+pathStr.replace(fileName, "");
	} else {
		pathStr = "/projects/"+pathStr;
	}
	try {
		if (typeof pathStr !== 'string' || !pathStr) {
			throw new Error('pathStr must be a non-empty string');
		}
		if (typeof fileName !== 'string' || !fileName) {
			throw new Error('fileName must be a non-empty string');
		}

		// Normalize slashes and remove any leading slashes so we treat it as relative to cwd
		let normalized = pathStr.replace(/\\/g, '/');
		if (normalized.startsWith('/')) {
			normalized = normalized.replace(/^\/+/, '');
		}

		// If after stripping it's empty, use current directory
		const relativeParts = normalized === '' ? [] : normalized.split('/').filter(Boolean);

		const baseDir = path.join(process.cwd(), ...relativeParts);

		// Ensure directories exist
		fs.mkdirSync(baseDir, { recursive: true });

		const filePath = path.join(baseDir, fileName);

		fs.writeFileSync(filePath, content, 'utf8');

		return { success: true, filePath };
	} catch (err) {
		return { success: false, error: err.message };
	}
}

// POST /one
// Expected JSON payload: { url: string, method?: string, headers?: object, body?: any }
app.post('/ollama', async (req, res) => {
    const headers = {};
    const url = "http://localhost:11434/api/generate";
    const method = 'POST';
	const body = req.body;

	if (!url || typeof url !== 'string') {
		return res.status(400).json({ error: 'Missing or invalid "url" in request body' });
	}

	try {
		const remote = await forwardRequest({ url, method, headers, body });

		// Copy most headers from remote response, excluding hop-by-hop headers
		const hopByHop = new Set([
			'connection',
			'keep-alive',
			'proxy-authenticate',
			'proxy-authorization',
			'te',
			'trailer',
			'transfer-encoding',
			'upgrade',
		]);

		Object.entries(remote.headers || {}).forEach(([k, v]) => {
			if (!hopByHop.has(k.toLowerCase())) {
				try {
					res.setHeader(k, v);
				} catch (e) {
					// ignore
				}
			}
		});

		// Set status code
		res.status(remote.status || 200);

		// Send body. If remote body is an object, send as JSON, otherwise send raw text
		if (typeof remote.body === 'object' && remote.body !== null) {
            let val = remote.body.response.split("```");
            console.log(val[1]);
            if(val[1].indexOf("json")>=0) {
                val[1] = val[1].substr(val[1].indexOf("json")+4);
				let data = JSON.parse(val[1]);
				for(let i=0;i<data.length;i++) {
					writeNestedFile(data[i].path, data[i].fileName, data[i].content);
				}
                return res.json(data);
            }
			return res.json(remote.body);
		}

		return res.send(remote.body);
	} catch (err) {
		return res.status(502).json({ error: 'Failed to fetch remote URL', details: err.message });
	}
});

app.get('/', (req, res) => res.send('Proxy server running. POST to /one'));

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://localhost:${PORT}`);
});
