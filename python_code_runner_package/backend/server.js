const { exec } = require('child_process');
const http = require("http");
const fs = require("fs");
const PORT = 9999;

function serverFunction(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    if (req.method === 'POST' && req.url === '/run') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            fs.writeFile('output.py', body, 'utf8', (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Error saving file' }));
                    console.error('File write error:', err);
                } else {
                    exec('python output.py', (error, stdout, stderr) => {
                        if (error) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Error executing Python script', error: error.message }));
                            console.error('Python script execution error:', error);
                            return;
                        }

                        if (stderr) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Python script error', error: stderr }));
                            console.error('Python script error output:', stderr);
                            return;
                        }

                        // Return Python script's stdout as the response
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Python script output', output: stdout }));
                        console.log('Python script output:', stdout);
                    });
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
}

let server = http.createServer(serverFunction);

server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT} open http://localhost:${PORT}`);
})

/*const pythonScript = 'python3 path/to/your/app.py'; // Change 'python3' to 'python' if using Python 2

exec(pythonScript, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Python script error: ${stderr}`);
        return;
    }
    console.log(`Python script output: ${stdout}`);
});*/
