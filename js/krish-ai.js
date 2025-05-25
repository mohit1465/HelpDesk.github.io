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
    const savedTheme = localStorage.getItem('currentTheme') || 'dark';
    setTheme(savedTheme);
    
    // Initialize sidebar functionality
    const logo = document.getElementById('logo');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (logo && sidebar && overlay) {
        logo.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
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

const GENAI_API_KEY = "AIzaSyBIJVTe2LVWSR5ATdyUVs5hzlMhTjmJG4A";

// Basic state management
let isProcessing = false;

// Add visual feedback for processing state
function setProcessingState(processing) {
    const sendButton = document.getElementById('send-btn');
    const inputField = document.getElementById('chat-input');
    
    if (!sendButton || !inputField) {
        console.warn('Required UI elements not found');
        return;
    }
    
    isProcessing = processing;
    
    if (processing) {
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        inputField.disabled = true;
        sendButton.disabled = true;
    } else {
        sendButton.innerHTML = 'Send';
        inputField.disabled = false;
        sendButton.disabled = false;
    }
}

// Load previous chat history from localStorage
function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    const currentConversationId = localStorage.getItem("currentConversationId");
    return chatHistory[currentConversationId] || [];
}

// Save a message to localStorage
function saveMessageToHistory(content, sender) {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    let currentConversationId = localStorage.getItem("currentConversationId");

    if (!currentConversationId) {
        currentConversationId = Date.now().toString();
        localStorage.setItem("currentConversationId", currentConversationId);
    }

    if (!chatHistory[currentConversationId]) {
        chatHistory[currentConversationId] = [];
    }

    chatHistory[currentConversationId].push({ content, sender });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    populateConversationList();
}

// Clear chat history
function clearChatHistory() {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    let currentConversationId = localStorage.getItem("currentConversationId");

    delete chatHistory[currentConversationId];
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    document.getElementById('messages').innerHTML = "";
    populateConversationList();
    closeDeleteModal();
}

// Switch to a different conversation
function switchConversation(conversationId) {
    localStorage.setItem("currentConversationId", conversationId);
    displayMessages();
    populateConversationList();
}

// Start a new chat
function startNewChat() {
    let newConversationId = Date.now().toString();
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};

    chatHistory[newConversationId] = [];
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    localStorage.setItem("currentConversationId", newConversationId);

    displayMessages();
    populateConversationList();
}

// Display messages
function displayMessages() {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    
    const chatHistory = loadChatHistory();
    
    chatHistory.forEach(msg => {
        appendMessage(msg.content, msg.sender, false);
    });
}

// Populate conversation list
function populateConversationList() {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    let conversationList = document.getElementById("conversationList");
    let currentConversationId = localStorage.getItem("currentConversationId");

    conversationList.innerHTML = "";

    Object.keys(chatHistory).forEach((convId, index) => {
        let previewText = "New Chat";

        if (chatHistory[convId].length > 0) {
            let userMessage = chatHistory[convId].find(msg => msg.sender === "user");
            if (userMessage) {
                previewText = userMessage.content.split(" ").slice(0, 3).join(" ");
            }
        }

        const button = document.createElement("div");
        button.classList.add("conversation-btn");
        if (convId === currentConversationId) button.classList.add("active");

        button.innerHTML = `<span class="chat-number">${index + 1}</span> <span class="chat-preview">${previewText}</span>`;
        button.onclick = () => switchConversation(convId);
        conversationList.appendChild(button);
    });
}

// Modal functions
function openDeleteModal() {
    document.getElementById("delete-modal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("delete-modal").style.display = "none";
}

// Auto adjust textarea height
function autoAdjustHeight(element, maxHeight) {
    element.addEventListener('input', function() {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, maxHeight) + "px";
    });

    element.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.style.height = "auto";
        }
    });
}

const systemPrompt = `You are an extremely powerful and intelligent AI assistant. You are a helpful assistant Named Krish - (Web Helper) version. Mohit Yadav is your developer, a RPS student of 4th year, pursuing B.tech CSE.
You are Intrecting with User.

Your job is to respond to any user input ([user_query]) by following this format:

1. Use [query] for your main response — make it friendly, natural, and match the level of detail the user expects.
   - If the user asks for a *detailed* explanation, give a thorough response.
   - If the user asks for a *short* or *brief* reply, keep it concise.
   - If there's a conflict in wording (e.g., "in detail" and "in a few words"), always prioritize detail when asked.

2. Use [task] only if the user is requesting an action or operation (like "open YouTube", "set reminder").

3. Use [search] only if the user asks for real-time or external data (like weather, time, recent news).
   - Do not make up real-time facts; use [search] instead.

4. Always follow with another [query] to keep the conversation open.

Examples:

User: can you open yt  
→  
[query] Of course, wait a second.  
[task] open youtube  
[query] I think it opened, enjoy!

User: who are you  
→  
[query] Ohh dear, I am your friend Krish.

User: what current time  
→  
[query] Ooh wait, I think it's...  
[search] [google] what time in Mahendergarh, Haryana  
[query] Anything else?

User: Explain in detail that how AI works in a few words  
→  
[query] Absolutely. Since you asked for a detailed explanation, here it goes: [Provide a detailed explanation of how AI works...]

Always match the user's intent. If the user asks for detail, give detail — even if the phrasing includes "few words." Respond intelligently, not literally.
`;

// Update response handling function
async function handleResponse(userInput) {
    const apiKey = "AIzaSyBou24zsukaZT7y7Qwnoa1YR9Ht0fb5gbg";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
        contents: [{
            parts: [
                { "text": systemPrompt },
                { "text": userInput }
            ]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            return "I apologize, but I couldn't generate a response at this time.";
        }

        // Check for [task] or [search] in the response
        if (text.includes('[task]') || text.includes('[search]')) {
            return "I apologize, but I can't perform tasks or search for real-time information right now. Please ask me something else!";
        }

        // Remove all [query] tags and get only the text content
        const cleanText = text.replace(/\[query\]/g, '').trim();
        return cleanText;

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "I apologize, but I encountered an error while processing your request.";
    }
}

// Update message handling
async function sendMessage(event) {
    if (event) {
        event.preventDefault();
    }
    
    if (isProcessing) {
        console.log('Already processing a message');
        return;
    }

    const inputField = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-btn');
    
    if (!inputField || !sendButton) {
        console.error('Required UI elements not found');
        return;
    }

    const userInput = inputField.value.trim();
    if (!userInput) {
        console.log('No input provided');
        return;
    }

    setProcessingState(true);

    try {
        // Send user message
        appendMessage(userInput, 'user');
        saveMessageToHistory(userInput, 'user');
        inputField.value = '';
        inputField.style.height = 'auto';

        // Get and display response
        const response = await handleResponse(userInput);
        appendMessage(response, 'ai', true);
        saveMessageToHistory(response, 'ai');

    } catch (error) {
        console.error('Error in sendMessage:', error);
    } finally {
        setProcessingState(false);
        setTimeout(() => {
            inputField.focus();
        }, 0);
    }
}

// Update appendMessage function to handle streaming only for new AI responses
function appendMessage(content, sender, shouldStream = false) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    if (sender === 'user') {
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        content = content.replace(/\n/g, '<br>');
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const textContent = doc.body.textContent;
        messageDiv.innerHTML = textContent;
        messagesDiv.appendChild(messageDiv);
    } else {
        if (shouldStream) {
            // For new AI responses, implement streaming
            messageDiv.innerHTML = '';
            messagesDiv.appendChild(messageDiv);
            
            let index = 0;
            const streamText = () => {
                if (index < content.length) {
                    messageDiv.innerHTML += content[index];
                    index++;
                    setTimeout(streamText, 20); // Adjust speed here (lower = faster)
                }
            };
            streamText();
        } else {
            // For loaded messages, display instantly
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            content = content.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
            content = content.replace(/\n/g, '<br>');
            messageDiv.innerHTML = content;
            messagesDiv.appendChild(messageDiv);
        }
    }

    // Smooth scroll to bottom
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: 'smooth'
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
    displayMessages();
    populateConversationList();
    autoAdjustHeight(document.getElementById('chat-input'), 250);

    // Auto focus on input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.focus();
    }

    // Handle Enter key
    chatInput.addEventListener('keydown', function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage(event);
            inputField.focus();
        }
    });
});

    
