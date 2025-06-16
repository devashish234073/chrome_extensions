class YouTubeSentimentAnalyzer {
  constructor() {
    this.analyzed = new Set();
    this.sentimentData = [];
    this.init();
  }

  init() {
    console.log('YouTube Sentiment Analyzer initialized');
    this.observeComments();
    //this.addAnalyzeButton();

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getSentimentData') {
        sendResponse({ data: this.sentimentData });
      } else if (request.action === 'analyzeComments') {
        this.analyzeAllComments();
        sendResponse({ status: 'started' });
      }
    });
  }

  observeComments() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const comments = node.querySelectorAll('#content-text');
            if (comments.length > 0) {
              //console.log("found new comments: ", comments);
              comments.forEach(comment => this.processComment(comment));
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async processComment(commentElement) {
    const commentId = this.getCommentId(commentElement);
    if (this.analyzed.has(commentId)) return;

    const commentText = commentElement.textContent.trim();
    if (commentText.length < 10) return; // Skip very short comments

    this.analyzed.add(commentId);

    try {
      const sentiment = await this.analyzeSentiment(commentText);
      this.addSentimentToComment(commentElement, sentiment);
      this.sentimentData.push({
        text: commentText.substring(0, 100) + '...',
        sentiment: sentiment.label,
        confidence: sentiment.confidence
      });
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  }

  getCommentId(element) {
    return element.closest('[data-reply-id]')?.getAttribute('data-reply-id') ||
      element.closest('#comment')?.id ||
      element.textContent.substring(0, 50);
  }

  async analyzeSentiment(text) {
    console.log("Analyzing sentiment for comment: ", text);
    const payload = {
      model: 'qwen3:1.7b',
      prompt: `Analyze the sentiment of this comment and respond with only one of these labels: HAPPY, SAD, ANGER or NEUTRAL. Comment: "${text}"`,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.1
      }
    };

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: 'fetchSentiment', payload },
          (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
            } else if (!result.success) {
              reject(result.error);
            } else {
              resolve(result.data);
            }
          }
        );
      });

      const sentiment = this.parseSentimentResponse(response.response);
      console.log("sentiment: ", sentiment);

      return {
        label: sentiment
      };
    } catch (error) {
      console.error('Ollama API error:', error);
      return { label: 'UNKNOWN' };
    }
  }


  parseSentimentResponse(response) {
    // Handle DeepSeek-R1 response format with <think>...</think> sections
    let cleanResponse = response;

    // Remove <think>...</think> sections if present
    cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Clean up any remaining whitespace
    cleanResponse = cleanResponse.trim();

    // Look for sentiment labels in the cleaned response
    const upperResponse = cleanResponse.toUpperCase();

    // Check for explicit sentiment labels
    if (upperResponse.includes('HAPPY')) return 'HAPPY';
    if (upperResponse.includes('SAD')) return 'SAD';
    if (upperResponse.includes('ANGER')) return 'ANGER';
    if (upperResponse.includes('NEUTRAL')) return 'NEUTRAL';
    return 'INVALID'; // Default fallback
  }

  addSentimentToComment(commentElement, sentiment) {
    if (commentElement.querySelector('.sentiment-indicator')) return;

    const indicator = document.createElement('span');
    indicator.className = `sentiment-indicator sentiment-${sentiment.label.toLowerCase()}`;
    indicator.textContent = this.getSentimentEmoji(sentiment.label);
    indicator.title = `Sentiment: ${sentiment.label}`;

    const commentContainer = commentElement.closest('#comment-content') || commentElement.parentElement;
    console.log("Adding sentiment indicator: ", sentiment.label, " to comment: ", commentElement.textContent);
    if (commentContainer) {
      commentContainer.style.position = 'relative';
      commentContainer.appendChild(indicator);
      console.log("Added sentiment indicator: ", sentiment.label, " to comment: ", commentElement.textContent);
    }
  }

  getSentimentEmoji(sentiment) {
    const emojis = {
      'HAPPY': '😊',
      'SAD': '😞',
      'ANGER': '😡',
      'NEUTRAL': '😐',
      'UNKNOWN': '❓',
      'INVALID': '❗️'
    };
    return emojis[sentiment] || '❓';
  }

  async analyzeAllComments() {
    const comments = document.querySelectorAll('#content-text');
    const button = document.querySelector('#sentiment-analyze-btn');

    if (button) {
      button.textContent = '🔄 Analyzing...';
      button.disabled = true;
    }

    let processed = 0;
    console.log("all comments: ", comments.length);
    console.log("first four comments: ", Array.from(comments).slice(0, 4).map(c => c.textContent));
    for (const comment of comments) {
      await this.processComment(comment);
      processed++;

      if (button) {
        button.textContent = `🔄 Analyzed ${processed}/${comments.length}`;
      }

      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (button) {
      button.textContent = '✅ Analysis Complete';
      setTimeout(() => {
        button.textContent = '🎭 Analyze Sentiment';
        button.disabled = false;
      }, 2000);
    }

    // Save data to storage for popup
    chrome.storage.local.set({ sentimentData: this.sentimentData });
  }
}

// Initialize the analyzer when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new YouTubeSentimentAnalyzer());
} else {
  new YouTubeSentimentAnalyzer();
}