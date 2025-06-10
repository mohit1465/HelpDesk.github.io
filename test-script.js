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

function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    
    // Toggle the visibility of the user menu
    if (userMenu.style.display === 'none' || userMenu.style.display === '') {
        userMenu.style.display = 'block';
    } else {
        userMenu.style.display = 'none';
    }

    // Hide the user menu if clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = userMenu.contains(event.target);
        const isButtonClick = event.target.closest('.icon-link'); // Check if clicked element is the icon

        if (!isClickInside && !isButtonClick) {
            userMenu.style.display = 'none';
        }
    });
}

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
            if (window.innerWidth < 900) {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            }
        });
        
        overlay.addEventListener('click', () => {
            if (window.innerWidth < 900) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });

        // Add window resize listener to handle screen size changes
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 900) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
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

// =================================================================================================================================

// Chat System Functionality
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
let isProcessing = false;

// System prompt for the AI
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

4. Always follow with another [query] to keep the conversation open.`;

// Auto-resize textarea
function autoResizeTextarea() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    // Reset height to auto to get the correct scrollHeight
    chatInput.style.height = '42px';
    const newHeight = Math.min(chatInput.scrollHeight, 250);
    chatInput.style.height = newHeight + 'px';
}

// Add event listeners for textarea
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('input', autoResizeTextarea);
        chatInput.addEventListener('focus', autoResizeTextarea);
        chatInput.addEventListener('blur', () => {
            chatInput.style.height = '42px';
        });
    }
});

// Handle AI response
async function handleResponse(userInput) {
    const apiKey = "AIzaSyBou24zsukaZT7y7Qwnoa1YR9Ht0fb5gbg";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    try {
        console.log('Sending request to Gemini API...');
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { "text": systemPrompt },
                        { "text": userInput }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid API Response:', data);
            throw new Error('Invalid response format from API');
        }

        const text = data.candidates[0].content.parts[0].text;
        
        if (text.includes('[task]') || text.includes('[search]')) {
            return "I apologize, but I can't perform tasks or search for real-time information right now. Please ask me something else!";
        }

        return text.replace(/\[query\]/g, '').trim();

    } catch (error) {
        console.error('Error in handleResponse:', error);
        if (error.message.includes('API Error')) {
            return "I apologize, but there was an issue connecting to the AI service. Please check your internet connection and try again.";
        } else if (error.message.includes('Invalid response')) {
            return "I apologize, but I received an invalid response from the AI service. Please try again.";
        }
        return "I apologize, but I encountered an error while processing your request. Please try again.";
    }
}

// Handle sending messages
async function sendMessage() {
    if (isProcessing) return;
    
    const message = chatInput.value.trim();
    if (!message) return;

    isProcessing = true;
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        // Add user message
        appendMessage(message, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Get AI response
        const response = await handleResponse(message);
        appendMessage(response, 'ai');
    } catch (error) {
        console.error('Error:', error);
        appendMessage("I apologize, but I encountered an error. Please try again.", 'ai');
    } finally {
        isProcessing = false;
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        chatInput.focus();
    }
}

// Append message to chat
function appendMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    // Focus chat input
    chatInput.focus();
});

// Chat History Functionality
const toggleSidebar = document.getElementById('toggle-sidebar');
const chatHistorySidebar = document.getElementById('chat-history-sidebar');
const chatContainer = document.querySelector('.chat-container');
const chatHistoryList = document.getElementById('chat-history-list');
const newChatBtn = document.getElementById('new-chat-btn');

let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('chats')) || [];

// Toggle sidebar
toggleSidebar.addEventListener('click', () => {
    chatHistorySidebar.classList.toggle('active');
    toggleSidebar.classList.toggle('active');
    chatContainer.classList.toggle('with-sidebar');
});

// Create new chat
function createNewChat() {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    chats.unshift(newChat);
    saveChats();
    renderChatHistory();
    switchToChat(chatId);
}

// Save chats to localStorage
function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

// Render chat history
function renderChatHistory() {
    chatHistoryList.innerHTML = '';
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
        chatItem.setAttribute('data-id', chat.id); // Add data-id attribute
        chatItem.innerHTML = `
            <div class="chat-icon">
                <i class="fas fa-comment"></i>
            </div>
            <div class="chat-info">
                <div class="chat-title">${chat.title}</div>
                <div class="chat-preview">${chat.messages[0]?.content || 'No messages yet'}</div>
            </div>
        `;
        
        chatItem.addEventListener('click', () => switchToChat(chat.id));
        chatHistoryList.appendChild(chatItem);
    });
}

// Switch to a specific chat
function switchToChat(chatId) {
    // Don't switch if it's the same chat
    if (currentChatId === chatId) return;
    
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
        // Clear current messages
        messagesContainer.innerHTML = '';
        
        // Load chat messages
        chat.messages.forEach(msg => {
            appendMessage(msg.content, msg.sender);
        });
        
        // Update active state in sidebar
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`.chat-item[data-id="${chatId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

// Modify the existing appendMessage function to save messages
const originalAppendMessage = appendMessage;
appendMessage = function(content, sender) {
    originalAppendMessage(content, sender);
    
    if (currentChatId) {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages.push({ content, sender });
            if (chat.messages.length === 1) {
                chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
            }
            saveChats();
            renderChatHistory();
        }
    }
};

// Initialize chat history
newChatBtn.addEventListener('click', createNewChat);
renderChatHistory();

// Create initial chat if none exists
if (chats.length === 0) {
    createNewChat();
}

// Add click event listeners to close sidebar
document.querySelector('.chat-messages').addEventListener('click', () => {
    if (chatHistorySidebar.classList.contains('active')) {
        chatHistorySidebar.classList.remove('active');
        toggleSidebar.classList.remove('active');
        chatContainer.classList.remove('with-sidebar');
    }
});

document.querySelector('.chat-input-container').addEventListener('click', () => {
    if (chatHistorySidebar.classList.contains('active')) {
        chatHistorySidebar.classList.remove('active');
        toggleSidebar.classList.remove('active');
        chatContainer.classList.remove('with-sidebar');
    }
});

// Prevent sidebar from closing when clicking inside it
chatHistorySidebar.addEventListener('click', (e) => {
    e.stopPropagation();
});