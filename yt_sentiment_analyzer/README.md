This extention calls locally running ollama apis against qwen3:1.7b model. 

So to test it you must have ollama installed on your machine and you must have done 
"ollama run qwen3:1.7b" for this to work. 

Also since extentions run in the webpage and ollama apis  does't send cors header by default you need to run the cors_proxy nodejs application runing locally

steps to start the proxy app:
```
git clone https://github.com/devashish234073/chrome_extensions
cd chrome_extensions
cd yt_sentiment_analyzer
node cors_proxy.js
```

This is how the extension adds the rotating emotions next to the replies we expand:

![image](https://github.com/user-attachments/assets/cac29294-ac63-40c7-8f63-3609dcc10940)

And on clicking the extention icon it will show the summary like this:

![image](https://github.com/user-attachments/assets/6b08ad4f-7ce3-481d-8a9b-24327e4c8b8a)

To install the extention from source:

1. in edge goto Manage Extentions:
   
   ![image](https://github.com/user-attachments/assets/ebe051ab-d9f7-4bc2-a1f7-67890a8761fb)

3. Click on load unpacked, you might have to turn the dev tool toggle on if its off:
   ![image](https://github.com/user-attachments/assets/dad21617-581b-42fd-a7d9-8e1a22c61406)

4. Select the folder:
   ![image](https://github.com/user-attachments/assets/7d13b07e-153f-42ea-8949-95877dab1663)


