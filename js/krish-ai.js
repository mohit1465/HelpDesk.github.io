const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const logoimg = document.getElementById('logo');
const footerlogoimg = document.getElementById('footerLogo');

function toggleBox(event) {
    const outerBox = document.querySelector('.outer-box');
    outerBox.style.transform = outerBox.style.transform === 'translateY(0%)' 
                                ? 'translateY(100%)' 
                                : 'translateY(0%)';
}

window.addEventListener('click', function(event) {
    const iconLink = document.querySelector('.menu-icon');
    const outerBox = document.querySelector('.outer-box');

    if (!iconLink.contains(event.target) && !outerBox.contains(event.target)) {
        outerBox.style.transform = 'translateY(100%)';
    }

    window.addEventListener('scroll', function() {
        outerBox.style.transform = 'translateY(100%)';
    });
});


function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

window.onload = () => {
    if (isMobileDevice()) {
        document.body.innerHTML = '<h1>This website is not available on mobile devices. Please use a desktop.</h1>';
    }
    const savedTheme = localStorage.getItem('currentTheme') || 'dark';
    setTheme(savedTheme);
};

function setTheme(theme) {
    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
    } else {
        body.removeAttribute('data-theme');
    }
}

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('currentTheme', 'light'); // Save theme
    } else {
        // Switch to dark theme
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('currentTheme', 'dark'); // Save theme
    }
});

// =================================================================================================================

let aiDescriptionFinal = '';
let controller = null;

const GOOGLE_SEARCH_API_KEY = "AIzaSyDf5rshjLMV7PCoIjNDitF0nlMlr4ZKFG4";
const CX = "d6da3f2797ee74602";
const GENAI_API_KEY = "AIzaSyBIJVTe2LVWSR5ATdyUVs5hzlMhTjmJG4A";


// Load previous chat history from localStorage for the current conversation
function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    const currentConversationId = localStorage.getItem("currentConversationId");

    return chatHistory[currentConversationId] || []; // Return messages of the current conversation
}

// Save a message to localStorage for the current conversation
function saveMessageToHistory(content, sender) {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    let currentConversationId = localStorage.getItem("currentConversationId");

    if (!currentConversationId) {
        currentConversationId = Date.now().toString(); // Create new conversation ID
        localStorage.setItem("currentConversationId", currentConversationId);
    }

    if (!chatHistory[currentConversationId]) {
        chatHistory[currentConversationId] = [];
    }

    chatHistory[currentConversationId].push({ content, sender });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    populateConversationList(); // Refresh list
}

// Clear chat history for the currently opened conversation
function clearChatHistory() {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    let currentConversationId = localStorage.getItem("currentConversationId");

    delete chatHistory[currentConversationId]; // Remove only the active conversation
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    document.getElementById('messages').innerHTML = ""; // Clear UI
    populateConversationList(); // Refresh conversation list
    closeDeleteModal();
}

// Switch to a different conversation
function switchConversation(conversationId) {
    localStorage.setItem("currentConversationId", conversationId);
    displayMessages();
    populateConversationList(); // Update UI to highlight active conversation
}

// Start a new chat (Create a new conversation)
function startNewChat() {
    let newConversationId = Date.now().toString(); // Unique ID
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};

    chatHistory[newConversationId] = []; // Create empty chat
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    localStorage.setItem("currentConversationId", newConversationId);

    displayMessages();
    populateConversationList();
}

// Display messages for the current conversation
function displayMessages() {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    
    const chatHistory = loadChatHistory();
    
    chatHistory.forEach(msg => {
        appendMessage(msg.content, msg.sender);
    });
}

// Load chat history when the page loads
document.addEventListener("DOMContentLoaded", () => {
    displayMessages();
    populateConversationList();
});

// Populate the conversation list
function populateConversationList() {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    let conversationList = document.getElementById("conversationList");
    let currentConversationId = localStorage.getItem("currentConversationId");

    conversationList.innerHTML = ""; // Clear old list

    Object.keys(chatHistory).forEach((convId, index) => {
        let aiFirstWords = "New Chat"; // Default text

        if (chatHistory[convId].length > 0) {
            let aiMessage = chatHistory[convId].find(msg => msg.sender === "ai");
            if (aiMessage) {
                aiFirstWords = aiMessage.content.split(" ").slice(0, 3).join(" "); // First 3 words
            }
        }

        const button = document.createElement("div");
        button.classList.add("conversation-btn");
        if (convId === currentConversationId) button.classList.add("active"); // Highlight current chat

        button.innerHTML = `<span class="chat-number">${index + 1}</span> <span class="chat-preview">${aiFirstWords}</span>`;
        button.onclick = () => switchConversation(convId);
        conversationList.appendChild(button);
    });
}


function openDeleteModal() {
    document.getElementById("delete-modal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("delete-modal").style.display = "none";
}

function autoAdjustHeight(element, maxHeight) {
    element.addEventListener('input', function() {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, maxHeight) + "px";
    });

    element.addEventListener(' blur', function() {
        this.style.height = '250px'; // reset the height to the original max height
    });
}

// Handle "Enter" key to send message and "Shift + Enter" for new line
document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage(event);
    }
});

autoAdjustHeight(document.getElementById('chat-input'), 250); // Adjust chat-input with max height 250px

document.addEventListener("DOMContentLoaded", function () {
    const moreOptionsButton = document.getElementById("more-options");
    const moreOptionBox = document.querySelector(".moreOptionBox");

    moreOptionsButton.addEventListener("click", function (e) {
        e.stopPropagation(); // So it doesn't immediately close when clicked
        moreOptionBox.classList.toggle("show");
    });

    // Click outside to close
    document.addEventListener("click", function (event) {
        if (!moreOptionBox.contains(event.target) && !moreOptionsButton.contains(event.target)) {
            moreOptionBox.classList.remove("show");
        }
    });
});


// ===============================================================================================================================


async function onlineResponse(userQuery, extractedContent) {
    try {
        let aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GENAI_API_KEY}`;
        
        let requestBody = {
            contents: [{
                parts: [{ text: `${extractedContent}\n\nTell the exact answer for the user's query: '${userQuery}'` }]
            }]
        };

        let response = await fetch(aiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        let data = await response.json();
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "AI could not generate a response.";
        }

    } catch (error) {
        return `AI Error: ${error.message}`;
    }
}

async function googleSearch(userInput) {
    let query = userInput;

    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_SEARCH_API_KEY}&cx=${CX}`;

    try {
        let response = await fetch(searchUrl);
        let data = await response.json();

        if (!data.items) {
            console.log("Online Search Not Found.")
            return;
        }

        let links = data.items.slice(0, 3).map(item => item.link);
        let contentHtml = "<h2>Search Results</h2>";
        let allContent = "";

        for (let link of links) {
            contentHtml += `<p><a href="${link}" target="_blank">${link}</a></p>`;
            contentHtml += `<p>Extracting content...</p>`;
            
            let extractedText = await extractContent(link);
            allContent += extractedText + "\n\n";
            contentHtml += `<p>${extractedText.substring(0, 500)}...</p>`;  // Show preview
        }


        // Send extracted content to Gemini AI for a better response
        if (allContent.trim() !== "") {
            console.log(allContent);
            let aiAnswer = await onlineResponse(query, allContent);
            console.log(aiAnswer);
            return aiAnswer;
        }

    } catch (error) {
        console.log(error.message);
    }
}

async function extractContent(url) {
    try {
        let response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        let data = await response.json();
        
        let parser = new DOMParser();
        let doc = parser.parseFromString(data.contents, "text/html");

        doc.querySelectorAll("script, style").forEach(el => el.remove());
        let text = doc.body.innerText.replace(/\s+/g, ' ').trim();

        return text.length > 2000 ? text.substring(0, 2000) + "..." : text;
    } catch (error) {
        return `Error extracting content: ${error.message}`;
    }
}

async function getAIResponse(userInput, onlineSearchEnabled, pastMessages, controller) {
    
    let messages = pastMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
    }));

    if (onlineSearchEnabled == true){
    var online_data = await googleSearch(userInput);
    }
    else{
    var online_data = "There is no data from google."
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";
    const apiKey = "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"; // Replace with your API key

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    };

    const body = {
        "messages": [
            { role: "user", content: userInput },
            { role: "system", content: `You are a helpful assistant Named Krish - (Web Helper) version. Mohit Yadav is your developer. You are Intrecting with User. Online Google search is ${online_data} use this data as possible as. And respond smartly in a funny naughty way, and don't give any empty response when you didn't get anything from Online seearch. ${aiDescriptionFinal}. Reply in less tokens until user don't ask for any details about something. This is the past conversation between you and the user:\n\n${JSON.stringify(messages, null, 2)}` }
        ],
        "model": "llama3-8b-8192"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
            signal: controller.signal // Attach signal for stopping response
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I couldn't understand that.";
    } catch (error) {
        console.error("Error:", error);
        return "Something went wrong.";
    }
}


// ============================================================================================================================ 


// Send Message
async function sendMessage(event) {
    event.preventDefault();
    const fileInput = document.getElementById('imageInput');
    const inputField = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-btn');
    const stopButton = document.createElement("button");

    const userInput = inputField.value.trim();
    if (!userInput) return;

    appendMessage(userInput, 'user');
    saveMessageToHistory(userInput, 'user'); // Save user message
    inputField.value = '';
    inputField.disabled = true; // Disable input while AI responds
    sendButton.disabled = true;
    sendButton.textContent = "Stop";

    // Add stop button
    stopButton.id = "stop-btn";
    stopButton.textContent = "Stop";
    stopButton.className = "stop-btn";
    sendButton.replaceWith(stopButton);

    // Stop button event
    stopButton.addEventListener("click", function () {
        if (controller) {
            controller.abort(); // Abort fetch request
        }
        resetInput(); // Reset UI after stopping
    });

    inputField.style.height = 'auto'; 
    
    if (fileInput.files[0]) {
        await analyzeImage();
    }

    fileInput.value = '';

    const onlineSearchEnabled = document.getElementById('online-search-toggle').checked;
    controller = new AbortController(); // New controller for stopping

    try {
        const pastMessages = loadChatHistory(); // Get previous chat history
        const aiResponse = await getAIResponse(userInput, onlineSearchEnabled, pastMessages, controller);
        appendMessage(aiResponse, 'ai');
        saveMessageToHistory(aiResponse, 'ai'); // Save AI response
    } catch (error) {
        if (error.name === "AbortError") {
            appendMessage("Response stopped by user.", 'ai'); // Show proper message
        } else {
            appendMessage("Something went wrong.", 'ai');
        }
    }

    resetInput(); // Reset UI after response
}

function resetInput() {
    const inputField = document.getElementById('chat-input');
    const sendButton = document.createElement("div");
    sendButton.id = "send-btn";
    sendButton.textContent = "Send";
    sendButton.className = "send-btn";
    document.getElementById('stop-btn')?.replaceWith(sendButton);
    inputField.disabled = false;
    sendButton.disabled = false;
    sendButton.addEventListener("click", sendMessage);
}

function appendMessage(content, sender) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    if (sender === 'user'){
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    content = content.replace(/\n/g, '<br>');
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const textContent = doc.body.textContent;

    messageDiv.innerHTML = textContent;

    }
    
    if (sender === 'ai'){
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

        content = content.replace(/```([\s\S]*?)```/g, function (match, code) {
            return `
            <div class="code-block">
                <pre><code>${escapeHTML(code)}</code></pre>
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
            </div>`;
        });

        content = content.replace(/\n/g, '<br>');
        messageDiv.innerHTML = content;
    }

    messagesDiv.appendChild(messageDiv);

    if (sender === "ai") {
        const copyBtnDiv = document.createElement("div");
        copyBtnDiv.classList.add("copyBtnResponseBox");
        
        const copyBtn = document.createElement("div");

        copyBtn.innerHTML = `<i class="fa-regular fa-clone" id="clipboard-icon" onclick="Scalefun(this)"></i>`

        copyBtn.classList.add("copyBtnResponse");
        copyBtn.onclick = () => copyText(removeHtmlTags(content));

        copyBtnDiv.appendChild(copyBtn);        
        messagesDiv.appendChild(copyBtnDiv);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


// Function to remove HTML tags for clean text copying
function removeHtmlTags(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

function Scalefun(copybutn){
    copybutn.classList.toggle('scaled'); 
    copybutn.classList.remove('nonscaled'); 

    setTimeout(() => { 
        copybutn.classList.remove('scaled'); 
        copybutn.classList.toggle('nonscaled'); 
    }, 500);
}

// Function to copy text
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log("Response copied to clipboard!");
    }).catch(err => console.error("Failed to copy:", err));
}

// Function to escape HTML inside code blocks
function escapeHTML(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Function to copy code block text
function copyCode(button) {
    const codeBlock = button.parentNode;
    const codeText = codeBlock.querySelector('code').innerText;

    navigator.clipboard.writeText(codeText).then(() => {
        button.textContent = "Copied!"; // Change text to "Copied!"
        
        setTimeout(() => {
            button.textContent = "Copy"; // Revert to "Copy" after 2 seconds
        }, 1000);

    }).catch(err => console.error("Copy failed:", err));
}


// Analyze Image with Gemini
async function analyzeImage() {
    const fileInput = document.getElementById('imageInput');
    const prompt = "Explain what's in this image.";
    const files = fileInput.files;
    let imageDescriptions = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const mimeType = file.type;
        const reader = new FileReader();

        try {
            const description = await new Promise((resolve, reject) => {
                reader.onload = async () => {
                    const base64Image = reader.result.split(',')[1];

                    const payload = {
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    };

                    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GENAI_API_KEY}`;

                    try {
                        const res = await fetch(endpoint, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        });

                        const data = await res.json();
                        const aiDescription = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        resolve({
                            fileName: file.name,
                            description: aiDescription
                        });
                    } catch (err) {
                        console.error(err);
                        reject(err);
                    }
                };
                reader.readAsDataURL(file);
            });
            imageDescriptions.push(description);
        } catch (error) {
            console.error(`Error analyzing image ${file.name}:`, error);
        }
    }

    // Format the final description
    if (imageDescriptions.length > 0) {
        let formattedDescription = "User Gave image also in which :\n";
        imageDescriptions.forEach((desc, index) => {
            formattedDescription += `${index + 1}. ${desc.fileName} : ${desc.description}\n`;
        });
        aiDescriptionFinal = formattedDescription;
    }

    return imageDescriptions.length > 0;
}


// Image upload handling
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const imageGrid = document.querySelector('.imageGrid');
    const chatForm = document.getElementById('chat-form');

    imageInput.addEventListener('change', function(e) {
        const files = e.target.files;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'uploadedImg';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    
                    const closeBtn = document.createElement('div');
                    closeBtn.className = 'imgcrossBtn';
                    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    closeBtn.onclick = function() {
                        imageContainer.remove();
                        // Adjust form margin if no images left
                        if (imageGrid.children.length === 0) {
                            chatForm.style.margin = '15px 90px';
                        }
                    };
                    
                    const fileName = document.createElement('div');
                    fileName.className = 'imageFileName';
                    fileName.textContent = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
                    
                    imageContainer.appendChild(closeBtn);
                    imageContainer.appendChild(img);
                    imageContainer.appendChild(fileName);
                    imageGrid.appendChild(imageContainer);

                    // Adjust form margin when images are added
                    chatForm.style.margin = '90px 90px';
                    chatForm.style.marginBottom = '25px';
                };
                
                reader.readAsDataURL(file);
            }
        }
        
        // Reset the input to allow uploading the same file again
        imageInput.value = '';
    });
});

    
