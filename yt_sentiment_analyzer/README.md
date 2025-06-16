This extention calls locally running ollama apis against qwen3:1.7b model. So to test it you must have ollama installed on your machine and you must have done "ollama run qwen3:1.7b" for this to work. Also since extentions run in the webpage and ollama apis  does't send cors header by default you need to run a middleware nodejs application runing locally which you can get from this repo: https://github.com/devashish234073/chrome_extensions, just go to it and run the cors_proxy.js by going to it;s directory and doing "node cors_proxy.js"

steps:
```
git clone https://github.com/devashish234073/chrome_extensions
cd chrome_extensions
cd yt_sentiment_analyzer
node cors_proxy.js
```