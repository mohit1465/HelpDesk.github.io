const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const logoimg = document.getElementById('logo');
const footerlogoimg = document.getElementById('footerLogo');

// Global variables for speech control
let currentSpeech = null;
let speechStartTime = 0;
let speechDuration = 0;
let speechProgressInterval = null;
let currentSpeechText = '';
let isDragging = false;
let isSeeking = false;
let words = [];

// Enhanced message formatting and UI features
let isTyping = false;
let typingTimeout = null;

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
   - You can use emojis in your responses to make them more engaging and friendly.

2. Use [task] only if the user is requesting an action or operation (like "open YouTube", "set reminder").

3. Use [search] only if the user asks for real-time or external data (like weather, time, recent news).
   - Do not make up real-time facts; use [search] instead.

4. Always follow with another [query] to keep the conversation open.

5. Use [code] {code_language} for a code block.

Examples:

User: can you open yt  
→  
[query] Of course, wait a second! 🚀  
[task] open youtube  
[query] I think it opened, enjoy! 🎉

User: who are you  
→  
[query] Ohh dear, I am your friend Krish! 🤖✨

User: what current time  
→  
[query] Ooh wait, I think it's... ⏰  
[search] [google] what time in Mahendergarh, Haryana  
[query] Anything else? 😊

User: write a hello world in python
→
[query] Here is a simple "Hello, World!" program in Python: 🐍
[code] python
print("Hello, World!")
[query] Let me know if you want to see it in another language! 💻

User: Explain in detail that how AI works in a few words  
→  
[query] Absolutely! Since you asked for a detailed explanation, here it goes: 🤖 [Provide a detailed explanation of how AI works...]

Always match the user's intent. If the user asks for detail, give detail — even if the phrasing includes "few words." Respond intelligently, not literally. You can also use emoji in reply to make conversations more engaging and friendly! 😊

Now reply User :
`;

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

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid API Response:', data);
            throw new Error('Invalid response format from API');
        }

        const text = data.candidates[0].content.parts[0].text;
        
        return text;

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

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Enhanced markdown parsing
function enhancedFormatAIResponse(text) {
    if (!text) return '';

    // Remove any closing [/code] tags that may appear
    text = text.replace(/\[\/code\]/gi, '');

    // Handle code blocks with language detection
    text = text.replace(/\[code\]\s*(\w+)\n([\s\S]*?)(?=\[\w+\]|$)/g, (_match, language, code) => {
        return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Handle regular markdown code blocks
    text = text.replace(/```(\w+)?\s*([\s\S]*?)```/g, (_match, lang, code) => {
        const language = lang || '';
        return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Remove AI response tags
    text = text.replace(/\[query\]/g, '');
    text = text.replace(/\[task\]\s*(.*?)(?=\[\w+\]|$)/g, `<p><i>Task: I can't do this yet.</i></p>`);
    text = text.replace(/\[search\]\s*(.*?)(?=\[\w+\]|$)/g, `<p><i>Search: I can't do this yet.</i></p>`);

    // Enhanced markdown parsing
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Handle code blocks
        if (line.includes('<pre><code>')) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += line;
            inCodeBlock = true;
            continue;
        }

        if (inCodeBlock && line.includes('</code></pre>')) {
            html += line;
            inCodeBlock = false;
            continue;
        }

        if (inCodeBlock) {
            html += line + '\n';
            continue;
        }

        // Handle bold text with different sizes
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.2em;">$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<strong style="font-size: 1.1em;">$1</strong>');

        // Handle italic text
        line = line.replace(/\_(.*?)\_/g, '<em>$1</em>');

        // Handle links
        line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--buttons-bg);">$1</a>');

        // Handle lists
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            const indent = line.match(/^\s*/)[0].length;
            const content = line.trim().substring(2);
            if (indent > 1) {
                html += `<ul><li>${content}</li></ul>`;
            } else {
                html += `<li>${content}</li>`;
            }
        } else if (line.trim().match(/^\d+\./)) {
            if (!inList) {
                html += '<ol>';
                inList = true;
            }
            const content = line.trim().replace(/^\d+\.\s*/, '');
            html += `<li>${content}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (line.trim().length > 0) {
                html += `<p>${line}</p>`;
            }
        }
    }

    if (inList) {
        html += '</ul>';
    }

    return html.replace(/<p>([\s\S]*?)<\/p>/g, (match, content) => {
        return `<p>${content.replace(/\n/g, '<br>')}</p>`;
    });
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
        // Add user message with timestamp
        appendMessage(message, 'user');
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Show typing indicator
        showTypingIndicator();

        // Get AI response
        const response = await handleResponse(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        const chat = chats.find(c => c.id === currentChatId);
        const messageIndex = chat ? chat.messages.length : -1;
        appendMessage(response, 'ai', true, message, messageIndex, true);
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        appendMessage("I apologize, but I encountered an error. Please try again.", 'ai');
    } finally {
        isProcessing = false;
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        chatInput.focus();
    }
}

// Append message to chat
function appendMessage(content, sender, save = true, userQuery = null, messageIndex = -1, stream = false, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    messageDiv.appendChild(contentDiv);

    if (sender === 'ai' && stream) {
        // Streaming animation for new AI responses
        let i = 0;
        const formatted = enhancedFormatAIResponse(content);
        // Remove HTML tags for animation, but keep tags for final rendering
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formatted;
        const plainText = tempDiv.textContent || '';
        let displayText = '';
        function animate() {
            if (i < plainText.length) {
                // Animate character by character
                displayText += plainText[i] === '\n' ? '<br>' : plainText[i];
                contentDiv.innerHTML = displayText + '<span class="blinking-cursor">|</span>';
                i++;
                setTimeout(animate, 12); // Adjust speed here
            } else {
                contentDiv.innerHTML = formatted;
                // Attach action icons after animation
                addAIMessageActions(messageDiv, contentDiv, content, userQuery, messageIndex);
                // Add timestamp for AI messages
                const timestampDiv = document.createElement('div');
                const timeToShow = timestamp
                    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                timestampDiv.className = 'message-timestamp';
                timestampDiv.textContent = timeToShow;
                timestampDiv.style.fontSize = '0.75rem';
                timestampDiv.style.color = 'var(--text-color)';
                timestampDiv.style.opacity = '0.6';
                timestampDiv.style.marginTop = '5px';
                timestampDiv.style.textAlign = 'right';
                messageDiv.appendChild(timestampDiv);
            }
        }
        animate();
    } else if (sender === 'ai') {
        contentDiv.innerHTML = enhancedFormatAIResponse(content);
        addAIMessageActions(messageDiv, contentDiv, content, userQuery, messageIndex);
        // Add timestamp for AI messages
        const timestampDiv = document.createElement('div');
        const timeToShow = timestamp
            ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = timeToShow;
        timestampDiv.style.fontSize = '0.75rem';
        timestampDiv.style.color = 'var(--text-color)';
        timestampDiv.style.opacity = '0.6';
        timestampDiv.style.marginTop = '5px';
        timestampDiv.style.textAlign = 'right';
        messageDiv.appendChild(timestampDiv);
    } else {
        contentDiv.textContent = content;
        // Add timestamp for user messages at the bottom
        const timestampDiv = document.createElement('div');
        const timeToShow = timestamp
            ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = timeToShow;
        timestampDiv.style.fontSize = '0.75rem';
        timestampDiv.style.color = 'var(--text-color)';
        timestampDiv.style.opacity = '0.6';
        timestampDiv.style.marginTop = '5px';
        timestampDiv.style.textAlign = 'right';
        messageDiv.appendChild(timestampDiv);
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();

    if (save && currentChatId) {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            const messageToSave = { content, sender, timestamp: new Date().toISOString() };
            if (sender === 'ai' && userQuery) {
                messageToSave.userQuery = userQuery;
            }
            chat.messages.push(messageToSave);
            if (chat.messages.length === 1 && sender === 'user') {
                chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
            }
            saveChats();
            renderChatHistory();
        }
    }
}

function addAIMessageActions(messageDiv, contentDiv, content, userQuery, messageIndex) {
    // Remove any existing .message-actions in this message
    const oldActions = messageDiv.querySelectorAll('.message-actions');
    oldActions.forEach(el => el.remove());
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';

    const copyBtn = document.createElement('i');
    copyBtn.className = 'fas fa-copy message-action-btn';
    copyBtn.title = 'Copy';
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(contentDiv.innerText).then(() => {
            copyBtn.className = 'fas fa-check message-action-btn';
            setTimeout(() => {
                copyBtn.className = 'fas fa-copy message-action-btn';
            }, 2000);
        });
    });

    const speakBtn = document.createElement('i');
    speakBtn.className = 'fas fa-volume-up message-action-btn';
    speakBtn.title = 'Speak';
    speakBtn.addEventListener('click', () => {
        // Get the plain text content, excluding code blocks
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Remove all code blocks and pre elements
        tempDiv.querySelectorAll('pre, code').forEach(block => block.remove());
        
        // Get the remaining text
        let textContent = tempDiv.textContent.trim();
        
        // Remove AI response tags and special symbols
        textContent = textContent
            .replace(/\[query\]/gi, '') // Remove [query] tags
            .replace(/\[code\].*?\[\/code\]/gis, '') // Remove [code] blocks
            .replace(/\[task\].*?\[\/task\]/gis, '') // Remove [task] blocks
            .replace(/\[search\].*?\[\/search\]/gis, '') // Remove [search] blocks
            .replace(/\[code\].*?(?=\[|$)/gis, '') // Remove [code] without closing tag
            .replace(/\[task\].*?(?=\[|$)/gis, '') // Remove [task] without closing tag
            .replace(/\[search\].*?(?=\[|$)/gis, '') // Remove [search] without closing tag
            .replace(/[`*]/g, '') // Remove backticks and asterisks
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove emojis
            .trim();
        
        // Only speak if there's meaningful content left
        if (textContent.length > 10) {
            if (window.speechSynthesis) {
                if (speechSynthesis.getVoices().length === 0) {
                    speechSynthesis.onvoiceschanged = () => {
                        speakText(textContent);
                    };
                } else {
                    speakText(textContent);
                }
            }
        } else {
            showFeedbackToast('No readable content to speak');
        }
    });

    // Add code copy buttons to all code blocks in this message
    contentDiv.querySelectorAll('pre > code').forEach(codeBlock => {
        // Prevent duplicate buttons
        if (codeBlock.parentElement.querySelector('.code-copy-btn')) return;
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.title = 'Copy code';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 1500);
            });
        });
        codeBlock.parentElement.style.position = 'relative';
        codeBlock.parentElement.appendChild(copyBtn);
    });

    const likeBtn = document.createElement('i');
    likeBtn.className = 'fas fa-thumbs-up message-action-btn';
    likeBtn.title = 'Like';
    likeBtn.addEventListener('click', () => showFeedbackToast('Thanks for your feedback!'));
    
    const dislikeBtn = document.createElement('i');
    dislikeBtn.className = 'fas fa-thumbs-down message-action-btn';
    dislikeBtn.title = 'Dislike';
    dislikeBtn.addEventListener('click', () => showFeedbackToast('Thanks for your feedback!'));

    const rewriteBtn = document.createElement('i');
    rewriteBtn.className = 'fas fa-sync-alt message-action-btn';
    rewriteBtn.title = 'Rewrite';

    if (userQuery) {
        rewriteBtn.addEventListener('click', async () => {
            const originalContent = contentDiv.innerHTML;
            try {
                contentDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                const chat = chats.find(c => c.id === currentChatId);
                
                if (!chat || !chat.messages[messageIndex]) {
                    console.error('Rewrite failed: Could not find chat or message data.');
                    Swal.fire({ text: 'Error: Could not find the message to rewrite.', icon: 'error' });
                    contentDiv.innerHTML = originalContent;
                    return;
                }

                const newResponse = await handleResponse(userQuery);
                
                // Animate the new response
                let i = 0;
                const formatted = enhancedFormatAIResponse(newResponse);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = formatted;
                const plainText = tempDiv.textContent || '';
                let displayText = '';
                function animate() {
                    if (i < plainText.length) {
                        displayText += plainText[i] === '\n' ? '<br>' : plainText[i];
                        contentDiv.innerHTML = displayText + '<span class="blinking-cursor">|</span>';
                        i++;
                        setTimeout(animate, 12);
                    } else {
                        contentDiv.innerHTML = formatted;
                        chat.messages[messageIndex].content = newResponse;
                        saveChats();
                        addAIMessageActions(messageDiv, contentDiv, newResponse, userQuery, messageIndex);
                    }
                }
                animate();
            } catch (error) {
                console.error('An error occurred during rewrite:', error);
                Swal.fire({ text: 'An unexpected error occurred. Please try again.', icon: 'error' });
                contentDiv.innerHTML = originalContent;
            }
        });
    }

    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(speakBtn);
    actionsDiv.appendChild(likeBtn);
    actionsDiv.appendChild(dislikeBtn);
    actionsDiv.appendChild(rewriteBtn);
    messageDiv.appendChild(actionsDiv);
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
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize speech synthesis
    if (window.speechSynthesis) {
        // Load voices
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
            };
        } else {
            console.log('Voices already available');
        }

        // Resume speech synthesis if it was paused
        speechSynthesis.onpause = () => {
            console.log('Speech synthesis paused, resuming...');
            speechSynthesis.resume();
        };
    } else {
        console.error('Speech synthesis not supported in this browser');
    }

    // Add event listeners for speech controls
    const speechStop = document.getElementById('speech-stop');
    const speechProgress = document.getElementById('speech-progress');

    if (speechStop) {
        speechStop.addEventListener('click', () => {
            if (currentSpeech) {
                window.speechSynthesis.cancel();
                currentSpeech = null;
                hideSpeechControl();
            }
        });
    }

    if (speechProgress) {
        // Handle progress bar interaction
        speechProgress.addEventListener('mousedown', () => {
            isDragging = true;
            if (speechProgressInterval) {
                clearInterval(speechProgressInterval);
            }
        });

        speechProgress.addEventListener('mouseup', () => {
            isDragging = false;
            if (currentSpeechText) {
                const percentage = speechProgress.value;
                const wordPosition = Math.floor((percentage / 100) * words.length);
                const remainingText = getTextFromWordPosition(currentSpeechText, wordPosition);
                speakFromPosition(remainingText, percentage);
            }
        });

        speechProgress.addEventListener('input', (e) => {
            if (currentSpeechText) {
                const percentage = e.target.value;
                const wordPosition = Math.floor((percentage / 100) * words.length);
                const remainingText = getTextFromWordPosition(currentSpeechText, wordPosition);
                
                // Update the speech text display
                const speechText = document.getElementById('speech-text');
                if (speechText) {
                    speechText.textContent = remainingText.length > 50 ? 
                        remainingText.substring(0, 47) + '...' : 
                        remainingText;
                }
            }
        });
    }
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

// Memory Management
const MAX_CHATS = 50; // Maximum number of chats to store
const MEMORY_THRESHOLD = 0.8; // 80% memory threshold

// Function to estimate memory usage
function estimateMemoryUsage() {
    try {
        const memoryInfo = performance.memory;
        if (memoryInfo) {
            return memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
        }
    } catch (e) {
        console.warn('Memory info not available:', e);
    }
    return 0;
}

// Function to clean up old chats
function cleanupOldChats() {
    if (chats.length > MAX_CHATS) {
        // Sort chats by creation date (oldest first)
        chats.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Keep only the most recent MAX_CHATS
        chats = chats.slice(-MAX_CHATS);
        saveChats();
        
        // If we're still in a high memory situation, remove older messages from remaining chats
        if (estimateMemoryUsage() > MEMORY_THRESHOLD) {
            chats.forEach(chat => {
                if (chat.messages.length > 20) { // Keep only last 20 messages per chat
                    chat.messages = chat.messages.slice(-20);
                }
            });
            saveChats();
        }
    }
}

// Modify the saveChats function to include memory management
function saveChats() {
    try {
        // Check memory usage before saving
        if (estimateMemoryUsage() > MEMORY_THRESHOLD) {
            cleanupOldChats();
        }
        
        localStorage.setItem('chats', JSON.stringify(chats));
    } catch (e) {
        console.error('Error saving chats:', e);
        // If saving fails, try to clean up and save again
        cleanupOldChats();
        try {
            localStorage.setItem('chats', JSON.stringify(chats));
        } catch (e2) {
            console.error('Failed to save chats after cleanup:', e2);
            // If still failing, clear all chats and start fresh
            chats = [];
            localStorage.removeItem('chats');
        }
    }
}

// Add periodic memory check
setInterval(() => {
    if (estimateMemoryUsage() > MEMORY_THRESHOLD) {
        cleanupOldChats();
    }
}, 60000); // Check every minute

// Modify createNewChat to include memory check
function createNewChat() {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    // Check memory before adding new chat
    if (estimateMemoryUsage() > MEMORY_THRESHOLD) {
        cleanupOldChats();
    }
    
    chats.unshift(newChat);
    saveChats();
    renderChatHistory();
    switchToChat(chatId);
}

// Render chat history
function renderChatHistory() {
    chatHistoryList.innerHTML = '';
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
        chatItem.setAttribute('data-id', chat.id);
        chatItem.innerHTML = `
            <div class="chat-icon">
                <i class="fas fa-comment"></i>
            </div>
            <div class="chat-info">
                <div class="chat-title">${chat.title}</div>
                <div class="chat-preview">${chat.messages[0]?.content || 'No messages yet'}</div>
            </div>
            <div class="chat-item-options">
                <i class="fas fa-ellipsis-v"></i>
            </div>
            <div class="options-menu">
                <div class="option-item rename-option">
                    <i class="fas fa-edit"></i> Rename
                </div>
                <div class="option-item delete-option">
                    <i class="fas fa-trash"></i> Delete
                </div>
            </div>
        `;
        
        // Click to switch chat
        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.options-menu') && !e.target.closest('.chat-item-options')) {
                switchToChat(chat.id);
            }
        });

        // Right-click to open options menu
        chatItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const optionsMenu = chatItem.querySelector('.options-menu');
            
            // Close all other open menus first
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                if (menu !== optionsMenu) menu.classList.remove('active');
            });
            
            optionsMenu.classList.add('active');
        });

        // Double click to rename
        chatItem.addEventListener('dblclick', (e) => {
            if (!e.target.closest('.options-menu') && !e.target.closest('.chat-item-options')) {
                startRenaming(chatItem, chat);
            }
        });

        // Options menu click
        const optionsBtn = chatItem.querySelector('.chat-item-options');
        const optionsMenu = chatItem.querySelector('.options-menu');
        
        optionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other open menus
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                if (menu !== optionsMenu) menu.classList.remove('active');
            });
            optionsMenu.classList.toggle('active');
        });

        // Handle rename option
        const renameOption = chatItem.querySelector('.rename-option');
        renameOption.addEventListener('click', () => {
            startRenaming(chatItem, chat);
            optionsMenu.classList.remove('active');
        });

        // Handle delete option
        const deleteOption = chatItem.querySelector('.delete-option');
        deleteOption.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this chat?')) {
                deleteChat(chat.id);
            }
            optionsMenu.classList.remove('active');
        });

        chatHistoryList.appendChild(chatItem);
    });

    // Close options menu when clicking outside
    document.addEventListener('click', (e) => {
        // If clicking on a chat item, close other options menus but keep the clicked one open
        const clickedChatItem = e.target.closest('.chat-item');
        if (clickedChatItem) {
            const clickedOptionsMenu = clickedChatItem.querySelector('.options-menu');
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                if (menu !== clickedOptionsMenu) {
                    menu.classList.remove('active');
                }
            });
        } else if (!e.target.closest('.options-menu') && !e.target.closest('.chat-item-options')) {
            // If clicking outside chat items and options, close all menus
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });

    // Close options menu when right-clicking outside
    document.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('.options-menu') && !e.target.closest('.chat-item')) {
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
}

// Function to start renaming a chat
function startRenaming(chatItem, chat) {
    const titleElement = chatItem.querySelector('.chat-title');
    const currentTitle = titleElement.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'chat-title-edit';
    input.value = currentTitle;
    
    titleElement.innerHTML = '';
    titleElement.appendChild(input);
    input.focus();
    
    // Select all text
    input.setSelectionRange(0, input.value.length);
    
    function saveRename() {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            chat.title = newTitle;
            saveChats();
            renderChatHistory();
        } else {
            titleElement.textContent = currentTitle;
        }
    }
    
    input.addEventListener('blur', saveRename);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        } else if (e.key === 'Escape') {
            titleElement.textContent = currentTitle;
        }
    });
}

// Function to delete a chat
function deleteChat(chatId) {
    chats = chats.filter(chat => chat.id !== chatId);
    saveChats();
    
    if (currentChatId === chatId) {
        if (chats.length > 0) {
            switchToChat(chats[0].id);
        } else {
            createNewChat();
        }
    } else {
        renderChatHistory();
    }
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
        
        // Add default AI message if chat is empty, without saving it
        if (chat.messages.length === 0) {
            appendMessage("Hello! I'm Krish, your AI assistant. How can I help you today?", 'ai', false);
        } else {
            // Load chat messages without re-saving them
            chat.messages.forEach((msg, index) => {
                appendMessage(msg.content, msg.sender, false, msg.userQuery, index, false, msg.timestamp);
            });
        }
        
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

// Initialize chat history
newChatBtn.addEventListener('click', createNewChat);

// Create initial chat if none exists, or load the latest one
if (chats.length === 0) {
    createNewChat();
} else {
    renderChatHistory();
    switchToChat(chats[0].id); // Switch to the most recent chat
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

// Add this function at the end of the file or before appendMessage
function showFeedbackToast(message) {
    // Inject custom styles only once
    if (!document.getElementById('custom-feedback-toast-style')) {
        const style = document.createElement('style');
        style.id = 'custom-feedback-toast-style';
        style.innerHTML = `
        .custom-feedback-toast {
            background: var(--background-color);
            color: var(--text-color);
            border-radius: 18px;
            margin-top: 30px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.13);
            padding: 18px 32px;
            font-family: 'Quicksand', 'Segoe UI', Arial, sans-serif;
            font-size: 1.08rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            border: 1.5px solid var(--buttons-bg);
            z-index: 9999;
        }
        .custom-feedback-toast .feedback-icon {
            color: var(--buttons-bg);
            font-size: 1.5rem;
            animation: feedback-check-bounce 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes feedback-check-bounce {
            0% { transform: scale(0.2); opacity: 0; }
            60% { transform: scale(1.2); opacity: 1; }
            80% { transform: scale(0.95); }
            100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 600px) {
            .custom-feedback-toast { padding: 12px 16px; font-size: 0.98rem; }
        }
        `;
        document.head.appendChild(style);
    }
    // Remove any existing toast
    const oldToast = document.getElementById('custom-feedback-toast');
    if (oldToast) oldToast.remove();
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'custom-feedback-toast';
    toast.id = 'custom-feedback-toast';
    toast.innerHTML = `<span class="feedback-icon"><i class="fas fa-check-circle"></i></span> <span>${message}</span>`;
    document.body.appendChild(toast);
    // Position toast (top right)
    toast.style.position = 'fixed';
    toast.style.top = '32px';
    toast.style.right = '32px';
    toast.style.transition = 'opacity 0.4s';
    toast.style.opacity = '1';
    // Remove after 2 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.remove(); }, 400);
    }, 1800);
}

// Function to update speech progress
function updateSpeechProgress() {
    if (!currentSpeech || isDragging || isSeeking) return;
    
    const progress = document.getElementById('speech-progress');
    if (progress) {
        const elapsed = Date.now() - speechStartTime;
        const percentage = Math.min((elapsed / speechDuration) * 100, 100);
        progress.value = percentage;
    }
}

// Function to show speech control
function showSpeechControl(text) {
    const speechControl = document.getElementById('speech-control');
    const speechText = document.getElementById('speech-text');
    const progress = document.getElementById('speech-progress');
    
    if (speechControl && speechText && progress) {
        speechText.textContent = text.length > 50 ? text.substring(0, 47) + '...' : text;
        progress.value = 0;
        speechControl.style.display = 'block';
    }
}

// Function to hide speech control
function hideSpeechControl() {
    if (isSeeking) return; // Don't hide if seeking
    const speechControl = document.getElementById('speech-control');
    if (speechControl) {
        speechControl.style.display = 'none';
    }
    if (speechProgressInterval) {
        clearInterval(speechProgressInterval);
        speechProgressInterval = null;
    }
}

// Function to get text from word position
function getTextFromWordPosition(text, wordPosition) {
    words = text.split(/\s+/);
    if (wordPosition >= words.length) return '';
    return words.slice(wordPosition).join(' ');
}

// Function to speak text from position
function speakFromPosition(text, startPosition) {
    isSeeking = true;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice to Google UK English Male
    const voices = speechSynthesis.getVoices();
    const ukVoice = voices.find(voice => voice.name === 'Google UK English Male');
    if (ukVoice) {
        utterance.voice = ukVoice;
    }

    // Set speech parameters
    utterance.rate = 1;
    utterance.pitch = 0.8;
    utterance.volume = 1;

    // Calculate duration and start time
    const wordCount = words.length;
    speechDuration = (wordCount / 150) * 60 * 1000;
    speechStartTime = Date.now() - (startPosition / 100) * speechDuration;

    // Add event listeners
    utterance.onstart = () => {
        currentSpeech = utterance;
        isSeeking = false;
        if (!isDragging) {
            showSpeechControl(text);
            speechProgressInterval = setInterval(updateSpeechProgress, 100);
        }
    };

    utterance.onend = () => {
        currentSpeech = null;
        hideSpeechControl();
    };

    utterance.onerror = () => {
        currentSpeech = null;
        hideSpeechControl();
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
}

// Function to speak text
function speakText(text) {
    console.log('Starting speech synthesis');
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    currentSpeechText = text;
    words = text.split(/\s+/);
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice to Google UK English Male
    const voices = speechSynthesis.getVoices();
    console.log('Available voices:', voices);
    
    // Try to find a suitable voice
    let selectedVoice = voices.find(voice => voice.name === 'Google UK English Male');
    if (!selectedVoice) {
        // Fallback to any English voice
        selectedVoice = voices.find(voice => voice.lang.startsWith('en-'));
    }
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name);
    } else {
        console.log('Using default voice');
    }

    // Set speech parameters
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    // Calculate duration and start time
    const wordCount = words.length;
    speechDuration = (wordCount / 150) * 60 * 1000;
    speechStartTime = Date.now();

    // Add event listeners
    utterance.onstart = () => {
        console.log('Speech started');
        currentSpeech = utterance;
        showSpeechControl(text);
        speechProgressInterval = setInterval(updateSpeechProgress, 100);
    };

    utterance.onend = () => {
        console.log('Speech ended');
        currentSpeech = null;
        hideSpeechControl();
    };

    utterance.onerror = (event) => {
        console.error('Speech error:', event);
        currentSpeech = null;
        hideSpeechControl();
    };

    // Speak the text
    try {
        // Ensure speech synthesis is ready
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        // Add a small delay before speaking
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
            console.log('Speech synthesis initiated');
        }, 100);
    } catch (error) {
        console.error('Error starting speech:', error);
    }
}

// Function to add speak icon to message
function addSpeakIcon(messageDiv, content) {
    const speakIcon = document.createElement('i');
    speakIcon.classList.add('fas', 'fa-volume-up', 'speak-icon');
    speakIcon.title = 'Speak';
    
    const tooltip = document.createElement('span');
    tooltip.classList.add('speak-tooltip');
    tooltip.textContent = 'Speak';
    
    speakIcon.addEventListener('click', () => {
        console.log('Speak icon clicked'); // Debug log
        
        // Get the plain text content, excluding code blocks
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Remove all code blocks
        tempDiv.querySelectorAll('pre').forEach(block => block.remove());
        
        // Get the remaining text
        let textContent = tempDiv.textContent.trim();
        
        // Remove special symbols
        textContent = textContent
            .replace(/[`*]/g, '') // Remove backticks and asterisks
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
        
        console.log('Text to speak:', textContent); // Debug log
        
        // Check if speech synthesis is available
        if (!window.speechSynthesis) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Initialize voices if not already done
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = () => {
                console.log('Voices loaded:', speechSynthesis.getVoices());
                speakText(textContent);
            };
        } else {
            speakText(textContent);
        }
    });
    
    messageDiv.appendChild(speakIcon);
    messageDiv.appendChild(tooltip);
}

// Function to show typing indicator
function showTypingIndicator() {
    if (isTyping) return;
    
    isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span style="margin-left: 10px; color: var(--text-color); opacity: 0.7;">AI is typing...</span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

// Function to hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Enhanced scroll to bottom with smooth animation
function scrollToBottom() {
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// Function to add timestamp to messages
function addTimestamp(messageDiv) {
    const actionsDiv = messageDiv.querySelector('.message-actions');
    if (actionsDiv) {
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timestamp.style.fontSize = '0.75rem';
        timestamp.style.color = 'var(--text-color)';
        timestamp.style.opacity = '0.6';
        timestamp.style.marginLeft = 'auto'; // Push to right side
        timestamp.style.alignSelf = 'center';
        actionsDiv.appendChild(timestamp);
    }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to send message
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
        
        // Ctrl+K for new chat
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            createNewChat();
        }
        
        // Ctrl+L to focus input
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            chatInput.focus();
        }
        
        // Escape to close modals/menus
        if (e.key === 'Escape') {
            // Close options menus
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
            
            // Close speech control
            hideSpeechControl();
            
            // Close outer box
            const outerBox = document.querySelector('.outer-box');
            if (outerBox) {
                outerBox.style.transform = 'translateY(100%)';
            }
        }
    });
}
