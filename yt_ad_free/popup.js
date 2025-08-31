// popup.js
const buildBtn = document.getElementById('build');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');
const iframeTextarea = document.getElementById('iframeHtml');
const playerPreview = document.getElementById('playerPreview');
const status = document.getElementById('status');

function sanitizeTitleForAttr(t) {
  if (!t) return '';
  return t.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function getVideoInfoFromActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) throw new Error('No active tab found.');
  const tab = tabs[0];

  // Run a small function inside the page to extract data from the URL / DOM.
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Returns an object with videoId, title, start (seconds if available), and embedUrl
      function extractVideoId(url) {
        try {
          const u = new URL(url, location.href);
          // standard watch?v=
          if (u.searchParams.has('v')) return u.searchParams.get('v');
          // youtu.be short link
          if (u.hostname.includes('youtu.be')) {
            return u.pathname.slice(1);
          }
          // embed path /embed/<id>
          const m = u.pathname.match(/\/embed\/([^\/\?]+)/);
          if (m) return m[1];
          return null;
        } catch (e) {
          return null;
        }
      }

      const videoId = extractVideoId(location.href) || null;

      // Try to get the current player's time if present
      let startSeconds = 0;
      // YouTube uses a <video> element for HTML5 playback; try to read currentTime
      try {
        const vid = document.querySelector('video');
        if (vid && typeof vid.currentTime === 'number') {
          startSeconds = Math.floor(vid.currentTime) || 0;
        } else {
          // fallback: parse 't' parameter in URL (e.g., &t=90s or &t=1m30s)
          const u = new URL(location.href);
          const t = u.searchParams.get('t') || u.searchParams.get('start');
          if (t) {
            // try to convert '1m30s' or '90' style
            const match = t.match(/(?:(\d+)m)?(?:(\d+)s)?|(\d+)/);
            if (match) {
              if (match[3]) startSeconds = parseInt(match[3], 10);
              else {
                const mins = parseInt(match[1] || '0', 10);
                const secs = parseInt(match[2] || '0', 10);
                startSeconds = mins * 60 + secs;
              }
            }
          }
        }
      } catch (e) {
        startSeconds = 0;
      }

      // Title fallback
      const title = (document.title || '').replace(' - YouTube', '').trim();

      return { videoId, title, startSeconds, pageUrl: location.href };
    }
  });

  return result.result;
}

function buildIframeHtml({ videoId, title, startSeconds }) {
  if (!videoId) throw new Error('Video id not found on this tab (is it a YouTube URL?).');

  const width = 875;
  const height = 492;
  let src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
  const params = new URLSearchParams();
  // Add start param only if > 0
  if (startSeconds && startSeconds > 0) params.set('start', String(startSeconds));
  // recommended common params
  params.set('rel', '0');

  const paramStr = params.toString();
  if (paramStr) src += `?${paramStr}`;

  const tAttr = sanitizeTitleForAttr(title) || `YouTube video ${videoId}`;

  return `<iframe width="${width}" height="${height}" src="${src}" title="${tAttr}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

function showPreview(html) {
  playerPreview.innerHTML = html;
  // make sure the iframe is responsive and centered
  const iframe = playerPreview.querySelector('iframe');
  if (iframe) {
    iframe.style.maxWidth = '100%';
  }
}

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

function downloadHtmlFile(html) {
  const fullHtml = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Embedded YouTube</title></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
${html}
</body>
</html>`;
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'youtube-embed.html';
  a.click();
  URL.revokeObjectURL(url);
}

buildBtn.addEventListener('click', async () => {
  status.textContent = '';
  iframeTextarea.value = '';
  playerPreview.textContent = 'Loading...';
  copyBtn.disabled = true;
  downloadBtn.disabled = true;

  try {
    const info = await getVideoInfoFromActiveTab();
    if (!info || !info.videoId) {
      playerPreview.textContent = 'No YouTube video found on the current tab.';
      return;
    }
    const iframeHtml = buildIframeHtml(info);
    iframeTextarea.value = iframeHtml;
    showPreview(iframeHtml);
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
    status.textContent = 'Done — preview shown. You can copy or download.';
  } catch (err) {
    playerPreview.textContent = 'Error: ' + (err.message || err);
    status.textContent = '';
  }
});

copyBtn.addEventListener('click', async () => {
  const html = iframeTextarea.value;
  if (!html) return;
  try {
    await copyToClipboard(html);
    status.textContent = 'Copied iframe HTML to clipboard.';
  } catch (e) {
    status.textContent = 'Copy failed. (Try selecting the text manually.)';
  }
});

downloadBtn.addEventListener('click', () => {
  const html = iframeTextarea.value;
  if (!html) return;
  downloadHtmlFile(html);
});
