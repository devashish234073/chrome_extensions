function renderTable(data) {
  const tbody = document.querySelector('#sentiment-table tbody');
  tbody.innerHTML = '';

  for (const entry of data) {
    const row = document.createElement('tr');

    const commentCell = document.createElement('td');
    commentCell.textContent = entry.text;

    const sentimentCell = document.createElement('td');
    sentimentCell.textContent = entry.sentiment;

    row.appendChild(commentCell);
    row.appendChild(sentimentCell);
    tbody.appendChild(row);
  }
}

function pollForData() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs[0]) return;

    chrome.tabs.sendMessage(tabs[0].id, { action: 'getSentimentData' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Runtime error:', chrome.runtime.lastError.message);
        return;
      }

      if (response && response.data) {
        renderTable(response.data);
      }
    });
  });
}

setInterval(pollForData, 1000);
pollForData();
