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
    if (!element) return;

    // Function to adjust height
    const adjustHeight = () => {
        element.style.height = '42px';
        const newHeight = Math.min(element.scrollHeight, maxHeight);
        element.style.height = newHeight + 'px';
    };

    // Handle input event
    element.addEventListener('input', adjustHeight);

    // Handle focus event
    element.addEventListener('focus', () => {
        adjustHeight();
    });

    // Handle blur event
    element.addEventListener('blur', () => {
        element.style.height = '42px';
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

// Function to copy text to clipboard
function copyToClipboard(text, tooltip) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success tooltip for the specific message
        tooltip.textContent = 'Copied!';
        setTimeout(() => {
            tooltip.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
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
        // Get the plain text content, excluding code blocks
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Remove all code blocks
        tempDiv.querySelectorAll('.code-block').forEach(block => block.remove());
        
        // Get the remaining text
        let textContent = tempDiv.textContent.trim();
        
        // Remove special symbols
        textContent = textContent
            .replace(/[`*]/g, '') // Remove backticks and asterisks
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
        
        // Only speak if there's text content (excluding code blocks)
        if (textContent) {
            speakText(textContent);
        }
    });
    
    messageDiv.appendChild(speakIcon);
    messageDiv.appendChild(tooltip);
}

// Global variables for speech control
let currentSpeech = null;
let speechStartTime = 0;
let speechDuration = 0;
let speechProgressInterval = null;
let currentSpeechText = '';
let isDragging = false;
let isSeeking = false;
let words = [];

// Function to update speech progress
function updateSpeechProgress() {
    if (!currentSpeech || isDragging || isSeeking) return;
    
    const progress = document.getElementById('speech-progress');
    const elapsed = Date.now() - speechStartTime;
    const percentage = Math.min((elapsed / speechDuration) * 100, 100);
    progress.value = percentage;
}

// Function to show speech control
function showSpeechControl(text) {
    const speechControl = document.getElementById('speech-control');
    const speechText = document.getElementById('speech-text');
    const progress = document.getElementById('speech-progress');
    
    speechText.textContent = text.length > 50 ? text.substring(0, 47) + '...' : text;
    progress.value = 0;
    speechControl.style.display = 'block';
}

// Function to hide speech control
function hideSpeechControl() {
    if (isSeeking) return; // Don't hide if seeking
    const speechControl = document.getElementById('speech-control');
    speechControl.style.display = 'none';
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
    currentSpeechText = text;
    words = text.split(/\s+/);
    speakFromPosition(text, 0);
}

// Add event listeners for speech controls
document.addEventListener('DOMContentLoaded', function() {
    const speechStop = document.getElementById('speech-stop');
    const speechProgress = document.getElementById('speech-progress');

    speechStop.addEventListener('click', () => {
        if (currentSpeech) {
            window.speechSynthesis.cancel();
            currentSpeech = null;
            hideSpeechControl();
        }
    });

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
            speechText.textContent = remainingText.length > 50 ? 
                remainingText.substring(0, 47) + '...' : 
                remainingText;
        }
    });
});

// Update appendMessage function to add speak icon for AI messages
function appendMessage(content, sender, shouldStream = false) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Function to escape HTML
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Function to add copy button to code block
    const addCopyButtonToCodeBlock = (codeBlock) => {
        const copyButton = document.createElement('button');
        copyButton.classList.add('code-copy-btn');
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        
        // Get the code content
        const code = codeBlock.querySelector('code').textContent;
        
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        });
        
        codeBlock.appendChild(copyButton);
    };

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
                    // Format the content before adding it
                    let formattedContent = content.substring(0, index + 1);
                    
                    // Handle code blocks
                    formattedContent = formattedContent.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, lang, code) => {
                        // Escape HTML in code blocks
                        const escapedCode = escapeHtml(code.trim());
                        return `<div class="code-block"><pre><code class="language-${lang || ''}">${escapedCode}</code></pre></div>`;
                    });
                    
                    // Handle bold text with different sizes
                    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.2em;">$1</strong>');
                    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<strong style="font-size: 1.1em;">$1</strong>');
                    
                    // Handle line breaks
                    formattedContent = formattedContent.replace(/\n/g, '<br>');
                    
                    messageDiv.innerHTML = formattedContent;
                    
                    // Add copy buttons to all code blocks
                    messageDiv.querySelectorAll('.code-block').forEach(addCopyButtonToCodeBlock);
                    
                    index++;
                    setTimeout(streamText, 20); // Adjust speed here (lower = faster)
                }
                // Add copy and speak icons after streaming is complete
                if (index >= content.length) {
                    addCopyIcon(messageDiv, content);
                    addSpeakIcon(messageDiv, content);
                }
            };
            streamText();
        } else {
            // For loaded messages, display instantly
            // Handle code blocks
            content = content.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, lang, code) => {
                // Escape HTML in code blocks
                const escapedCode = escapeHtml(code.trim());
                return `<div class="code-block"><pre><code class="language-${lang || ''}">${escapedCode}</code></pre></div>`;
            });
            
            // Handle bold text with different sizes
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.2em;">$1</strong>');
            content = content.replace(/\*(.*?)\*/g, '<strong style="font-size: 1.1em;">$1</strong>');
            
            // Handle line breaks
            content = content.replace(/\n/g, '<br>');
            
            messageDiv.innerHTML = content;
            
            // Add copy buttons to all code blocks
            messageDiv.querySelectorAll('.code-block').forEach(addCopyButtonToCodeBlock);
            
            messagesDiv.appendChild(messageDiv);
            // Add copy and speak icons for loaded messages
            addCopyIcon(messageDiv, content);
            addSpeakIcon(messageDiv, content);
        }
    }

    // Smooth scroll to bottom
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: 'smooth'
    });
}

// Function to add copy icon to message
function addCopyIcon(messageDiv, content) {
    const copyIcon = document.createElement('i');
    copyIcon.classList.add('fas', 'fa-copy', 'copy-icon');
    copyIcon.title = 'Copy';
    
    const tooltip = document.createElement('span');
    tooltip.classList.add('copy-tooltip');
    tooltip.textContent = 'Copy';
    
    copyIcon.addEventListener('click', () => {
        // Get the plain text content
        const textContent = content.replace(/<[^>]*>/g, '');
        copyToClipboard(textContent, tooltip);
    });
    
    messageDiv.appendChild(copyIcon);
    messageDiv.appendChild(tooltip);
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

    // Initialize speech synthesis voices
    window.speechSynthesis.onvoiceschanged = function() {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices);
    };
});

    
