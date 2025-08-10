// Initialize global variables
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const logoimg = document.getElementById('logo');

// Initialize file system maps
const projectFiles = new Map();
const fileContents = new Map();
const openTabs = new Map();
let projectFolders = new Map();
let activeTab = null;
let selectedFolder = null;
let expandedFolders = new Set();
let isCreatingItem = false;

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, duration);

    // Add click to dismiss
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    });
}

// Confirmation Toast System
function showConfirmToast(message, onConfirm, onCancel = null) {
    return new Promise((resolve) => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.error('Toast container not found');
            resolve(false);
            return;
        }

        const confirmToast = document.createElement('div');
        confirmToast.className = 'toast confirm-toast';
        
        confirmToast.innerHTML = `
            <div class="confirm-message">${message}</div>
            <div class="confirm-buttons">
                <button class="confirm-btn confirm-yes">Yes</button>
                <button class="confirm-btn confirm-no">No</button>
            </div>
        `;

        // Add toast to container
        toastContainer.appendChild(confirmToast);

        const yesBtn = confirmToast.querySelector('.confirm-yes');
        const noBtn = confirmToast.querySelector('.confirm-no');

        function removeToast() {
            if (confirmToast.parentNode) {
                confirmToast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (confirmToast.parentNode) {
                        toastContainer.removeChild(confirmToast);
                    }
                }, 300);
            }
        }

        function handleConfirm() {
            removeToast();
            if (onConfirm) onConfirm();
            resolve(true);
        }

        function handleCancel() {
            removeToast();
            if (onCancel) onCancel();
            resolve(false);
        }

        // Button event listeners
        yesBtn.addEventListener('click', handleConfirm);
        noBtn.addEventListener('click', handleCancel);

        // Click outside to cancel
        function handleOutsideClick(e) {
            if (!confirmToast.contains(e.target)) {
                handleCancel();
                document.removeEventListener('click', handleOutsideClick);
            }
        }

        // Add outside click listener after a short delay to prevent immediate trigger
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);

        // Auto-remove event listener when toast is removed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && !toastContainer.contains(confirmToast)) {
                    document.removeEventListener('click', handleOutsideClick);
                    observer.disconnect();
                }
            });
        });
        observer.observe(toastContainer, { childList: true });
    });
}

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
    
    if (userMenu.style.display === 'none' || userMenu.style.display === '') {
        userMenu.style.display = 'block';
    } else {
        userMenu.style.display = 'none';
    }

    document.addEventListener('click', function(event) {
        const isClickInside = userMenu.contains(event.target);
        const isButtonClick = event.target.closest('.icon-link');

        if (!isClickInside && !isButtonClick) {
            userMenu.style.display = 'none';
        }
    });
}


window.onload = () => {
    const savedTheme = localStorage.getItem('currentTheme') || 'dark';
    setTheme(savedTheme);
};

function setTheme(theme) {
    if (theme === 'dark') {
        monaco.editor.setTheme('hc-black');
        body.setAttribute('data-theme', 'dark');
    } else {
        monaco.editor.setTheme('vs-light');
        body.removeAttribute('data-theme');
    }
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        monaco.editor.setTheme('vs-light');
        body.removeAttribute('data-theme');
        localStorage.setItem('currentTheme', 'light'); // Save theme
    } else {
        // Switch to dark theme
        monaco.editor.setTheme('hc-black');
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('currentTheme', 'dark'); // Save theme
    }
});

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('show');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileFileBtn = document.querySelector('.mobile-file-btn');
    
    if (!mobileMenu.contains(event.target) && !mobileFileBtn.contains(event.target)) {
        mobileMenu.classList.remove('show');
    }
});

// Add event listeners for mobile menu items
document.getElementById('new-file-mobile').addEventListener('click', function() {
    document.getElementById('new-file').click();
    toggleMobileMenu();
});

document.getElementById('open-file-mobile').addEventListener('click', function() {
    document.getElementById('open-file').click();
    toggleMobileMenu();
});

document.getElementById('save-file-mobile').addEventListener('click', function() {
    document.getElementById('save-file').click();
    toggleMobileMenu();
});

document.getElementById('save-as-file-mobile').addEventListener('click', function() {
    document.getElementById('save-as-file').click();
    toggleMobileMenu();
});

document.getElementById('change-name-mobile').addEventListener('click', function() {
    document.getElementById('change-name').click();
    toggleMobileMenu();
});

document.getElementById('save-online-mobile').addEventListener('click', function() {
    document.getElementById('save-online').click();
    toggleMobileMenu();
});

document.getElementById('load-file-mobile').addEventListener('click', function() {
    document.getElementById('load-file').click();
    toggleMobileMenu();
});

function toggleDiv(divId) {
    const div = document.getElementById(divId);
    const leftDiv = document.getElementById('leftDiv');
    const rightDiv = document.getElementById('rightDiv');
    const middleDiv = document.getElementById('middleDiv');
    
    const isMobileView = window.matchMedia('(max-width: 850px)').matches;
    
    if (isMobileView) {
        // For mobile view
        middleDiv.style.width = '100%';
        leftDiv.style.display = 'block';  // Ensure display is block for slide effect
        rightDiv.style.display = 'block'; // Ensure display is block for slide effect

        if (divId === 'leftDiv') {
            div.classList.toggle('show');
            rightDiv.classList.remove('show');
        } else if (divId === 'rightDiv') {
            div.classList.toggle('show');
            leftDiv.classList.remove('show');
        }
    } else {
        // For desktop view
        if (div.style.display === 'none') {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
        }

        if (leftDiv.style.display === 'none' && rightDiv.style.display === 'none') {
            middleDiv.style.width = '100%';
        } else if (leftDiv.style.display === 'none' || rightDiv.style.display === 'none') {
            middleDiv.style.width = '75%';
        } else {
            middleDiv.style.width = '30%';
        }
    }
}

function loadFileIntoTab(fileName, fileContent, fileId) {
    const tabId = fileId || fileName;
    
    // Check if file is already open in a tab
    if (openTabs.has(tabId)) {
        switchToTab(tabId);
        return tabId;
    }
    
    const language = detectLanguageFromExtension(fileName) || 'plaintext';
    
    // Create new tab
    const newTab = {
        id: tabId,
        name: fileName,
        language: language,
        content: fileContent,
        isModified: false,
        folder: null // No folder by default for files loaded from user's files
    };
    
    // Add to project files if not already there
    if (!projectFiles.has(tabId)) {
        projectFiles.set(tabId, {
            name: fileName,
            fullPath: tabId,
            language: language,
            type: 'file',
            folder: null
        });
    }
    
    // Add to open tabs and set as active
    openTabs.set(tabId, newTab);
    fileContents.set(tabId, fileContent);
    
    // Update UI
    updateFileTree();
    updateTabContainer();
    switchToTab(tabId);
    
    // Defer model creation to switchToTab to avoid double-create races
    
    return tabId;
}

async function loadUserFiles() {
    const user = auth.currentUser;

    if (!user) {
        console.log("You must be logged in to load files.");
        return;
    }

    const userFilesContainer = document.getElementById('users-files');
    userFilesContainer.innerHTML = '';

    const filesSnapshot = await db.collection('files').where('userId', '==', user.uid).get();

    if (filesSnapshot.empty) {
        userFilesContainer.innerHTML = '<p>No files found.</p>';
        return;
    }

    filesSnapshot.forEach(doc => {
        const fileData = doc.data();
        const fileID = doc.id;

        const fileElement = document.createElement('div');
        fileElement.textContent = fileData.name;
        fileElement.className = 'file-entry';
        fileElement.onclick = () => loadFileIntoTab(fileData.name, fileData.content, fileID);

        userFilesContainer.appendChild(fileElement);
    });
}

auth.onAuthStateChanged(user => {
    const profileImage = document.querySelector('.profile-header img');
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();

                profileImage.style.display = 'none';

                const firstLetter = userData.name.charAt(0).toUpperCase();
                const nameLetterElement = document.getElementById('profile-initial');
                nameLetterElement.textContent = firstLetter;

                document.getElementById('user-name-email').innerHTML = `
                    <h2 style="margin-bottom:0px;" id='userData'>${userData.name}</h2>
                    <p style="margin: 0; margin: 5px 0;" id='userEmail'>Email: ${userData.email}</p>`;

                document.getElementById('auth-check-option').innerHTML = `
                    <button onclick="logoutUser()" class="edit-profile" style="margin: 1px 0;">Logout</button>`;

                document.getElementById('profilefiles').innerHTML = `
                    <h4>My Files</h4>
                    <div id='users-files'></div>
                    <div id='users-files-bottom-option'>
                        <a href="#"><i class="fas fa-folder-plus bottom-option-icon filesBtn"></i></a>
                        <a href="#"><i class="fas fa-cog bottom-option-icon settings"></i></a>
                    </div>`;

                loadUserFiles();
            }
            else {
                profileImage.style.display = 'block';
                document.getElementById('profile-initial').style.display = 'none';
            
                document.getElementById('user-name-email').innerHTML = `
                    <h2 id='login-magic' onclick='redirectToLogin()' style='margin-bottom: 0px'>Login to See, <span>Magic</span></h2>`;
                document.getElementById('auth-check-option').innerHTML = `
                    <span id="login-signup" onclick="redirectToLogin()" class="edit-profile" style="margin: 8px 0;">Login | signup</span>`;

                document.getElementById('profilefiles').innerHTML = `
                    <div id='users-files-bottom-option'>
                        <a href="#"><i class="fas fa-folder-plus bottom-option-icon filesBtn"></i></a>
                        <a href="#"><i class="fas fa-cog bottom-option-icon settings"></i></a>
                    </div>`;
            }
        }).catch(error => {
            console.error('Error fetching user data:', error);
            showToast('Error fetching user data.', 'error');
        });

    } else {

        profileImage.style.display = 'block';
        document.getElementById('profile-initial').style.display = 'none';
    
        document.getElementById('user-name-email').innerHTML = `
            <h2 id='login-magic' onclick='redirectToLogin()' style='margin-bottom: 0px'>Login to See, <span>Magic</span></h2>`;
        document.getElementById('auth-check-option').innerHTML = `
            <span id="login-signup" onclick="redirectToLogin()" class="edit-profile" style="margin: 8px 0;">Login | signup</span>`;

        
        document.getElementById('profilefiles').innerHTML = `
            <div id='users-files-bottom-option'>
                <a href="#"><i class="fas fa-folder-plus bottom-option-icon filesBtn"></i></a>
                <a href="#"><i class="fas fa-cog bottom-option-icon settings"></i></a>
            </div>`;
    }
});

function logoutUser() {
    auth.signOut().then(() => {
    showToast('Logged out successfully!', 'success');
    });
}

function updateStatusBar() {
    const currentLineEl = document.getElementById('currentLine');
    const currentColumnEl = document.getElementById('currentColumn');
    const totalLinesEl = document.getElementById('totalLines');
    const fileSizeEl = document.getElementById('fileSize');
    
    if (!currentLineEl || !currentColumnEl || !totalLinesEl || !fileSizeEl) {
        return;
    }
    
    // Default values when no file is loaded
    let line = 0, column = 0, totalLines = 0, fileSize = '0 Bytes';
    let hasContent = false;
    
    // If no active tab or no open tabs, reset to defaults
    if (!activeTab || openTabs.size === 0) {
        currentLineEl.textContent = line;
        currentColumnEl.textContent = column;
        totalLinesEl.textContent = totalLines;
        fileSizeEl.textContent = fileSize;
        return;
    }
    
    try {
        if (editor && monaco) {
            // Get cursor position from Monaco Editor
            const position = editor.getPosition();
            const model = editor.getModel();
            
            if (model) {
                const content = model.getValue();
                hasContent = content.length > 0;
                
                if (hasContent) {
                    totalLines = model.getLineCount();
                    
                    if (position) {
                        line = position.lineNumber;
                        column = position.column;
                    }
                    
                    // Calculate file size
                    const sizeInBytes = new Blob([content]).size;
                    fileSize = formatFileSize(sizeInBytes);
                }
            }
        } else {
            // Fallback to textarea if Monaco Editor is not available
            const textarea = document.getElementById('codeEditor');
            if (textarea) {
                const content = textarea.value || '';
                hasContent = content.length > 0;
                
                if (hasContent) {
                    const lines = content.split('\n');
                    totalLines = lines.length;
                    
                    // Calculate cursor position in textarea
                    const cursorPos = textarea.selectionStart;
                    const textBeforeCursor = content.substring(0, cursorPos);
                    const linesBeforeCursor = textBeforeCursor.split('\n');
                    line = linesBeforeCursor.length;
                    column = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
                    
                    // Calculate file size
                    const sizeInBytes = new Blob([content]).size;
                    fileSize = formatFileSize(sizeInBytes);
                }
            }
        }
        
        // Check if we have any active tabs with content
        if (!hasContent && activeTab && openTabs.has(activeTab)) {
            const tabContent = openTabs.get(activeTab).content || '';
            if (tabContent.length > 0) {
                const lines = tabContent.split('\n');
                totalLines = lines.length;
                line = 1;
                column = 1;
                const sizeInBytes = new Blob([tabContent]).size;
                fileSize = formatFileSize(sizeInBytes);
            }
        }
        
    } catch (error) {
        console.log('Error updating status bar:', error);
    }
    
    // Update the status bar elements
    currentLineEl.textContent = line;
    currentColumnEl.textContent = column;
    totalLinesEl.textContent = totalLines;
    fileSizeEl.textContent = fileSize;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    if (i === 0) {
        return bytes + ' ' + sizes[i];
    }
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Initialize status bar updates
function initializeStatusBar() {
    // Update status bar initially
    updateStatusBar();
    
    // Update status bar when Monaco Editor cursor position changes
    if (editor && monaco) {
        editor.onDidChangeCursorPosition(() => {
            updateStatusBar();
        });
        
        editor.onDidChangeModelContent(() => {
            updateStatusBar();
        });
    }
    
    // Update status bar when textarea cursor position changes (fallback)
    const textarea = document.getElementById('codeEditor');
    if (textarea) {
        textarea.addEventListener('input', updateStatusBar);
        textarea.addEventListener('keyup', updateStatusBar);
        textarea.addEventListener('mouseup', updateStatusBar);
        textarea.addEventListener('focus', updateStatusBar);
    }
    
    // Update status bar when switching tabs
    const originalSwitchToTab = window.switchToTab;
    if (originalSwitchToTab) {
        window.switchToTab = function(tabId) {
            originalSwitchToTab(tabId);
            setTimeout(updateStatusBar, 100); // Small delay to ensure editor is updated
        };
    }
}

// Call initializeStatusBar when Monaco Editor is ready
if (typeof initializeMonacoEditor === 'function') {
    const originalInitializeMonacoEditor = initializeMonacoEditor;
    initializeMonacoEditor = function() {
        originalInitializeMonacoEditor();
        setTimeout(initializeStatusBar, 500); // Delay to ensure Monaco is fully loaded
    };
} else {
    // Initialize immediately if Monaco Editor is not used
    document.addEventListener('DOMContentLoaded', initializeStatusBar);
}

// Configuration
const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyBhj1DwaWsftdvpOh5CLHvyCT7yAqAMHrk',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    DEFAULT_LANGUAGE: 'javascript',
    DEFAULT_CODE: '// Welcome to AI Code Editor\n// Start by describing what you want to build in the chat panel!\n\nconsole.log("Hello, World!");'
};

// Global variables
let editor = null;
let currentLanguage = CONFIG.DEFAULT_LANGUAGE;
let chatHistory = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMonacoEditor();
    setupEventListeners();
    initializeFileSystem();
    initializeContextMenu();
    showToast('AI Code Editor initialized successfully!', 'success');
});

// Initialize Monaco Editor
function initializeMonacoEditor() {
    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
    
    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: CONFIG.DEFAULT_CODE,
            language: CONFIG.DEFAULT_LANGUAGE,
            theme: 'vs-light',
            fontSize: 14,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            minimap: { enabled: true },
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 2,
            glyphMargin: false,
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'blink',
            cursorStyle: 'line',
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            fontLigatures: true,
            bracketPairColorization: { enabled: true },
            guides: {
                bracketPairs: true,
                indentation: true
            }
        });

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, function() {
            downloadCode();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, function() {
            formatCode();
        });

        // After Monaco is ready, load files from localStorage so the first file's content is shown in the editor
        if (typeof loadFilesFromLocalStorage === 'function') {
            try {
                loadFilesFromLocalStorage();
            } catch (e) {
                console.error('Failed to load files after Monaco init:', e);
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {

    // Send button
    document.getElementById('sendBtn').addEventListener('click', handleSendMessage);

    // Prompt input
    document.getElementById('promptInput').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Sidebar buttons
    document.getElementById('newFileInExplorerBtn').addEventListener('click', createNewFile);
    document.getElementById('newFolderBtn').addEventListener('click', createNewFolder);
    document.getElementById('refreshBtn').addEventListener('click', refreshFileTree);

    // File tree click events
    document.getElementById('fileTree').addEventListener('click', handleFileTreeClick);
    document.getElementById('fileTree').addEventListener('contextmenu', handleFileTreeRightClick);
    
    // Context menu events
    document.getElementById('contextMenu').addEventListener('click', handleContextMenuClick);
    document.addEventListener('click', hideContextMenu);

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', function() {
        if (editor && activeTab) {
            showConfirmToast(
                'Are you sure you want to clear this file?',
                () => {
                    editor.setValue('');
                    if (activeTab) {
                        fileContents.set(activeTab, '');
                    }
                    showToast('File cleared', 'success');
                },
                () => {
                    showToast('Clear cancelled', 'info');
                }
            );
        }
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadCurrentFile);

    // Format button
    document.getElementById('formatBtn').addEventListener('click', formatCode);

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', copyCode);

    // Clear chat button
    document.getElementById('clearChatBtn').addEventListener('click', function() {
        showConfirmToast(
            'Are you sure you want to clear the chat history?',
            () => {
                clearChat();
                showToast('Chat history cleared', 'success');
            },
            () => {
                showToast('Clear cancelled', 'info');
            }
        );
    });

    // Welcome screen buttons
    const welcomeNewFileBtn = document.getElementById('welcomeNewFileBtn');
    const welcomeOpenFileBtn = document.getElementById('welcomeOpenFileBtn');
    
    if (welcomeNewFileBtn) welcomeNewFileBtn.addEventListener('click', createNewFile);
    if (welcomeOpenFileBtn) welcomeOpenFileBtn.addEventListener('click', openFile);
    
    // Search panel event listeners
    const findPreviousBtn = document.getElementById('find-previous');
    const findNextBtn = document.getElementById('find-next');
    const replaceCurrentBtn = document.getElementById('replace-current');
    const replaceAllBtn = document.getElementById('replace-all');
    const closeSearchBtn = document.getElementById('close-search');
    const searchInput = document.getElementById('search-input');
    const replaceInput = document.getElementById('replace-input');
    
    if (findPreviousBtn) findPreviousBtn.addEventListener('click', findPrevious);
    if (findNextBtn) findNextBtn.addEventListener('click', findNext);
    if (replaceCurrentBtn) replaceCurrentBtn.addEventListener('click', replaceCurrent);
    if (replaceAllBtn) replaceAllBtn.addEventListener('click', replaceAll);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearchPanel);
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(false);
            }, 300);
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    findPrevious();
                } else {
                    findNext();
                }
            } else if (e.key === 'Escape') {
                closeSearchPanel();
            }
        });
    }
    
    if (replaceInput) {
        replaceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                replaceCurrent();
            } else if (e.key === 'Escape') {
                closeSearchPanel();
            }
        });
    }
    
    // Quick start templates
    document.querySelectorAll('.quick-start-item').forEach(item => {
        item.addEventListener('click', function() {
            const template = this.dataset.template;
            createTemplateFile(template);
        });
    });

    // Auto-resize textarea with upward expansion
    const promptInput = document.getElementById('promptInput');
    let isPromptFocused = false;
    
    // Track focus state
    promptInput.addEventListener('focus', function() {
        isPromptFocused = true;
    });
    
    promptInput.addEventListener('blur', function() {
        isPromptFocused = false;
        // Reset to minimum height when not focused and empty
        if (!this.value.trim()) {
            this.style.height = '';
            this.style.marginTop = '';
        }
    });
    
    promptInput.addEventListener('input', function() {
        if (isPromptFocused) {
            // Calculate new height
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 120);
            const minHeight = 48; // Default min height
            
            // Only expand if content requires more space
            if (newHeight > minHeight) {
                const heightDiff = newHeight - minHeight;
                this.style.height = newHeight + 'px';
                // Move the textarea up by the height difference
                this.style.marginTop = `-${heightDiff}px`;
            } else {
                this.style.height = minHeight + 'px';
                this.style.marginTop = '0px';
            }
        }
    });
}

// Handle sending messages
async function handleSendMessage() {
    const promptInput = document.getElementById('promptInput');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showToast('Please enter a prompt', 'error');
        return;
    }
    
    // Add user message to context
    contextManager.addMessage('user', prompt);

    // Disable send button and show loading
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    updateStatus('loading', 'Processing...');
    showLoadingOverlay(true);

    try {
        // Add user message to chat UI
        addMessageToChat('user', prompt);
        promptInput.value = '';
        promptInput.style.height = '';
        promptInput.style.marginTop = '';

        // Get current code from editor
        const currentCode = editor ? editor.getValue() : '';

        // Update file context with current editor state
        const activeTab = window.activeTab;
        if (activeTab) {
            const language = detectLanguageFromExtension(activeTab);
            contextManager.updateFileContext(activeTab, language, currentCode);
        }

        const currentPrompt = prompt;
        
        // Send request to Gemini with full context
        const fullPrompt = `
        You are an expert AI coding assistant integrated into a code editor. Your role is to help users write, modify, and improve code based on their natural language requests.

        IMPORTANT INSTRUCTIONS:
        1. Always respond with complete, working code that can be directly inserted into the editor
        2. When modifying existing code, provide the ENTIRE updated code, not just the changes
        3. Include all necessary imports, dependencies, and setup code
        4. Write clean, well-commented, production-ready code
        5. Follow best practices for the target programming language
        6. If the user's request is unclear, make reasonable assumptions and explain them
        7. Always test your logic before responding
        8. For web development, create modern, responsive, and accessible interfaces
        9. Include error handling where appropriate
        10. Optimize for readability and maintainability

        RESPONSE FORMAT:
        - Provide a brief explanation of what you're doing (1-2 sentences)
        - Then provide the complete code
        - End with any important notes or next steps

        Current editor language: {language}
        Current code in editor: {currentCode}

        User request: {userPrompt}

        Respond with complete, working code that addresses the user's request.
        
        Previous conversation context:\n${contextManager.getFullContext()}\n\nCurrent request: ${prompt}`;
        
        const response = await sendToGemini(fullPrompt, currentCode, currentPrompt);
        
        // Add assistant response to chat and context
        addMessageToChat('assistant', response.explanation);
        contextManager.addMessage('assistant', response.explanation);

        // Auto-apply code if enabled
        const autoApply = document.getElementById('autoApply').checked;
        if (autoApply && response.code && editor) {
            editor.setValue(response.code);
            showToast('Code updated successfully!', 'success');
            
            // Highlight changes (simple animation)
            setTimeout(() => {
                editor.trigger('keyboard', 'editor.action.formatDocument', {});
            }, 100);
        } else if (response.code) {
            // Show code in chat with option to apply
            addCodeToChat(response.code);
        }

        updateStatus('ready', 'Ready');
        
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('assistant', `Sorry, I encountered an error: ${error.message}`);
        updateStatus('error', 'Error');
        showToast('Failed to process request', 'error');
    } finally {
        sendBtn.disabled = false;
        showLoadingOverlay(false);
    }
}

// Send request to Gemini API
async function sendToGemini(fullPrompt, currentCode, currentPrompt) {
    const systemPrompt = fullPrompt
        .replace('{language}', currentLanguage)
        .replace('{currentCode}', currentCode || 'No code in editor')
        .replace('{userPrompt}', currentPrompt);

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: systemPrompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    const response = await fetch(CONFIG.GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': CONFIG.GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
    }

    const fullResponse = data.candidates[0].content.parts[0].text;
    
    // Parse the response to extract explanation and code
    return parseGeminiResponse(fullResponse);
}

// Parse Gemini response to extract explanation and code
function parseGeminiResponse(response) {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
        codeBlocks.push(match[1]);
    }
    
    // Remove code blocks from explanation
    const explanation = response.replace(/```[\w]*\n[\s\S]*?\n```/g, '[Code block - see below]').trim();
    
    // Use the largest code block as the main code
    const code = codeBlocks.length > 0 ? codeBlocks.reduce((a, b) => a.length > b.length ? a : b) : null;
    
    return {
        explanation: explanation || response,
        code: code
    };
}

// Add message to chat
function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Convert markdown-like formatting
    const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    
    messageContent.innerHTML = formattedContent;
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to history
    chatHistory.push({ sender, content, timestamp: new Date() });
}

// Add code block to chat with apply button
function addCodeToChat(code) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const codeContainer = document.createElement('div');
    codeContainer.innerHTML = `
        <p>Here's the generated code:</p>
        <pre><code>${escapeHtml(code)}</code></pre>
        <button class="btn btn-secondary" onclick="applyCode(this)" style="margin-top: 8px;">Apply to Editor</button>
    `;
    
    messageContent.appendChild(codeContainer);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Store code in button for later use
    const applyBtn = messageContent.querySelector('button');
    applyBtn.dataset.code = code;
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Apply code to editor
function applyCode(button) {
    const code = button.dataset.code;
    if (editor && code) {
        editor.setValue(code);
        showToast('Code applied to editor!', 'success');
        button.disabled = true;
        button.textContent = 'Applied ✓';
    }
}

// Update status indicator
function updateStatus(status, text) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = `status-dot ${status}`;
    statusText.textContent = text;
}

// Show/hide loading overlay
function showLoadingOverlay(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize file system
function initializeFileSystem() {
    // Initialize project files
    projectFiles.set('index.html', {
        name: 'index.html',
        language: 'html',
        type: 'file'
    });
    projectFiles.set('styles.css', {
        name: 'styles.css',
        language: 'css',
        type: 'file'
    });
    projectFiles.set('script.js', {
        name: 'script.js',
        language: 'javascript',
        type: 'file'
    });
    projectFiles.set('README.md', {
        name: 'README.md',
        language: 'markdown',
        type: 'file'
    });
    
    // Don't create any initial tabs or files
    activeTab = null;
    updateTabContainer();
    updateFileTree();
    updateEditorVisibility();
}

// Enhanced language detection with more file types
function detectLanguageFromExtension(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const languageMap = {
        // Web
        'js': 'javascript',
        'jsx': 'javascript',
        'mjs': 'javascript',
        'cjs': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'scss',
        'sass': 'sass',
        'less': 'less',
        'styl': 'stylus',
        'vue': 'vue',
        'svelte': 'svelte',
        'astro': 'astro',
        
        // Programming Languages
        'py': 'python',
        'pyw': 'python',
        'java': 'java',
        'c': 'c',
        'h': 'c',
        'cpp': 'cpp',
        'cc': 'cpp',
        'cxx': 'cpp',
        'hpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby',
        'php': 'php',
        'swift': 'swift',
        'kt': 'kotlin',
        'kts': 'kotlin',
        'dart': 'dart',
        'scala': 'scala',
        'groovy': 'groovy',
        'r': 'r',
        'm': 'objectivec',
        'mm': 'objective-cpp',
        
        // Scripting
        'sh': 'shell',
        'bash': 'shell',
        'zsh': 'shell',
        'ps1': 'powershell',
        'bat': 'batch',
        'cmd': 'batch',
        
        // Data
        'json': 'json',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml',
        'toml': 'toml',
        'ini': 'ini',
        'cfg': 'ini',
        'env': 'ini',
        'csv': 'csv',
        'tsv': 'tsv',
        
        // Markup & Documentation
        'md': 'markdown',
        'markdown': 'markdown',
        'rst': 'restructuredtext',
        'tex': 'latex',
        'bib': 'bibtex',
        
        // Database
        'sql': 'sql',
        'pgsql': 'pgsql',
        'mysql': 'mysql',
        'graphql': 'graphql',
        'gql': 'graphql',
        
        // Config
        'gitignore': 'gitignore',
        'dockerfile': 'dockerfile',
        'docker-compose.yml': 'yaml',
        'docker-compose.yaml': 'yaml',
        'makefile': 'makefile',
        'cmakelists.txt': 'cmake',
        
        // Other
        'txt': 'plaintext',
        'log': 'log',
        'diff': 'diff',
        'patch': 'diff'
    };
    
    return languageMap[extension] || 'plaintext';
}

// Get file icon color based on language
function getFileIconColor(language) {
    const colorMap = {
        'javascript': '#f7df1e',
        'typescript': '#3178c6',
        'python': '#3776ab',
        'html': '#e34c26',
        'css': '#1572b6',
        'json': '#000000',
        'markdown': '#083fa1',
        'plaintext': '#888888'
    };
    
    return colorMap[language] || '#cccccc';
}

// Get file icon SVG based on language
function getFileIconSVG(language) {
    const iconMap = {
        'javascript': 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
        'html': 'M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z',
        'css': 'M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z',
        'default': 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
    };
    
    return iconMap[language] || iconMap.default;
}

// Format code
function formatCode() {
    if (editor) {
        editor.trigger('keyboard', 'editor.action.formatDocument', {});
        showToast('Code formatted!', 'success');
    }
}

// Copy code to clipboard
async function copyCode() {
    if (editor) {
        const code = editor.getValue();
        try {
            await navigator.clipboard.writeText(code);
            showToast('Code copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy code:', err);
            showToast('Failed to copy code', 'error');
        }
    }
}

// Tab management functions
function updateTabContainer() {
    const tabContainer = document.getElementById('tabContainer');
    tabContainer.innerHTML = '';
    
    openTabs.forEach((tab, tabId) => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${tabId === activeTab ? 'active' : ''}`;
        tabElement.dataset.file = tabId;
        tabElement.dataset.language = tab.language;
        
        const iconColor = getFileIconColor(tab.language);
        const iconPath = getFileIconSVG(tab.language);
        
        tabElement.innerHTML = `
            <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="${iconColor}">
                <path d="${iconPath}"/>
            </svg>
            <span class="tab-name">${tab.name}${tab.isModified ? ' •' : ''}</span>
            <button class="tab-close" title="Close" onclick="closeTab('${tabId}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        `;
        
        tabElement.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                switchToTab(tabId);
            }
        });
        
        tabContainer.appendChild(tabElement);
    });
}

function switchToTab(tabId) {
    if (!openTabs.has(tabId)) return;
    
    // Save current tab content if there's an active tab and editor
    if (activeTab && editor) {
        const currentContent = editor.getValue();
        fileContents.set(activeTab, currentContent);
        
        // Update the tab's content in openTabs
        const currentTab = openTabs.get(activeTab);
        if (currentTab) {
            currentTab.content = currentContent;
            currentTab.isModified = (currentContent !== currentTab.originalContent);
        }
    }
    
    // Switch to new tab
    activeTab = tabId;
    const tab = openTabs.get(tabId);
    if (!tab) return;
    
    // Update current language and get the content
    currentLanguage = tab.language || detectLanguageFromExtension(tab.name) || 'plaintext';
    const content = fileContents.get(tabId) || tab.content || '';
    
    // Update file context
    contextManager.updateFileContext(tab.name, currentLanguage, content);
    
    // Update editor with the new content
    if (window.monaco && window.monaco.editor) {
        let model = monaco.editor.getModels().find(m => m.uri.toString() === `inmemory://model/${tabId}`);
        
        if (!model) {
            // Create a new model if it doesn't exist
            model = monaco.editor.createModel(
                content,
                currentLanguage,
                monaco.Uri.parse(`inmemory://model/${tabId}`)
            );
        } else {
            // Update existing model
            model.setValue(content);
            monaco.editor.setModelLanguage(model, currentLanguage);
        }
        
        // Set the model to the editor
        if (editor) {
            editor.setModel(model);
        }
    }
    
    // Update UI
    updateTabContainer();
    updateFileTree();
    updateEditorVisibility();
    updateStatusBar();
}

function closeTab(tabId) {
    const tab = openTabs.get(tabId);
    if (!tab) return;
    
    // Check if file is modified
    if (tab.isModified) {
        const shouldSave = confirm(`${tab.name} has unsaved changes. Do you want to save before closing?`);
        if (shouldSave) {
            // In a real app, this would save the file
            showToast(`${tab.name} saved`, 'success');
        }
    }
    
    openTabs.delete(tabId);
    fileContents.delete(tabId);
    
    // If closing active tab, switch to another tab
    if (tabId === activeTab) {
        const remainingTabs = Array.from(openTabs.keys());
        if (remainingTabs.length > 0) {
            switchToTab(remainingTabs[0]);
        } else {
            // Don't create new file if no tabs left - show welcome screen
            activeTab = null;
            updateEditorVisibility();
        }
    }
    
    updateTabContainer();
    updateFileTree();
}

// Add debounce to prevent double execution
let createNewFileTimeout = null;

function createNewFile() {
    console.log('createNewFile called, isCreatingItem:', isCreatingItem);
    if (isCreatingItem) {
        console.log('Already creating item, returning');
        return;
    }
    
    // Debounce to prevent double execution
    if (createNewFileTimeout) {
        console.log('Clearing existing timeout');
        clearTimeout(createNewFileTimeout);
    }
    
    createNewFileTimeout = setTimeout(() => {
        console.log('Creating new file with default name');
        const defaultName = 'untitled.txt';
        createInlineInput('file', defaultName, selectedFolder);
        createNewFileTimeout = null;
    }, 100);
}

// Create inline input for file/folder creation
function createInlineInput(type, defaultName, parentFolder) {
    if (isCreatingItem) return;
    
    isCreatingItem = true;
    
    // Find the container where to insert the input
    const fileTree = document.getElementById('fileTree');
    let container = fileTree;
    let depth = 0;
    
    // If we have a parent folder, calculate depth and expand if needed
    if (parentFolder) {
        // Expand the folder if it's not expanded
        if (!expandedFolders.has(parentFolder)) {
            expandedFolders.add(parentFolder);
            updateFileTree();
        }
        
        // Calculate depth based on folder nesting level
        depth = 12 + (parentFolder.split('/').length) * 16;
        
        // Container remains the main fileTree since we no longer use nested containers
        container = fileTree;
    }
    
    // Create the input element
    const inputElement = document.createElement('div');
    inputElement.className = 'file-item editing';
    inputElement.style.paddingLeft = `${depth}px`;
    
    const iconSvg = type === 'folder' ? 
        `<svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="#888888">
            <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
        </svg>` :
        `<svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="#888888">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>`;
    
    inputElement.innerHTML = `
        ${iconSvg}
        <div class="inline-input-container">
            <input type="text" class="inline-input" value="${defaultName}" data-type="${type}" data-parent="${parentFolder || ''}">
        </div>
    `;
    
    // Insert at the beginning of the container
    container.insertBefore(inputElement, container.firstChild);
    
    // Focus and select the input
    const input = inputElement.querySelector('.inline-input');
    input.focus();
    input.select();
        
    // Handle input events
    const handleKeyDown = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Remove the blur listener to prevent duplicate calls
            input.removeEventListener('blur', handleInlineInputComplete);
            handleInlineInputComplete.call(this);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelInlineInput(inputElement);
        }
    };
    
    input.addEventListener('blur', handleInlineInputComplete);
    input.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listeners when input is removed
    const originalRemove = inputElement.remove;
    inputElement.remove = function() {
        input.removeEventListener('blur', handleInlineInputComplete);
        input.removeEventListener('keydown', handleKeyDown);
        originalRemove.call(this);
    };
}

function createFileOnLoad(filePath, fileName, fileContent) {
    try {
        // Ensure we have a valid file path and name
        if (!filePath || !fileName) {
            console.error('Invalid file path or name', { filePath, fileName });
            return false;
        }

        // Extract parent folder from file path
        const pathParts = filePath.split('/');
        const parentFolder = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : null;
        
        // Check if file already exists in project files
        if (projectFiles.has(filePath)) {
            console.log(`File already exists in project files: ${filePath}`);
            return false;
        }
        
        // Create file data object
        const fileData = {
            id: `file_${Date.now()}`,
            name: fileName,
            path: filePath,
            language: detectLanguageFromExtension(fileName) || 'plaintext',
            content: fileContent,
            isModified: false,
            lastModified: new Date().toISOString(),
            type: 'file',
            folder: parentFolder
        };
        
        // Add to project files and file contents
        projectFiles.set(filePath, fileData);
        fileContents.set(filePath, fileContent);
        
        // Update the file tree to reflect the new file
        updateFileTree();
        
        // Open the file in a tab
        loadFileIntoTab(fileName, fileContent, filePath);
        
        return true;
        
    } catch (error) {
        console.error('Error in createFileOnLoad:', error);
        return false;
    }
}

// Handle completion of inline input
function handleInlineInputComplete() {
    const input = this;
    const inputElement = input.closest('.file-item');
    const type = input.dataset.type;
    const parentFolder = input.dataset.parent || null;
    const name = input.value.trim();
    
    if (!name) {
        cancelInlineInput(inputElement);
        return;
    }
    
    if (type === 'file') {
        createFileFromInput(name, parentFolder);
    } else if (type === 'folder') {
        createFolderFromInput(name, parentFolder);
    }
    
    inputElement.remove();
    isCreatingItem = false;
    updateFileTree();
}

// Cancel inline input
function cancelInlineInput(inputElement) {
    inputElement.remove();
    isCreatingItem = false;
}

// Create file from inline input
function createFileFromInput(name, parentFolder) {
    console.log('createFileFromInput called with name:', name, 'parentFolder:', parentFolder);
    const fileName = parentFolder ? `${parentFolder}/${name}` : name;
    
    // Check if file already exists to prevent duplicates
    if (projectFiles.has(fileName) || openTabs.has(fileName)) {
        console.log('File already exists:', fileName);
        showToast(`File "${name}" already exists`, 'error');
        return;
    }
    
    const language = detectLanguageFromExtension(name);
    
    const newTab = {
        id: fileName,
        name: name,
        language: language,
        content: getDefaultContent(language),
        isModified: false,
        folder: parentFolder
    };
    
    // Add to project files
    projectFiles.set(fileName, {
        name: name,
        fullPath: fileName,
        language: language,
        type: 'file',
        folder: parentFolder
    });
    
    // Add file to folder if one is selected
    if (parentFolder && projectFolders.has(parentFolder)) {
        projectFolders.get(parentFolder).files.add(fileName);
    }
    
    openTabs.set(newTab.id, newTab);
    fileContents.set(newTab.id, newTab.content);
    switchToTab(newTab.id);
    
    showToast(`File "${name}" created${parentFolder ? ` in ${parentFolder}` : ''}`, 'success');
}

// Get default content based on language
function getDefaultContent(language) {
    const templates = {
        'javascript': '// JavaScript file\nconsole.log("Hello, World!");',
        'python': '# Python file\nprint("Hello, World!")',
        'html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>',
        'css': '/* CSS file */\nbody {\n    margin: 0;\n    padding: 0;\n}',
        'json': '{\n    "name": "example",\n    "version": "1.0.0"\n}',
        'markdown': '# Markdown File\n\nYour content here...',
        'plaintext': ''
    };
    
    return templates[language] || '';
}

// Get default content for language (alias for compatibility)
function getDefaultContentForLanguage(language) {
    return getDefaultContent(language);
}

// Save file content
function saveFile() {
    // Update file context after saving
    if (activeTab) {
        const tab = openTabs.get(activeTab);
        if (tab) {
            const language = detectLanguageFromExtension(activeTab);
            contextManager.updateFileContext(activeTab, language, tab.content);
        }
    }
    // ... rest of the function remains the same ...
}

// Add file to tree
function addFileToTree(fileName) {
    // Store file in projectFiles Map for file tree display
    projectFiles.set(fileName, {
        type: 'file',
        content: '',
        language: detectLanguageFromExtension(fileName) || 'plaintext',
        folder: null // Root level file
    });
    
    // Update the file tree display
    updateFileTree();
}

// Create file from template
function createTemplateFile(template) {
    const templates = {
        html: {
            name: 'index.html',
            language: 'html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Your New Project</h1>
        <p>Start building something amazing!</p>
    </div>
</body>
</html>`
        },
        react: {
            name: 'App.jsx',
            language: 'javascript',
            content: `import React, { useState } from 'react';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="App">
            <header className="App-header">
                <h1>React Component</h1>
                <p>Count: {count}</p>
                <button onClick={() => setCount(count + 1)}>
                    Increment
                </button>
                <button onClick={() => setCount(count - 1)}>
                    Decrement
                </button>
            </header>
        </div>
    );
}

export default App;`
        },
        python: {
            name: 'main.py',
            language: 'python',
            content: `#!/usr/bin/env python3
"""
Python Script Template
A simple starting point for your Python project.
"""

def main():
    """Main function - entry point of the program."""
    print("Hello, World!")
    
    # Example: Working with lists
    numbers = [1, 2, 3, 4, 5]
    squared = [x**2 for x in numbers]
    print(f"Original: {numbers}")
    print(f"Squared: {squared}")
    
    # Example: Working with dictionaries
    person = {
        "name": "Alice",
        "age": 30,
        "city": "New York"
    }
    print(f"Person: {person['name']}, {person['age']} years old")

if __name__ == "__main__":
    main()`
        },
        javascript: {
            name: 'script.js',
            language: 'javascript',
            content: `// JavaScript Template
// Modern ES6+ JavaScript with examples

// Variables and constants
const APP_NAME = 'My JavaScript App';
let currentUser = null;

// Arrow functions
const greet = (name) => {
    return \`Hello, \${name}! Welcome to \${APP_NAME}.\`;
};

// Async function example
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Class example
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }
    
    getInfo() {
        return \`\${this.name} (\${this.email})\`;
    }
}

// Main application logic
function init() {
    console.log('Application starting...');
    
    // Example usage
    const user = new User('John Doe', 'john@example.com');
    currentUser = user;
    
    console.log(greet(user.name));
    console.log('User info:', user.getInfo());
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export for modules (if needed)
// export { greet, User, fetchData };`
        }
    };
    
    const templateData = templates[template];
    if (!templateData) {
        showToast('Template not found', 'error');
        return;
    }
    
    const timestamp = Date.now();
    const baseName = templateData.name.includes('.') ? templateData.name : `${templateData.name}-${timestamp}`;
    const fileName = selectedFolder ? `${selectedFolder}/${baseName}` : baseName;
    const displayName = selectedFolder ? baseName : fileName;
    
    const newTab = {
        id: fileName,
        name: displayName,
        language: templateData.language,
        content: templateData.content,
        isModified: false,
        folder: selectedFolder
    };
    
    // Add to project files
    projectFiles.set(fileName, {
        name: displayName,
        fullPath: fileName,
        language: templateData.language,
        type: 'file',
        folder: selectedFolder
    });
    
    // Add file to folder if one is selected
    if (selectedFolder && projectFolders.has(selectedFolder)) {
        projectFolders.get(selectedFolder).files.add(fileName);
    }
    
    openTabs.set(newTab.id, newTab);
    fileContents.set(newTab.id, newTab.content);
    switchToTab(newTab.id);
    
    updateFileTree();
    showToast(`${template.charAt(0).toUpperCase() + template.slice(1)} template created${selectedFolder ? ` in ${selectedFolder}` : ''}`, 'success');
}

function createNewFolder() {
    if (isCreatingItem) return;
    
    const defaultName = 'New Folder';
    createInlineInput('folder', defaultName, selectedFolder);
}

// Create folder from inline input
function createFolderFromInput(name, parentFolder) {
    const folderPath = parentFolder ? `${parentFolder}/${name}` : name;
    
    // Check if folder already exists
    if (projectFolders.has(folderPath)) {
        showToast(`Folder "${name}" already exists`, 'error');
        return;
    }
    
    // Create the folder
    projectFolders.set(folderPath, {
        name: name,
        path: folderPath,
        parent: parentFolder,
        files: new Set(),
        folders: new Set()
    });
    
    // Add to parent folder if exists
    if (parentFolder && projectFolders.has(parentFolder)) {
        projectFolders.get(parentFolder).folders.add(folderPath);
    }
    
    // Expand the new folder
    expandedFolders.add(folderPath);
    selectedFolder = folderPath;
    
    showToast(`Folder "${name}" created${parentFolder ? ` in ${parentFolder}` : ''}`, 'success');
}

// Handle right-click on file tree
function handleFileTreeRightClick(e) {
    e.preventDefault();
    
    const target = e.target.closest('.file-item, .folder-item, .file-entry, .folder');
    if (!target) return;
    
    contextMenuTarget = target;
    const contextMenu = document.getElementById('contextMenu');
    
    if (!contextMenu) {
        console.warn('Context menu element not found');
        return;
    }
    
    // Position the context menu
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.classList.remove('hidden');
    contextMenu.style.display = 'block';
    
    // Update menu items based on target type
    const isFolder = target.classList.contains('folder-item') || target.classList.contains('folder');
    const openItem = contextMenu.querySelector('[data-action="open"]');
    const duplicateItem = contextMenu.querySelector('[data-action="duplicate"]');
    
    if (openItem) {
        openItem.style.display = isFolder ? 'none' : 'flex';
    }
    if (duplicateItem) {
        duplicateItem.style.display = isFolder ? 'none' : 'flex';
    }
}

// Handle context menu clicks
function handleContextMenuClick(e) {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action || !contextMenuTarget) return;
    
    const isFolder = contextMenuTarget.classList.contains('folder-item');
    const path = contextMenuTarget.dataset.path;
    
    switch (action) {
        case 'open':
            if (!isFolder && projectFiles.has(path)) {
                openFileInTab(path);
            }
            break;
        case 'rename':
            startRename(contextMenuTarget, path, isFolder);
            break;
        case 'duplicate':
            if (!isFolder) {
                duplicateFile(path);
            }
            break;
        case 'newFile':
            selectedFolder = isFolder ? path : (contextMenuTarget.dataset.folder || null);
            createNewFile();
            break;
        case 'newFolder':
            selectedFolder = isFolder ? path : (contextMenuTarget.dataset.folder || null);
            createNewFolder();
            break;
        case 'delete':
            deleteItem(path, isFolder);
            break;
    }
    
    hideContextMenu();
}

// Hide context menu
function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.classList.add('hidden');
    contextMenuTarget = null;
}

// Start rename operation
function startRename(element, path, isFolder) {
    if (isCreatingItem) return;
    
    isCreatingItem = true;
    
    const nameElement = element.querySelector('.file-name, .folder-name');
    const currentName = isFolder ? projectFolders.get(path)?.name : projectFiles.get(path)?.name;
    
    if (!currentName) {
        isCreatingItem = false;
        return;
    }
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-input';
    input.value = currentName;
    input.dataset.originalPath = path;
    input.dataset.isFolder = isFolder.toString();
    
    // Replace name element with input
    nameElement.style.display = 'none';
    nameElement.parentNode.insertBefore(input, nameElement.nextSibling);
    
    input.focus();
    input.select();
    
    // Handle input events
    input.addEventListener('blur', handleRenameComplete);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleRenameComplete.call(this);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelRename(this);
        }
    });
}

// Handle rename completion
function handleRenameComplete() {
    const input = this;
    const originalPath = input.dataset.originalPath;
    const isFolder = input.dataset.isFolder === 'true';
    const newName = input.value.trim();
    
    if (!newName || newName === (isFolder ? projectFolders.get(originalPath)?.name : projectFiles.get(originalPath)?.name)) {
        cancelRename(input);
        return;
    }
    
    if (isFolder) {
        renameFolder(originalPath, newName);
    } else {
        renameFile(originalPath, newName);
    }
    
    // Clean up
    const nameElement = input.previousSibling;
    nameElement.style.display = '';
    input.remove();
    isCreatingItem = false;
    updateFileTree();
}

// Cancel rename
function cancelRename(input) {
    const nameElement = input.previousSibling;
    nameElement.style.display = '';
    input.remove();
    isCreatingItem = false;
}

// Rename file
function renameFile(oldPath, newName) {
    const file = projectFiles.get(oldPath);
    if (!file) return;
    
    const newPath = file.folder ? `${file.folder}/${newName}` : newName;
    const newLanguage = detectLanguageFromExtension(newName);
    
    // Update file in project
    projectFiles.delete(oldPath);
    projectFiles.set(newPath, {
        ...file,
        name: newName,
        fullPath: newPath,
        language: newLanguage
    });
    
    // Update in folder if exists
    if (file.folder && projectFolders.has(file.folder)) {
        const folder = projectFolders.get(file.folder);
        folder.files.delete(oldPath);
        folder.files.add(newPath);
    }
    
    // Update open tab if exists
    if (openTabs.has(oldPath)) {
        const tab = openTabs.get(oldPath);
        openTabs.delete(oldPath);
        openTabs.set(newPath, {
            ...tab,
            id: newPath,
            name: newName,
            language: newLanguage
        });
        
        // Update file contents
        const content = fileContents.get(oldPath);
        fileContents.delete(oldPath);
        fileContents.set(newPath, content);
        
        // Update active tab if this was the active one
        if (activeTab === oldPath) {
            activeTab = newPath;
            // Update editor language
            if (editor) {
                monaco.editor.setModelLanguage(editor.getModel(), newLanguage);
            }
        }
    }
    
    showToast(`File renamed to "${newName}"`, 'success');
}

// Rename folder
function renameFolder(oldPath, newName) {
    const folder = projectFolders.get(oldPath);
    if (!folder) return;
    
    const newPath = folder.parent ? `${folder.parent}/${newName}` : newName;
    
    // Update folder
    projectFolders.delete(oldPath);
    projectFolders.set(newPath, {
        ...folder,
        name: newName,
        path: newPath
    });
    
    // Update parent folder if exists
    if (folder.parent && projectFolders.has(folder.parent)) {
        const parentFolder = projectFolders.get(folder.parent);
        parentFolder.folders.delete(oldPath);
        parentFolder.folders.add(newPath);
    }
    
    // Update expanded folders
    if (expandedFolders.has(oldPath)) {
        expandedFolders.delete(oldPath);
        expandedFolders.add(newPath);
    }
    
    // Update selected folder
    if (selectedFolder === oldPath) {
        selectedFolder = newPath;
    }
    
    // Recursively update all nested items
    updateNestedItemPaths(oldPath, newPath);
    
    showToast(`Folder renamed to "${newName}"`, 'success');
}

// Update nested item paths after folder rename
function updateNestedItemPaths(oldParentPath, newParentPath) {
    // Update files
    for (const [filePath, file] of projectFiles.entries()) {
        if (filePath.startsWith(oldParentPath + '/')) {
            const relativePath = filePath.substring(oldParentPath.length + 1);
            const newFilePath = `${newParentPath}/${relativePath}`;
            
            projectFiles.delete(filePath);
            projectFiles.set(newFilePath, {
                ...file,
                fullPath: newFilePath,
                folder: file.folder === oldParentPath ? newParentPath : file.folder?.replace(oldParentPath + '/', newParentPath + '/')
            });
            
            // Update open tabs
            if (openTabs.has(filePath)) {
                const tab = openTabs.get(filePath);
                openTabs.delete(filePath);
                openTabs.set(newFilePath, {
                    ...tab,
                    id: newFilePath,
                    folder: tab.folder === oldParentPath ? newParentPath : tab.folder?.replace(oldParentPath + '/', newParentPath + '/')
                });
                
                // Update file contents
                const content = fileContents.get(filePath);
                fileContents.delete(filePath);
                fileContents.set(newFilePath, content);
                
                // Update active tab
                if (activeTab === filePath) {
                    activeTab = newFilePath;
                }
            }
        }
    }
    
    // Update folders
    for (const [folderPath, folder] of projectFolders.entries()) {
        if (folderPath.startsWith(oldParentPath + '/')) {
            const relativePath = folderPath.substring(oldParentPath.length + 1);
            const newFolderPath = `${newParentPath}/${relativePath}`;
            
            projectFolders.delete(folderPath);
            projectFolders.set(newFolderPath, {
                ...folder,
                path: newFolderPath,
                parent: folder.parent === oldParentPath ? newParentPath : folder.parent?.replace(oldParentPath + '/', newParentPath + '/')
            });
            
            // Update expanded folders
            if (expandedFolders.has(folderPath)) {
                expandedFolders.delete(folderPath);
                expandedFolders.add(newFolderPath);
            }
            
            // Update selected folder
            if (selectedFolder === folderPath) {
                selectedFolder = newFolderPath;
            }
        }
    }
}

// Duplicate file
function duplicateFile(filePath) {
    const file = projectFiles.get(filePath);
    if (!file) return;
    
    const content = fileContents.get(filePath) || '';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const extension = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
    const newName = `${baseName} copy${extension}`;
    const newPath = file.folder ? `${file.folder}/${newName}` : newName;
    
    // Create new file
    projectFiles.set(newPath, {
        ...file,
        name: newName,
        fullPath: newPath
    });
    
    // Add to folder if exists
    if (file.folder && projectFolders.has(file.folder)) {
        projectFolders.get(file.folder).files.add(newPath);
    }
    
    // Add content
    fileContents.set(newPath, content);
    
    // Open in new tab
    const newTab = {
        id: newPath,
        name: newName,
        language: file.language,
        content: content,
        isModified: false,
        folder: file.folder
    };
    
    openTabs.set(newPath, newTab);
    switchToTab(newPath);
    
    updateFileTree();
    showToast(`File duplicated as "${newName}"`, 'success');
}

// Delete item
function deleteItem(path, isFolder) {    
    if (isFolder) {
        deleteFolder(path);
    } else {
        deleteFile(path);
    }
    
    updateFileTree();
}

// Delete file
function deleteFile(filePath) {
    const file = projectFiles.get(filePath);
    if (!file) return;
    
    // Remove from project
    projectFiles.delete(filePath);
    
    // Remove from folder if exists
    if (file.folder && projectFolders.has(file.folder)) {
        projectFolders.get(file.folder).files.delete(filePath);
    }
    
    // Close tab if open
    if (openTabs.has(filePath)) {
        closeTab(filePath);
    }
    
    // Remove content
    fileContents.delete(filePath);
    
    showToast(`File "${file.name}" deleted`, 'success');
}

// Delete folder
function deleteFolder(folderPath) {
    const folder = projectFolders.get(folderPath);
    if (!folder) return;
    
    // Delete all files in folder
    for (const filePath of folder.files) {
        deleteFile(filePath);
    }
    
    // Delete all subfolders
    for (const subfolderPath of folder.folders) {
        deleteFolder(subfolderPath);
    }
    
    // Remove from parent folder if exists
    if (folder.parent && projectFolders.has(folder.parent)) {
        projectFolders.get(folder.parent).folders.delete(folderPath);
    }
    
    // Remove folder
    projectFolders.delete(folderPath);
    
    // Remove from expanded folders
    expandedFolders.delete(folderPath);
    
    // Update selected folder
    if (selectedFolder === folderPath) {
        selectedFolder = folder.parent || null;
    }
    
    showToast(`Folder "${folder.name}" deleted`, 'success');
}

function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.ts,.py,.html,.css,.json,.md,.txt';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const language = detectLanguageFromExtension(file.name);
            
            const fileName = selectedFolder ? `${selectedFolder}/${file.name}` : file.name;
            const displayName = file.name;
            
            const newTab = {
                id: fileName,
                name: displayName,
                language: language,
                content: content,
                isModified: false,
                folder: selectedFolder
            };
            
            // Add to project files
            projectFiles.set(fileName, {
                name: displayName,
                fullPath: fileName,
                language: language,
                type: 'file',
                folder: selectedFolder
            });
            
            // Add file to folder if one is selected
            if (selectedFolder && projectFolders.has(selectedFolder)) {
                projectFolders.get(selectedFolder).files.add(fileName);
            }
            
            openTabs.set(newTab.id, newTab);
            fileContents.set(newTab.id, content);
            switchToTab(newTab.id);
            
            updateFileTree();
            showToast(`Opened ${file.name}${selectedFolder ? ` in ${selectedFolder}` : ''}`, 'success');
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function saveAllFiles() {
    let savedCount = 0;
    
    openTabs.forEach((tab, tabId) => {
        if (tab.isModified) {
            // In a real app, this would save to the file system
            tab.isModified = false;
            savedCount++;
        }
    });
    
    updateTabContainer();
    showToast(`Saved ${savedCount} file(s)`, 'success');
}

function createNewFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
        const cleanName = folderName.trim();
        const folderPath = selectedFolder ? `${selectedFolder}/${cleanName}` : cleanName;
        
        projectFolders.set(folderPath, {
            name: cleanName,
            path: folderPath,
            parent: selectedFolder,
            files: new Set()
        });
        
        updateFileTree();
        showToast(`Folder "${cleanName}" created`, 'success');
    }
}

function refreshFileTree() {
    updateFileTree();
    showToast('File tree refreshed', 'success');
}

function handleFileTreeClick(e) {
    const fileItem = e.target.closest('.file-item');
    if (!fileItem) return;
    
    const itemType = fileItem.dataset.type;
    
    if (itemType === 'folder') {
        const folderPath = fileItem.dataset.path;
        
        // Toggle folder expansion
        if (expandedFolders.has(folderPath)) {
            expandedFolders.delete(folderPath);
        } else {
            expandedFolders.add(folderPath);
        }
        
        // Select the folder
        selectedFolder = selectedFolder === folderPath ? null : folderPath;
        
        updateFileTree();
        return;
    }
    
    // Handle file click
    const fileName = fileItem.dataset.name;
    const language = fileItem.dataset.language;
    
    // Clear folder selection when clicking on a file
    selectedFolder = null;
    
    // Check if tab already exists
    if (openTabs.has(fileName)) {
        // Ensure only switching; model creation happens in switchToTab
        switchToTab(fileName);
        updateFileTree();
        return;
    }
    
    // Create new tab for existing file
    let content = '';
    const file = projectFiles.get(fileName);
    
    if (file) {
        // Get content based on file name
        switch (file.name || fileName) {
            case 'index.html':
                content = '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>';
                break;
            case 'styles.css':
                content = 'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}';
                break;
            case 'script.js':
                content = 'console.log("Hello from script.js");\n\n// Your JavaScript code here';
                break;
            case 'README.md':
                content = '# Project Title\n\nDescription of your project.\n\n## Installation\n\n```bash\nnpm install\n```';
                break;
            default:
                content = '// File content would be loaded from file system';
        }
    }
    
    const newTab = {
        id: fileName,
        name: file ? file.name : fileName,
        language: language,
        content: content,
        isModified: false,
        folder: file ? file.folder : null
    };
    
    openTabs.set(newTab.id, newTab);
    fileContents.set(newTab.id, content);
    // Only switch; switchToTab will handle editor model
    switchToTab(newTab.id);
}

// Update the entire file tree
function updateFileTree() {
    const fileTree = document.getElementById('fileTree');
    fileTree.innerHTML = '';
    
    // Render root level items
    renderTreeLevel(fileTree, null, 0);
}

// Render a specific level of the file tree
function renderTreeLevel(container, parentPath, depth) {
    // Add folders at this level
    projectFolders.forEach((folderData, folderPath) => {
        if (folderData.parent === parentPath) {
            const folderElement = createFolderElement(folderData, depth);
            container.appendChild(folderElement);
            
            // If folder is expanded, render its contents directly in the same container
            if (expandedFolders.has(folderPath)) {
                // Render subfolders and files directly in main container with increased depth
                renderTreeLevel(container, folderPath, depth + 1);
            }
        }
    });
    
    // Add files at this level
    projectFiles.forEach((file, fileName) => {
        if (file.folder === parentPath) {
            const fileElement = createFileElement(file, fileName, depth);
            container.appendChild(fileElement);
        }
    });
}

// Create folder element
function createFolderElement(folderData, depth) {
    const folderElement = document.createElement('div');
    folderElement.className = 'file-item folder-item';
    folderElement.dataset.type = 'folder';
    folderElement.dataset.path = folderData.path;
    folderElement.style.paddingLeft = `${12 + depth * 16}px`;
    
    if (selectedFolder === folderData.path) {
        folderElement.classList.add('selected');
    }
    
    const isExpanded = expandedFolders.has(folderData.path);
    const expandIcon = isExpanded ? '▼' : '▶';
    
    folderElement.innerHTML = `
        <span class="expand-icon">${expandIcon}</span>
        <svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="${isExpanded ? '#dcb67a' : '#8a7c64'}">
            <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
        </svg>
        <span class="file-name">${folderData.name}</span>
    `;
    
    return folderElement;
}

// Create file element
function createFileElement(file, fileName, depth) {
    const fileElement = document.createElement('div');
    fileElement.className = 'file-item';
    fileElement.dataset.type = 'file';
    fileElement.dataset.name = fileName;
    fileElement.dataset.language = file.language;
    fileElement.style.paddingLeft = `${12 + depth * 16}px`; // Base padding plus depth-based indentation
    
    // Check if file is currently open
    if (activeTab === fileName) {
        fileElement.classList.add('active');
    }
    
    const iconColor = getFileIconColor(file.language);
    const iconPath = getFileIconSVG(file.language);
    
    fileElement.innerHTML = `
        <svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="${iconColor}">
            <path d="${iconPath}"/>
        </svg>
        <span class="file-name">${file.name}</span>
    `;
    
    return fileElement;
}

// Update editor visibility based on active tabs
function updateEditorVisibility() {
    const editor = document.getElementById('editor');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const tabContainer = document.getElementById('tabContainer');
    const editorActions = document.getElementById('editorActions');
    
    if (openTabs.size === 0) {
        // No tabs open - show welcome screen
        editor.style.display = 'none';
        welcomeScreen.classList.remove('hidden');
        tabContainer.style.display = 'none';
        editorActions.style.display = 'none';
    } else {
        // Tabs open - show editor
        editor.style.display = 'block';
        welcomeScreen.classList.add('hidden');
        tabContainer.style.display = 'flex';
        editorActions.style.display = 'flex';
    }
}

// Download current file
function downloadCurrentFile() {
    if (editor && activeTab) {
        const code = editor.getValue();
        const tab = openTabs.get(activeTab);
        const fileName = tab ? tab.name : 'untitled.txt';
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`Downloaded ${fileName}`, 'success');
    }
}

// Clear chat
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message assistant-message">
            <div class="message-content">
                <p>👋 Hello! I'm your AI coding assistant. I can help you:</p>
                <ul>
                    <li>Write new code from scratch</li>
                    <li>Fix bugs and errors</li>
                    <li>Refactor and optimize code</li>
                    <li>Add features and functionality</li>
                    <li>Explain code concepts</li>
                </ul>
                <p>Just describe what you want, and I'll update your code automatically!</p>
            </div>
        </div>
    `;
    chatHistory = [];
    showToast('Chat cleared', 'success');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search functionality
let currentSearchState = null;
let searchTimeout = null;

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const replaceInput = document.getElementById('replace-input');
    const searchNextBtn = document.getElementById('search-next');
    const searchPrevBtn = document.getElementById('search-prev');
    const replaceBtn = document.getElementById('replace-btn');
    const replaceAllBtn = document.getElementById('replace-all');
    const matchCaseBtn = document.getElementById('match-case');
    const regexBtn = document.getElementById('regex');
    const wholeWordBtn = document.getElementById('whole-word');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', () => performSearch(false));
    searchNextBtn?.addEventListener('click', () => findNext());
    searchPrevBtn?.addEventListener('click', () => findPrevious());
    replaceBtn?.addEventListener('click', () => replaceCurrent());
    replaceAllBtn?.addEventListener('click', () => replaceAll());
    matchCaseBtn?.addEventListener('click', () => performSearch(false));
    regexBtn?.addEventListener('click', () => performSearch(false));
    wholeWordBtn?.addEventListener('click', () => performSearch(false));
    

}

function performSearch(showMessage = true) {
    if (!editor || !editor.getModel()) return;
    
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        clearSearch();
        return;
    }
    
    try {
        const model = editor.getModel();
        const isRegex = false; // Keep it simple for now
        const matchCase = false;
        const wholeWord = false;
        
        // Use the correct findMatches API
        currentSearchState = model.findMatches(
            searchTerm,
            true, // searchOnlyEditableRange
            isRegex,
            matchCase,
            wholeWord ? '`~!@#$%^&*()-=+[{]}\\|;:\",.<>/?\n\r\t\s' : null, // wordSeparators
            false // captureMatches
        );
        
        // Update search info
        const searchInfo = document.getElementById('search-info');
        if (searchInfo) {
            if (currentSearchState && currentSearchState.length > 0) {
                searchInfo.textContent = `${currentSearchState.length} results`;
            } else {
                searchInfo.textContent = 'No results';
            }
        }
        
        if (currentSearchState && currentSearchState.length > 0) {
            // Highlight the first match
            const firstMatch = currentSearchState[0];
            editor.setSelection(firstMatch.range);
            editor.revealRangeInCenter(firstMatch.range);
            
            if (showMessage) {
                showToast(`Found ${currentSearchState.length} matches`, 'info');
            }
        } else if (showMessage) {
            showToast('No matches found', 'warning');
        }
    } catch (error) {
        console.error('Search error:', error);
        if (showMessage) {
            showToast('Search error occurred', 'error');
        }
    }
}

function findNext() {
    if (!editor || !currentSearchState || currentSearchState.length === 0) {
        performSearch();
        return;
    }
    
    try {
        const currentSelection = editor.getSelection();
        const currentPosition = currentSelection ? currentSelection.getEndPosition() : editor.getPosition();
        
        let nextMatch = currentSearchState.find(match => 
            match.range.startLineNumber > currentPosition.lineNumber || 
            (match.range.startLineNumber === currentPosition.lineNumber && 
             match.range.startColumn > currentPosition.column)
        );
        
        if (!nextMatch && currentSearchState.length > 0) {
            nextMatch = currentSearchState[0]; // Wrap around to first match
        }
        
        if (nextMatch) {
            editor.setSelection(nextMatch.range);
            editor.revealRangeInCenter(nextMatch.range);
        }
    } catch (error) {
        console.error('Find next error:', error);
    }
}

function findPrevious() {
    if (!editor || !currentSearchState || currentSearchState.length === 0) {
        performSearch();
        return;
    }
    
    try {
        const currentSelection = editor.getSelection();
        const currentPosition = currentSelection ? currentSelection.getStartPosition() : editor.getPosition();
        
        let prevMatch = [...currentSearchState].reverse().find(match => 
            match.range.startLineNumber < currentPosition.lineNumber || 
            (match.range.startLineNumber === currentPosition.lineNumber && 
             match.range.startColumn < currentPosition.column)
        );
        
        if (!prevMatch && currentSearchState.length > 0) {
            prevMatch = currentSearchState[currentSearchState.length - 1]; // Wrap around to last match
        }
        
        if (prevMatch) {
            editor.setSelection(prevMatch.range);
            editor.revealRangeInCenter(prevMatch.range);
        }
    } catch (error) {
        console.error('Find previous error:', error);
    }
}

function replaceCurrent() {
    if (!editor || !currentSearchState || currentSearchState.length === 0) return;
    
    const replaceInput = document.getElementById('replace-input');
    if (!replaceInput) return;
    
    const currentPosition = editor.getPosition();
    const currentMatch = currentSearchState.find(match => 
        match.range.startLineNumber === currentPosition.lineNumber &&
        match.range.startColumn === currentPosition.column
    );
    
    if (currentMatch) {
        editor.executeEdits('replace', [{
            range: {
                startLineNumber: currentMatch.range.startLineNumber,
                startColumn: currentMatch.range.startColumn,
                endLineNumber: currentMatch.range.endLineNumber,
                endColumn: currentMatch.range.endColumn
            },
            text: replaceInput.value,
            forceMoveMarkers: true
        }]);
        
        // Move to next match after replace
        findNext();
    }
}

function replaceAll() {
    if (!editor || !currentSearchState || currentSearchState.length === 0) return;
    
    const replaceInput = document.getElementById('replace-input');
    if (!replaceInput) return;
    
    const edits = currentSearchState.map(match => ({
        range: {
            startLineNumber: match.range.startLineNumber,
            startColumn: match.range.startColumn,
            endLineNumber: match.range.endLineNumber,
            endColumn: match.range.endColumn
        },
        text: replaceInput.value,
        forceMoveMarkers: true
    }));
    
    editor.executeEdits('replace-all', edits);
    showToast(`Replaced ${edits.length} occurrences`, 'success');
}

function clearSearch() {
    if (editor) {
        try {
            // Instead of setSelections([]), use setSelection to clear current selection
            const currentPosition = editor.getPosition();
            if (currentPosition) {
                editor.setSelection({
                    startLineNumber: currentPosition.lineNumber,
                    startColumn: currentPosition.column,
                    endLineNumber: currentPosition.lineNumber,
                    endColumn: currentPosition.column
                });
            }
        } catch (error) {
            console.warn('Error clearing search selections:', error);
        }
    }
    currentSearchState = null;
    
    // Clear search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear search info
    const searchInfo = document.getElementById('search-info');
    if (searchInfo) {
        searchInfo.textContent = '';
    }
}

function toggleSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    if (!searchPanel) return;
    
    if (searchPanel.style.display === 'none' || !searchPanel.style.display) {
        searchPanel.style.display = 'flex';
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    } else {
        searchPanel.style.display = 'none';
        // Clear search state without calling Monaco Editor methods
        currentSearchState = null;
        
        // Clear search input and info
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        const searchInfo = document.getElementById('search-info');
        if (searchInfo) {
            searchInfo.textContent = '';
        }
    }
}

function closeSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    if (searchPanel) {
        searchPanel.style.display = 'none';
        
        // Clear search state without calling Monaco Editor methods
        currentSearchState = null;
        
        // Clear search input and info
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        const searchInfo = document.getElementById('search-info');
        if (searchInfo) {
            searchInfo.textContent = '';
        }
    }
}

// Initialize search when the editor is ready
if (window.monaco) {
    window.monaco.editor.onDidCreateEditor(() => {
        initializeSearch();
    });
}

// File Operations
let currentFileHandle = null;

async function saveFile() {
    if (!editor || !activeTab) return;
    
    const content = editor.getValue();
    const tab = openTabs.get(activeTab);
    
    try {
        if (currentFileHandle) {
            // Save to existing file handle
            const writable = await currentFileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            
            // Update tab state
            tab.isModified = false;
            tab.content = content;
            updateTabContainer();
            
            showToast('File saved successfully', 'success');
        } else {
            // No file handle, use save as flow
            saveAsFile();
        }
    } catch (error) {
        console.error('Error saving file:', error);
        showToast('Failed to save file', 'error');
    }
}

async function saveAsFile() {
    if (!editor || !activeTab) return;
    
    const tab = openTabs.get(activeTab);
    const content = editor.getValue();
    
    try {
        const options = {
            suggestedName: tab.name || 'untitled.txt',
            types: [
                {
                    description: 'Text Files',
                    accept: {
                        'text/plain': ['.txt', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json'],
                    },
                },
            ],
        };
        
        const fileHandle = await window.showSaveFilePicker(options);
        
        // Save file content
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        // Update tab and state
        tab.name = fileHandle.name;
        tab.content = content;
        tab.isModified = false;
        currentFileHandle = fileHandle;
        
        // Update file in project files if it exists
        if (projectFiles.has(activeTab)) {
            const fileData = projectFiles.get(activeTab);
            fileData.name = fileHandle.name;
            fileData.fullPath = fileHandle.name;
        }
        
        updateTabContainer();
        updateFileTree();
        
        showToast('File saved successfully', 'success');
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error saving file:', error);
            showToast('Failed to save file', 'error');
        }
    }
}

async function openFile() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            multiple: false,
            types: [
                {
                    description: 'Text Files',
                    accept: {
                        'text/plain': ['.txt', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json'],
                    },
                },
            ],
        });
        
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        // Check if file is already open
        for (const [id, tab] of openTabs.entries()) {
            if (tab.name === file.name) {
                switchToTab(id);
                return;
            }
        }
        
        // Create new tab
        const language = detectLanguageFromExtension(file.name);
        const tabId = `file-${Date.now()}`;
        const newTab = {
            id: tabId,
            name: file.name,
            language: language,
            content: content,
            isModified: false
        };
        
        // Add to open tabs and project files
        openTabs.set(tabId, newTab);
        fileContents.set(tabId, content);
        
        // Add to project files
        projectFiles.set(tabId, {
            name: file.name,
            fullPath: file.name,
            language: language,
            type: 'file',
            folder: null
        });
        
        // Update UI
        updateTabContainer();
        updateFileTree();
        switchToTab(tabId);
        
        // Set editor content and language
        if (editor) {
            editor.setValue(content);
            monaco.editor.setModelLanguage(editor.getModel(), language);
        }
        
        currentFileHandle = fileHandle;
        
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error opening file:', error);
            showToast('Failed to open file', 'error');
        }
    }
}

// Save file online to Firebase
async function saveFileOnline() {
    if (!auth || !db) {
        alert('Firebase is not configured. Please ensure Firebase scripts are loaded.');
        return;
    }
    
    const user = auth.currentUser;
    if (!user) {
        showToast('You must be logged in to save files online.', 'error');
        return;
    }
    
    if (!activeTab || !openTabs.has(activeTab)) {
        showToast('No active file to save.', 'error');
        return;
    }
    
    const currentTab = openTabs.get(activeTab);
    const fileName = prompt('Enter the file name:', currentTab.name);
    const fileID = prompt('Enter a unique file ID:');
    const filePassword = prompt('Enter a password for the file:');
    
    if (!fileName || !fileID || !filePassword) {
        showToast('Please provide a file name, unique file ID, and password.', 'error');
        return;
    }
    
    try {
        const content = editor ? editor.getValue() : currentTab.content;
        
        // Check if file ID already exists
        const existingFile = await db.collection('files').doc(fileID).get();
        if (existingFile.exists) {
            showToast('File ID already exists. Please choose a different ID.', 'error');
            return;
        }
        
        await db.collection('files').doc(fileID).set({
            content: content,
            name: fileName,
            password: filePassword,
            userId: user.uid,
            timestamp: new Date().toISOString()
        });
        
        showToast(`File saved successfully! File ID: ${fileID}`, 'success');
        
    } catch (error) {
        console.error('Error saving file:', error);
        showToast('Error saving file. Please try again.', 'error');
    }
}

// Load file online from Firebase
async function loadFileOnline() {
    if (!auth || !db) {
        alert('Firebase is not configured. Please ensure Firebase scripts are loaded.');
        return;
    }
    
    const fileID = prompt('Enter the file ID:');
    const filePassword = prompt('Enter the file password:');
    
    if (!fileID || !filePassword) {
        showToast('Please provide both file ID and password.', 'error');
        return;
    }
    
    try {
        const fileDoc = await db.collection('files').doc(fileID).get();
        
        if (!fileDoc.exists) {
            showToast('No file found with this ID.', 'error');
            return;
        }
        
        const fileData = fileDoc.data();
        
        if (fileData.password !== filePassword) {
            showToast('Incorrect password. Access denied.', 'error');
            return;
        }
        
        // Load file into a new tab
        const tabId = loadFileIntoTab(fileData.name, fileData.content);
        
        showToast(`File "${fileData.name}" loaded successfully!`, 'success');
        
    } catch (error) {
        console.error('Error loading file:', error);
        showToast('Error loading file. Please try again.', 'error');
    }
}

// Change file name function
function changeFileNameAndExtension() {
    if (!activeTab || !openTabs.has(activeTab)) {
        alert('No active file to rename.');
        return;
    }
    
    const currentTab = openTabs.get(activeTab);
    const currentName = currentTab.name;
    
    const newFullName = prompt('Enter the new file name and extension (e.g., myFile.js):', currentName);
    if (newFullName && newFullName.trim()) {
        const newName = newFullName.trim();
        
        // Check if the new name is different
        if (newName === currentName) {
            return;
        }
        
        // Validate format
        const nameParts = newName.split('.');
        if (nameParts.length < 2) {
            showToast('Invalid format! Please include both a file name and extension.', 'error');
            return;
        }
        
        // Check if the new file name already exists
        const existingTab = Array.from(openTabs.values()).find(tab => tab.name === newName);
        if (existingTab) {
            showToast('A file with that name already exists.', 'error');
            return;
        }
        
        // Update the tab
        currentTab.name = newName;
        currentTab.language = detectLanguageFromExtension(newName) || 'plaintext';
        
        // Update projectFiles Map for file tree
        if (projectFiles.has(currentName)) {
            const fileData = projectFiles.get(currentName);
            fileData.language = currentTab.language;
            projectFiles.set(newName, fileData);
            projectFiles.delete(currentName);
        }
        
        // Update fileContents Map
        if (fileContents.has(activeTab)) {
            const content = fileContents.get(activeTab);
            fileContents.delete(activeTab);
            fileContents.set(newName, content);
        }
        
        // Update activeTab reference
        openTabs.delete(activeTab);
        openTabs.set(newName, currentTab);
        activeTab = newName;
        
        // Update tab container and file tree
        updateTabContainer();
        updateFileTree();
        
        showToast(`File renamed to "${newName}" successfully!`, 'success');
    }
}

// Context Manager to maintain conversation history and file context
class ContextManager {
    constructor() {
        this.conversationHistory = [];
        this.maxHistoryLength = 10; // Keep last 10 messages
        this.currentFileContext = {
            path: null,
            language: null,
            content: null
        };
    }

    // Add a message to the conversation history
    addMessage(role, content) {
        this.conversationHistory.push({ role, content, timestamp: new Date() });
        
        // Trim history if it gets too long
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory.shift();
        }
    }

    // Update the current file context
    updateFileContext(path, language, content) {
        this.currentFileContext = { path, language, content };
    }

    // Get the conversation context as a formatted string
    getConversationContext() {
        return this.conversationHistory
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');
    }

    // Get the current file context as a formatted string
    getFileContext() {
        if (!this.currentFileContext.path) return 'No active file';
        
        return `Current File: ${this.currentFileContext.path}\n` +
               `Language: ${this.currentFileContext.language || 'Unknown'}\n` +
               `Content:\n${this.currentFileContext.content || 'Empty file'}`;
    }

    // Get the full context for the AI
    getFullContext() {
        return `=== CONVERSATION HISTORY ===\n${this.getConversationContext()}\n\n` +
               `=== CURRENT FILE CONTEXT ===\n${this.getFileContext()}`;
    }

    // Clear the conversation history
    clearHistory() {
        this.conversationHistory = [];
    }
}

// Initialize global context manager
const contextManager = new ContextManager();

// Chat message handling with file operations
function initializeChatSystem() {
    // Store the original appendMessage function if it exists
    const originalAppendMessage = window.appendMessage || function() {
        // Default implementation if appendMessage doesn't exist
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${arguments[1] || 'user'}`;
            messageDiv.textContent = arguments[0];
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    };

    // Process file operations from AI response
    function processFileOperations(content) {
        // Process create file commands: [create_file] path/to/file [content]
        const createFileRegex = /\[create_file\]\s*([^\s\[\]]+)(?:\s*\[([\s\S]*?)\])?/g;
        let createMatch;
        let result = content;
        
        while ((createMatch = createFileRegex.exec(content)) !== null) {
            const filePath = createMatch[1].trim();
            const fileContent = (createMatch[2] || '').trim();
            
            // Use the existing file creation function
            if (typeof createFileFromInput === 'function') {
                createFileFromInput(filePath, window.selectedFolder);
                
                // If content was provided, update the file content
                if (fileContent) {
                    const tabId = window.selectedFolder ? 
                        `${window.selectedFolder}/${filePath}` : filePath;
                    if (window.openTabs && window.openTabs.has(tabId)) {
                        const tab = window.openTabs.get(tabId);
                        tab.content = fileContent;
                        tab.isModified = true;
                        if (window.fileContents) {
                            window.fileContents.set(tabId, fileContent);
                        }
                        
                        // If this is the active tab, update the editor
                        if (window.activeTab === tabId && window.monaco && window.monaco.editor) {
                            const editor = window.monaco.editor.getModels()[0];
                            if (editor) {
                                editor.setValue(fileContent);
                            }
                        }
                    }
                }
            }
        }
        
        // Process delete file commands: [delete_file] path/to/file
        const deleteFileRegex = /\[delete_file\]\s*([^\s\[\]]+)/g;
        while ((deleteMatch = deleteFileRegex.exec(content)) !== null) {
            const filePath = deleteMatch[1].trim();
            if (typeof deleteFile === 'function' && typeof showConfirmToast === 'function') {
                showConfirmToast(
                    `Are you sure you want to delete "${filePath}"?`,
                    () => {
                        deleteFile(filePath);
                        showToast(`File "${filePath}" deleted`, 'success');
                    },
                    () => {
                        showToast('File deletion cancelled', 'info');
                    }
                );
            }
        }
        
        // Process delete folder commands: [delete_folder] path/to/folder
        const deleteFolderRegex = /\[delete_folder\]\s*([^\s\[\]]+)/g;
        let deleteFolderMatch;
        while ((deleteFolderMatch = deleteFolderRegex.exec(content)) !== null) {
            const folderPath = deleteFolderMatch[1].trim();
            if (typeof deleteFolder === 'function' && typeof showConfirmToast === 'function') {
                showConfirmToast(
                    `Are you sure you want to delete the folder "${folderPath}" and all its contents?`,
                    () => {
                        deleteFolder(folderPath);
                        showToast(`Folder "${folderPath}" deleted`, 'success');
                    },
                    () => {
                        showToast('Folder deletion cancelled', 'info');
                    }
                );
            }
        }
        
        // Remove the file operation commands from the displayed content
        return result
            .replace(/\[create_file\][^\[]*/g, '')
            .replace(/\[delete_file\][^\[]*/g, '')
            .replace(/\[delete_folder\][^\[]*/g, '')
            .trim();
    }

    // Override the global appendMessage function
    window.appendMessage = function(content, sender, save = true, userQuery = null, messageIndex = -1, stream = false, timestamp = null, userImages = null, hasGeneratedImage = false, imageBase64 = null) {
        // Process file operations for AI messages
        if (sender === 'ai' && content) {
            content = processFileOperations(content);
        }
        
        // Call the original appendMessage function
        return originalAppendMessage(content, sender, save, userQuery, messageIndex, stream, timestamp, userImages, hasGeneratedImage, imageBase64);
    };
}

// Initialize the chat system when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeChatSystem();
});

// Add event listeners for file operations
document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple event listener setups
    if (window.eventListenersSetup) return;
    window.eventListenersSetup = true;

    // New file button
    const newFileBtn = document.getElementById('new-file');
    if (newFileBtn) {
        newFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('New file button clicked');
            createNewFile();
        });
    }

    // Open button
    const openBtn = document.getElementById('open-file');
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openFile();
        });
    }
    
    // Save button
    const saveBtn = document.getElementById('save-file');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveFile();
        });
    }
    
    // Save As button
    const saveAsBtn = document.getElementById('save-as-file');
    if (saveAsBtn) {
        saveAsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveAsFile();
        });
    }

    // Change name button
    const changeNameBtn = document.getElementById('change-name');
    if (changeNameBtn) {
        changeNameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if there's an active file to rename
            if (!activeTab || !openTabs.has(activeTab)) {
                showToast('No active file to rename.', 'error');
                return;
            }
            
            // Find the file element in the file tree
            const fileName = activeTab;
            const fileElement = document.querySelector(`[data-name="${fileName}"][data-type="file"]`);
            
            if (fileElement) {
                startRename(fileElement, fileName, false);
            } else {
                showToast('Could not find the file in the file tree.', 'error');
            }
        });
    }
    
    // Find button - use Monaco's built-in search
    const findBtn = document.getElementById('search');
    if (findBtn) {
        findBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (editor) {
                editor.trigger('keyboard', 'actions.find');
            }
        });
    }
    
    // Keyboard shortcuts for search and format
    document.addEventListener('keydown', (e) => {
        // Ctrl+F for find - use Monaco's built-in search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (editor) {
                editor.trigger('keyboard', 'actions.find');
            }
        } 
        // Alt+F for format code
        else if (e.altKey && e.key === 'f') {
            e.preventDefault();
            formatCode();
        }
    });
    
    // Save online button
    const saveOnlineBtn = document.getElementById('save-online');
    if (saveOnlineBtn) {
        saveOnlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveFileOnline();
        });
    }
    
    // Load online button
    const loadOnlineBtn = document.getElementById('load-file');
    if (loadOnlineBtn) {
        loadOnlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadFileOnline();
        });
    }
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Save with Ctrl+S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveFile();
        }
        // Save As with Ctrl+Alt+S
        else if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 's') {
            e.preventDefault();
            saveAsFile();
        }
        // Open with Ctrl+O
        else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            openFile();
        }
    });
    
    // Update tab modified state on content change
    if (editor) {
        editor.onDidChangeModelContent(() => {
            if (activeTab) {
                const tab = openTabs.get(activeTab);
                if (tab) {
                    const currentContent = editor.getValue();
                    tab.isModified = currentContent !== tab.content;
                    updateTabContainer();
                }
            }
        });
    }
});

// Context Menu and Right-Click Functionality
let clickedItem = null;

function showContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Close any existing context menu first
    hideContextMenu();
    
    // Get the clicked item
    const target = event.target;
    const clickedFile = target.closest('.file-item[data-type="file"]');
    const clickedFolder = target.closest('.file-item[data-type="folder"]');
    const clickedFileTree = target.closest('#fileTree');
    
    // Only show context menu for file tree items or empty space in file tree
    if (!clickedFile && !clickedFolder && !clickedFileTree) {
        return;
    }
    
    // Get or create context menu
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }
    
    // Clear existing menu items
    contextMenu.innerHTML = '';
    
    let menuItems = [];
    
    if (clickedFile) {
        // Menu items for files
        menuItems = [
            { 
                text: 'Open', 
                action: 'open', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>` 
            },

            { 
                text: 'Cut', 
                action: 'cut', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.64,7.64C10.37,6.91 10.37,5.73 9.64,5C8.91,4.27 7.73,4.27 7,5C6.27,5.73 6.27,6.91 7,7.64C7.73,8.37 8.91,8.37 9.64,7.64M21.64,2.64C22.37,1.91 22.37,0.73 21.64,0C20.91,-0.73 19.73,-0.73 19,0C18.27,0.73 18.27,1.91 19,2.64C19.73,3.37 20.91,3.37 21.64,2.64M15.54,5.54L13.76,7.32L12.34,5.9L14.12,4.12L15.54,5.54M12.34,18.1L13.76,16.68L15.54,18.46L14.12,19.88L12.34,18.1M9.64,17C8.91,17.73 7.73,17.73 7,17C6.27,16.27 6.27,15.09 7,14.36C7.73,13.63 8.91,13.63 9.64,14.36C10.37,15.09 10.37,16.27 9.64,17M21.64,21.36C22.37,22.09 22.37,23.27 21.64,24C20.91,24.73 19.73,24.73 19,24C18.27,23.27 18.27,22.09 19,21.36C19.73,20.63 20.91,20.63 21.64,21.36M22.54,12L21.12,10.58L19.34,12.36L20.76,13.78L22.54,12M1.46,12L3.24,10.22L4.66,11.64L2.88,13.42L1.46,12Z"/>
                </svg>` 
            },
            { 
                text: 'Copy', 
                action: 'copy', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Rename', 
                action: 'rename', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>` 
            },
            { 
                text: 'Download', 
                action: 'download', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Properties', 
                action: 'properties', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4H5V19H19V9Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Delete', 
                action: 'delete', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>`,
                className: 'context-menu-danger' 
            }
        ];
    } else if (clickedFolder) {
        // Menu items for folders
        menuItems = [
            { 
                text: 'Open', 
                action: 'open', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Cut', 
                action: 'cut', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.64,7.64C10.37,6.91 10.37,5.73 9.64,5C8.91,4.27 7.73,4.27 7,5C6.27,5.73 6.27,6.91 7,7.64C7.73,8.37 8.91,8.37 9.64,7.64M21.64,2.64C22.37,1.91 22.37,0.73 21.64,0C20.91,-0.73 19.73,-0.73 19,0C18.27,0.73 18.27,1.91 19,2.64C19.73,3.37 20.91,3.37 21.64,2.64M15.54,5.54L13.76,7.32L12.34,5.9L14.12,4.12L15.54,5.54M12.34,18.1L13.76,16.68L15.54,18.46L14.12,19.88L12.34,18.1M9.64,17C8.91,17.73 7.73,17.73 7,17C6.27,16.27 6.27,15.09 7,14.36C7.73,13.63 8.91,13.63 9.64,14.36C10.37,15.09 10.37,16.27 9.64,17M21.64,21.36C22.37,22.09 22.37,23.27 21.64,24C20.91,24.73 19.73,24.73 19,24C18.27,23.27 18.27,22.09 19,21.36C19.73,20.63 20.91,20.63 21.64,21.36M22.54,12L21.12,10.58L19.34,12.36L20.76,13.78L22.54,12M1.46,12L3.24,10.22L4.66,11.64L2.88,13.42L1.46,12Z"/>
                </svg>` 
            },
            { 
                text: 'Copy', 
                action: 'copy', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Rename', 
                action: 'rename', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'New File', 
                action: 'newFile', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>` 
            },
            { 
                text: 'New Folder', 
                action: 'newFolder', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Properties', 
                action: 'properties', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4H5V19H19V9Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Delete', 
                action: 'delete', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>`,
                className: 'context-menu-danger' 
            }
        ];
    } else {
        // Menu items for empty space in file tree
        menuItems = [
            { 
                text: 'New File', 
                action: 'newFile', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>` 
            },
            { 
                text: 'New Folder', 
                action: 'newFolder', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                </svg>` 
            },
            { 
                text: 'Paste', 
                action: 'paste', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                </svg>` 
            },
            { type: 'divider' },
            { 
                text: 'Refresh', 
                action: 'refresh', 
                icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                </svg>` 
            }
        ];
    }
    // Create menu items
    menuItems.forEach(item => {
        if (item.hide) return;
        
        if (item.type === 'divider') {
            const divider = document.createElement('div');
            divider.className = 'context-menu-separator';
            contextMenu.appendChild(divider);
        } else {
            const menuItem = document.createElement('div');
            menuItem.className = `context-menu-item ${item.className || ''}`;
            menuItem.innerHTML = `${item.icon}<span>${item.text}</span>`;
            menuItem.dataset.action = item.action;
            menuItem.addEventListener('click', handleContextMenuClick);
            contextMenu.appendChild(menuItem);
        }
    });
    
    // Show and position the context menu
    contextMenu.classList.remove('hidden');
    contextMenu.style.display = 'block';
    
    // Position the context menu
    const rect = contextMenu.getBoundingClientRect();
    const x = Math.min(event.pageX, window.innerWidth - rect.width - 5);
    const y = Math.min(event.pageY, window.innerHeight - rect.height - 5);
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    
    // Store the clicked item for context menu actions
    contextMenu.clickedItem = clickedFile || clickedFolder;
    contextMenu.clickedType = clickedFile ? 'file' : (clickedFolder ? 'folder' : 'empty');
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
        contextMenu.classList.add('hidden');
        contextMenu.clickedItem = null;
    }
}

function handleContextMenuClick(event) {
    event.stopPropagation();
    const action = event.currentTarget.dataset.action;
    const contextMenu = document.getElementById('contextMenu');
    
    const clickedItem = contextMenu.clickedItem;
    const clickedType = contextMenu.clickedType;
    
    switch (action) {
        case 'open':
            if (clickedItem) {
                const fileName = clickedItem.dataset.name;
                if (fileName && projectFiles.has(fileName)) {
                    // Switch to existing tab or open file
                    if (openTabs.has(fileName)) {
                        switchToTab(fileName);
                    } else {
                        const fileData = projectFiles.get(fileName);
                        loadFileIntoTab(fileName, fileData.content || '');
                    }
                } else if (clickedType === 'folder') {
                    // Toggle folder expansion
                    const folderPath = clickedItem.dataset.path;
                    if (expandedFolders.has(folderPath)) {
                        expandedFolders.delete(folderPath);
                    } else {
                        expandedFolders.add(folderPath);
                    }
                    updateFileTree();
                }
            }
            break;
            

        case 'cut':
            if (clickedItem) {
                const itemName = clickedItem.dataset.name || clickedItem.dataset.path;
                // Store in clipboard for cut operation
                window.clipboardData = {
                    type: 'cut',
                    item: itemName,
                    isFolder: clickedType === 'folder',
                    sourceData: clickedType === 'folder' ? projectFolders.get(itemName) : projectFiles.get(itemName)
                };
                showToast(`${clickedType === 'folder' ? 'Folder' : 'File'} cut to clipboard`, 'success');
            }
            break;
            
        case 'copy':
            if (clickedItem) {
                const itemName = clickedItem.dataset.name || clickedItem.dataset.path;
                // Store in clipboard for copy operation
                window.clipboardData = {
                    type: 'copy',
                    item: itemName,
                    isFolder: clickedType === 'folder',
                    sourceData: clickedType === 'folder' ? projectFolders.get(itemName) : projectFiles.get(itemName)
                };
                showToast(`${clickedType === 'folder' ? 'Folder' : 'File'} copied to clipboard`, 'success');
            }
            break;
            
        case 'paste':
            if (window.clipboardData && window.clipboardData.item) {
                pasteItem(clickedItem, clickedType);
            } else {
                showToast('No item in clipboard to paste', 'error');
            }
            break;
            
        case 'rename':
            if (clickedItem) {
                const itemName = clickedItem.dataset.name || clickedItem.dataset.path;
                startRename(clickedItem, itemName, clickedType === 'folder');
            }
            break;
            
        case 'download':
            if (clickedItem && clickedType === 'file') {
                const fileName = clickedItem.dataset.name;
                downloadFile(fileName);
            }
            break;
            
        case 'properties':
            if (clickedItem) {
                showProperties(clickedItem, clickedType);
            }
            break;
            
        case 'newFile':
            createNewFile();
            break;
            
        case 'newFolder':
            createNewFolder();
            break;
            
        case 'refresh':
            updateFileTree();
            showToast('File tree refreshed', 'success');
            break;
            
        case 'delete':
            if (clickedItem) {
                const itemName = clickedItem.dataset.name || clickedItem.dataset.path;
                const itemType = clickedType === 'folder' ? 'folder' : 'file';
                showConfirmToast(
                    `Are you sure you want to delete this ${itemType}?`,
                    () => {
                        deleteItem(itemName, clickedType === 'folder');
                    },
                    () => {
                        showToast('Delete cancelled', 'info');
                    }
                );
            }
            break;
    }
    
    hideContextMenu();
}

// Show properties dialog
function showProperties(clickedItem, clickedType) {
    const itemName = clickedItem.dataset.name || clickedItem.dataset.path;
    let properties = '';
    
    if (clickedType === 'file') {
        const fileData = projectFiles.get(itemName);
        if (fileData) {
            const fileSize = fileData.content ? fileData.content.length : 0;
            const language = fileData.language || 'Unknown';
            const created = fileData.created || 'Unknown';
            
            properties = `File Properties:\n\n` +
                        `Name: ${itemName}\n` +
                        `Type: ${language}\n` +
                        `Size: ${fileSize} characters\n` +
                        `Language: ${language}\n` +
                        `Created: ${created}`;
        }
    } else if (clickedType === 'folder') {
        const folderData = projectFolders.get(itemName);
        if (folderData) {
            const fileCount = folderData.files ? folderData.files.size : 0;
            
            properties = `Folder Properties:\n\n` +
                        `Name: ${itemName}\n` +
                        `Type: Folder\n` +
                        `Files: ${fileCount}\n` +
                        `Path: ${folderData.path || itemName}`;
        }
    }
    
    if (properties) {
        alert(properties);
    } else {
        showToast('Properties not available', 'error');
    }
}

// Paste item from clipboard
function pasteItem(targetItem, targetType) {
    const clipboardData = window.clipboardData;
    if (!clipboardData || !clipboardData.item || !clipboardData.sourceData) {
        showToast('No valid item in clipboard', 'error');
        return;
    }
    
    const sourceItemName = clipboardData.item;
    const isSourceFolder = clipboardData.isFolder;
    const operationType = clipboardData.type; // 'cut' or 'copy'
    
    // Determine target folder
    let targetFolder = null;
    if (targetType === 'folder') {
        targetFolder = targetItem.dataset.path;
    } else if (targetType === 'file') {
        // If pasting on a file, paste in the same folder as the file
        const fileData = projectFiles.get(targetItem.dataset.name);
        targetFolder = fileData ? fileData.folder : null;
    }
    // If targetType is 'empty', targetFolder remains null (root)
    
    // Generate new name for the item
    let newItemName;
    if (targetFolder === null || targetFolder === '' || 
        (isSourceFolder && projectFolders.get(sourceItemName)?.folder === targetFolder) ||
        (!isSourceFolder && projectFiles.get(sourceItemName)?.folder === targetFolder)) {
        // Same folder - create copy with new name
        newItemName = generateUniqueItemName(sourceItemName, targetFolder, isSourceFolder);
    } else {
        // Different folder - use original name if available
        newItemName = isItemNameAvailable(sourceItemName, targetFolder, isSourceFolder) 
            ? sourceItemName 
            : generateUniqueItemName(sourceItemName, targetFolder, isSourceFolder);
    }
    
    // Create the new item
    if (isSourceFolder) {
        // Copy/move folder
        const sourceData = { ...clipboardData.sourceData };
        sourceData.folder = targetFolder;
        projectFolders.set(newItemName, sourceData);
        
        if (operationType === 'cut') {
            // Remove original folder
            projectFolders.delete(sourceItemName);
        }
    } else {
        // Copy/move file
        const sourceData = { ...clipboardData.sourceData };
        sourceData.folder = targetFolder;
        projectFiles.set(newItemName, sourceData);
        
        // Also copy file content
        if (fileContents.has(sourceItemName)) {
            fileContents.set(newItemName, fileContents.get(sourceItemName));
        }
        
        if (operationType === 'cut') {
            // Remove original file
            projectFiles.delete(sourceItemName);
            fileContents.delete(sourceItemName);
            
            // Close tab if file was open
            if (openTabs.has(sourceItemName)) {
                closeTab(sourceItemName);
            }
        }
    }
    
    // Clear clipboard if it was a cut operation
    if (operationType === 'cut') {
        window.clipboardData = null;
    }
    
    // Update UI
    updateFileTree();
    
    const actionText = operationType === 'cut' ? 'moved' : 'copied';
    const itemType = isSourceFolder ? 'Folder' : 'File';
    showToast(`${itemType} ${actionText} successfully`, 'success');
}

// Generate unique name for item in target folder
function generateUniqueItemName(originalName, targetFolder, isFolder) {
    const items = isFolder ? projectFolders : projectFiles;
    let counter = 1;
    let baseName = originalName;
    let extension = '';
    
    // For files, separate name and extension
    if (!isFolder && originalName.includes('.')) {
        const lastDotIndex = originalName.lastIndexOf('.');
        baseName = originalName.substring(0, lastDotIndex);
        extension = originalName.substring(lastDotIndex);
    }
    
    let newName = originalName;
    
    while (!isItemNameAvailable(newName, targetFolder, isFolder)) {
        newName = `${baseName}_copy${counter > 1 ? counter : ''}${extension}`;
        counter++;
    }
    
    return newName;
}

// Check if item name is available in target folder
function isItemNameAvailable(itemName, targetFolder, isFolder) {
    const items = isFolder ? projectFolders : projectFiles;
    
    for (const [name, data] of items) {
        if (name === itemName && data.folder === targetFolder) {
            return false;
        }
    }
    
    return true;
}

// Initialize context menu event listeners
function initializeContextMenu() {
    const fileTree = document.getElementById('fileTree');
    if (fileTree) {
        fileTree.addEventListener('contextmenu', showContextMenu);
    }
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#contextMenu')) {
            hideContextMenu();
        }
    });
    
    // Hide on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });
}

function createNewFileInContext(parentPath) {
    const parentElement = parentPath 
        ? document.querySelector(`[data-path="${parentPath}"]`)
        : document.getElementById('fileTree');
    
    if (parentElement) {
        const input = createInlineInput('file', 'newfile.txt', parentPath);
        parentElement.appendChild(input);
        input.focus();
    }
}

function createNewFolderInContext(parentPath) {
    const parentElement = parentPath 
        ? document.querySelector(`[data-path="${parentPath}"]`)
        : document.getElementById('fileTree');
    
    if (parentElement) {
        const input = createInlineInput('folder', 'New Folder', parentPath);
        parentElement.appendChild(input);
        input.focus();
    }
}

async function downloadFile(filePath) {
    try {
        const fileData = Array.from(projectFiles.values()).find(file => file.fullPath === filePath);
        if (!fileData) {
            showToast('File not found', 'error');
            return;
        }
        
        const content = fileContents.get(fileData.id) || '';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.name;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        showToast('Download started', 'success');
    } catch (error) {
        console.error('Error downloading file:', error);
        showToast('Failed to download file', 'error');
    }
}

// Add event listeners for context menu
document.addEventListener('DOMContentLoaded', () => {
    // Right-click on file tree
    const fileTree = document.getElementById('fileTree');
    
    if (fileTree) {
        // Single event listener for context menu
        fileTree.addEventListener('contextmenu', (e) => {
            // Only show for file tree items or empty space in tree
            if (e.target.closest('.file-entry, .folder, #fileTree')) {
                e.preventDefault();
                e.stopPropagation();
                showContextMenu(e);
            }
        });
    }
    
    // Hide context menu on click outside
    document.addEventListener('click', (e) => {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // Hide on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });
});

// Add CSS for context menu
const contextMenuCSS = `
.context-menu {
    position: fixed;
    background: #2d2d2d;
    border: 1px solid #3d3d3d;
    border-radius: 4px;
    padding: 5px 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    display: none;
    min-width: 180px;
}

.context-menu-item {
    padding: 8px 15px;
    color: #e0e0e0;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.context-menu-item:hover {
    background-color: #3d3d3d;
}

.context-menu-divider {
    height: 1px;
    background-color: #3d3d3d;
    margin: 5px 0;
}
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = contextMenuCSS;
document.head.appendChild(styleElement);

// Handle window resize
window.addEventListener('resize', function() {
    if (editor) {
        editor.layout();
    }
});

// Global functions for onclick handlers
window.applyCode = applyCode;
window.closeTab = closeTab;

// Status Bar Functions
function updateStatusBar() {
    const currentLineEl = document.getElementById('currentLine');
    const currentColumnEl = document.getElementById('currentColumn');
    const totalLinesEl = document.getElementById('totalLines');
    const fileSizeEl = document.getElementById('fileSize');
    
    if (!currentLineEl || !currentColumnEl || !totalLinesEl || !fileSizeEl) {
        return;
    }
    
    // Default values when no file is loaded
    let line = 0, column = 0, totalLines = 0, fileSize = '0 Bytes';
    let hasContent = false;
    
    // If no active tab or no open tabs, reset to defaults
    if (!activeTab || openTabs.size === 0) {
        currentLineEl.textContent = line;
        currentColumnEl.textContent = column;
        totalLinesEl.textContent = totalLines;
        fileSizeEl.textContent = fileSize;
        return;
    }
    
    try {
        if (editor && monaco) {
            // Get cursor position from Monaco Editor
            const position = editor.getPosition();
            const model = editor.getModel();
            
            if (model) {
                const content = model.getValue();
                hasContent = content.length > 0;
                
                if (hasContent) {
                    totalLines = model.getLineCount();
                    
                    if (position) {
                        line = position.lineNumber;
                        column = position.column;
                    }
                    
                    // Calculate file size
                    const sizeInBytes = new Blob([content]).size;
                    fileSize = formatFileSize(sizeInBytes);
                }
            }
        } else {
            // Fallback to textarea if Monaco Editor is not available
            const textarea = document.getElementById('codeEditor');
            if (textarea) {
                const content = textarea.value || '';
                hasContent = content.length > 0;
                
                if (hasContent) {
                    const lines = content.split('\n');
                    totalLines = lines.length;
                    
                    // Calculate cursor position in textarea
                    const cursorPos = textarea.selectionStart;
                    const textBeforeCursor = content.substring(0, cursorPos);
                    const linesBeforeCursor = textBeforeCursor.split('\n');
                    line = linesBeforeCursor.length;
                    column = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
                    
                    // Calculate file size
                    const sizeInBytes = new Blob([content]).size;
                    fileSize = formatFileSize(sizeInBytes);
                }
            }
        }
        
        // Check if we have any active tabs with content
        if (!hasContent && activeTab && openTabs.has(activeTab)) {
            const tabContent = openTabs.get(activeTab).content || '';
            if (tabContent.length > 0) {
                const lines = tabContent.split('\n');
                totalLines = lines.length;
                line = 1;
                column = 1;
                const sizeInBytes = new Blob([tabContent]).size;
                fileSize = formatFileSize(sizeInBytes);
            }
        }
        
    } catch (error) {
        console.log('Error updating status bar:', error);
    }
    
    // Update the status bar elements
    currentLineEl.textContent = line;
    currentColumnEl.textContent = column;
    totalLinesEl.textContent = totalLines;
    fileSizeEl.textContent = fileSize;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    if (i === 0) {
        return bytes + ' ' + sizes[i];
    }
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}



















/**
 * Saves the current file data to localStorage
 * @returns {void}
 */
// Track last save time to prevent excessive saves
let lastSaveTime = 0;
const MIN_SAVE_INTERVAL = 1000; // 1 second minimum between saves
function saveFileToLocalStorage() {
    // Don't save too frequently
    const now = Date.now();
    if (now - lastSaveTime < MIN_SAVE_INTERVAL) {
        return;
    }

    lastSaveTime = now;
    updateStatusBar();
    try {
        // Use the global activeTab variable which holds the file path/ID
        if (!activeTab) return;

        const tabData = openTabs.get(activeTab);
        if (!tabData) return;

        const filePath = activeTab; // activeTab is the key/path
        const fileName = tabData.name;

        // Get file content based on editor type (Monaco or textarea)
        let fileContent = '';
        if (editor && monaco) {
            fileContent = editor.getValue();
        } else {
            const textarea = document.getElementById('codeEditor');
            if (textarea) {
                fileContent = textarea.value;
            }
        }

        // Get existing file data from localStorage or initialize empty object
        const savedFiles = JSON.parse(localStorage.getItem('fileData') || '{}');

        // Update or add the current file data. This overwrites the existing entry if the key (filePath) matches.
        savedFiles[filePath] = {
            name: fileName,
            path: filePath,
            content: fileContent,
            lastModified: new Date().toISOString()
        };

        // Save back to localStorage
        localStorage.setItem('fileData', JSON.stringify(savedFiles));
        
    } catch (error) {
        console.error('Error saving file to localStorage:', error);
    }
}



// function saveFileToLocalStorage() {
//     // Don't save too frequently
//     const now = Date.now();
//     if (now - lastSaveTime < MIN_SAVE_INTERVAL) {
//         return;
//     }
    
//     lastSaveTime = now;
//     updateStatusBar();
//     try {
        
//         // Get the active tab
//         const activeTab = document.querySelector('.tab.active');
//         if (!activeTab) return;
        
//         const fileName = activeTab.textContent.trim();
//         const tabId = activeTab.getAttribute('data-tab');
//         const filePath = activeTab.getAttribute('data-path') || '/' + fileName;
        
//         // Get file content based on editor type (Monaco or textarea)
//         let fileContent = '';
//         if (editor && monaco) {
//             fileContent = editor.getValue();
//         } else {
//             const textarea = document.getElementById('codeEditor');
//             if (textarea) {
//                 fileContent = textarea.value;
//             }
//         }
        
//         // Create file data object
//         const fileData = {
//             name: fileName,
//             path: filePath,
//             content: fileContent,
//             lastModified: new Date().toISOString()
//         };
        
//         // Get existing file data from localStorage or initialize empty object
//         const savedFiles = JSON.parse(localStorage.getItem('fileData') || '{}');
        
//         // Update or add the current file data
//         savedFiles[filePath] = fileData;
        
//         // Save back to localStorage
//         localStorage.setItem('fileData', JSON.stringify(savedFiles));
        
//         console.log(`File ${fileName} saved to localStorage`);
        
//     } catch (error) {
//         console.error('Error saving file to localStorage:', error);
//     }
// }


// Loads and displays files from localStorage in the file tree
function loadFilesFromLocalStorage() {
    try {
        const savedFiles = JSON.parse(localStorage.getItem('fileData') || '{}');
        const fileTree = document.getElementById('fileTree');
        
        if (!fileTree) {
            console.error('File tree element not found');
            return;
        }
        
        console.log('Loading files from localStorage...', savedFiles);
        
        // Clear existing project data
        projectFiles.clear();
        projectFolders.clear();
        
        // Track processed paths to handle duplicates
        const processedPaths = new Set();
        
        // First pass: Create all folders
        for (const [path, fileData] of Object.entries(savedFiles)) {
            try {
                const pathParts = path.split('/');
                if (pathParts.length > 1) {
                    // This file is in a folder, ensure the folder exists
                    let currentPath = '';
                    for (let i = 0; i < pathParts.length - 1; i++) {
                        const folderName = pathParts[i];
                        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
                        
                        if (!projectFolders.has(currentPath)) {
                            projectFolders.set(currentPath, {
                                name: folderName,
                                path: currentPath,
                                parent: i > 0 ? pathParts.slice(0, i).join('/') : null
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(`Error creating folders for ${path}:`, error);
            }
        }
        
        // Second pass: Add all files
        for (const [path, fileData] of Object.entries(savedFiles)) {
            try {
                if (processedPaths.has(path)) continue;
                
                const fileName = fileData.name || path.split('/').pop();
                const fileContent = typeof fileData === 'object' ? fileData.content : fileData;
                
                console.log(`Processing file: ${path} (${fileName})`);
                
                // Add to project files
                const parentPath = path.includes('/') ? path.split('/').slice(0, -1).join('/') : null;
                const language = detectLanguageFromExtension(fileName) || 'plaintext';
                
                projectFiles.set(path, {
                    id: `file_${Date.now()}_${path}`,  // Ensure unique ID
                    name: fileName,
                    path: path,
                    language: language,
                    content: fileContent,
                    isModified: false,
                    lastModified: new Date().toISOString(),
                    type: 'file',
                    folder: parentPath
                });
                
                // Add to file contents with the same key used in loadFileIntoTab
                fileContents.set(path, fileContent);
                
                // Also add to openTabs with the same structure as loadFileIntoTab
                openTabs.set(path, {
                    id: path,
                    name: fileName,
                    language: language,
                    content: fileContent,
                    isModified: false,
                    folder: parentPath
                });
                
                processedPaths.add(path);
                console.log(`Successfully added file: ${path}`);
                
            } catch (error) {
                console.error(`Error processing file ${path}:`, error);
            }
        }

        console.log(`Successfully loaded ${processedPaths.size} files from localStorage`);
        
        // Update the file tree
        if (typeof updateFileTree === 'function') {
            updateFileTree();
        }
        
        // Load the first file if available
        if (processedPaths.size > 0) {
            const firstFilePath = processedPaths.values().next().value;
            const firstFile = projectFiles.get(firstFilePath);
            if (firstFile) {
                loadFileIntoTab(firstFile.name, firstFile.content, firstFile.path);
            }
        }
        
    } catch (error) {
        console.error('Error loading files from localStorage:', error);
        showToast('Error loading files from storage', 'error');
    }
}

// Set up file tree toggle to refresh when shown (files themselves are loaded after Monaco init)
document.addEventListener('DOMContentLoaded', () => {
    const fileTreeToggle = document.querySelector('.file-tree-toggle');
    if (fileTreeToggle) {
        fileTreeToggle.addEventListener('click', () => {
            setTimeout(() => {
                if (typeof loadFilesFromLocalStorage === 'function') {
                    loadFilesFromLocalStorage();
                }
            }, 100);
        });
    }
});











// Initialize status bar updates
function initializeStatusBar() {
    // Update status bar initially
    updateStatusBar();
    
    // Update status bar when Monaco Editor cursor position changes
    if (editor && monaco) {
        editor.onDidChangeCursorPosition(() => {
            updateStatusBar();
        });
        
        editor.onDidChangeModelContent(() => {
            updateStatusBar();
            saveFileToLocalStorage(); // Save immediately on change
        });
    }
    // Update status bar when textarea cursor position changes (fallback)
    const textarea = document.getElementById('codeEditor');
    if (textarea) {
        // Save on every change in Monaco editor
        editor.onDidChangeModelContent(() => {
            updateStatusBar();
            saveFileToLocalStorage(); // Save immediately on change
        });
        
        // Also save every 10 seconds as a backup
        setInterval(saveFileToLocalStorage, 10000);
        
        // Save on editor blur
        editor.onDidBlurEditorText(() => {
            saveFileToLocalStorage();
        });
        
        // Save on cursor position change
        editor.onDidChangeCursorPosition(() => {
            saveFileToLocalStorage();
        });
    }
    
    // Update status bar when switching tabs
    const originalSwitchToTab = window.switchToTab;
    if (originalSwitchToTab) {
        window.switchToTab = function(tabId) {
            originalSwitchToTab(tabId);
            setTimeout(updateStatusBar, 100); // Small delay to ensure editor is updated
        };
    }
}

// Call initializeStatusBar when Monaco Editor is ready
if (typeof initializeMonacoEditor === 'function') {
    const originalInitializeMonacoEditor = initializeMonacoEditor;
    initializeMonacoEditor = function() {
        originalInitializeMonacoEditor();
        setTimeout(initializeStatusBar, 500); // Delay to ensure Monaco is fully loaded
    };
} else {
    // Initialize immediately if Monaco Editor is not used
    document.addEventListener('DOMContentLoaded', initializeStatusBar);
}

// AI Context Manager
const aiContextManager = {
    currentContext: {
        language: null,
        filePath: null,
        projectStructure: {}
    },

    // Analyze user input to detect programming language and file context
    analyzeInput: function(input) {
        // Reset context
        this.resetContext();
        
        // Check for language-specific patterns
        const languagePatterns = {
            'python': /python|py\b/i,
            'javascript': /javascript|js\b/i,
            'html': /html\b/i,
            'css': /css\b/i,
            'java': /java\b/i,
            'c++': /c\+\+/i,
            'c#': /c#/i,
            'php': /php\b/i,
            'ruby': /ruby|rb\b/i,
            'go': /go\b|golang/i,
            'rust': /rust\b/i,
            'swift': /swift\b/i,
            'kotlin': /kotlin\b/i,
            'typescript': /typescript|ts\b/i,
            'c': /\bc\b(?!\+\+)/i,
            'c++': /c\+\+/i,
            'c#': /c#/i,
            'php': /php\b/i,
            'ruby': /ruby|rb\b/i,
            'go': /go\b|golang/i,
            'rust': /rust\b/i,
            'swift': /swift\b/i,
            'kotlin': /kotlin\b/i,
            'typescript': /typescript|ts\b/i,
            'json': /json\b/i,
            'markdown': /markdown|md\b/i,
            'yaml': /yaml|yml\b/i,
            'xml': /xml\b/i
        };

        // Detect language from input
        for (const [lang, pattern] of Object.entries(languagePatterns)) {
            if (pattern.test(input)) {
                this.currentContext.language = lang;
                break;
            }
        }

        // Try to detect file path in the input
        const filePathMatch = input.match(/(?:file|path)[\s:]+([\w\/.-]+\.[a-zA-Z0-9]+)/i);
        if (filePathMatch && filePathMatch[1]) {
            this.currentContext.filePath = filePathMatch[1];
        } else if (this.currentContext.language) {
            // If no explicit path but we have a language, create a default filename
            const ext = this.getExtensionForLanguage(this.currentContext.language);
            this.currentContext.filePath = `untitled.${ext}`;
        }

        return this.currentContext;
    },

    // Get file extension for a programming language
    getExtensionForLanguage: function(language) {
        const extensions = {
            'python': 'py',
            'javascript': 'js',
            'typescript': 'ts',
            'html': 'html',
            'css': 'css',
            'java': 'java',
            'c': 'c',
            'c++': 'cpp',
            'c#': 'cs',
            'php': 'php',
            'ruby': 'rb',
            'go': 'go',
            'rust': 'rs',
            'swift': 'swift',
            'kotlin': 'kt',
            'json': 'json',
            'markdown': 'md',
            'yaml': 'yaml',
            'xml': 'xml'
        };
        return extensions[language.toLowerCase()] || 'txt';
    },

    // Create a file from AI response
    createFileFromAIContext: function(content, fileName = null) {
        const filePath = fileName || this.currentContext.filePath;
        if (!filePath) return null;

        // Create the file
        if (typeof createFileFromInput === 'function') {
            createFileFromInput(filePath, window.selectedFolder);
            
            // Update the file content
            const tabId = window.selectedFolder ? 
                `${window.selectedFolder}/${filePath}` : filePath;
                
            if (window.openTabs && window.openTabs.has(tabId)) {
                const tab = window.openTabs.get(tabId);
                tab.content = content;
                tab.isModified = true;
                
                if (window.fileContents) {
                    window.fileContents.set(tabId, content);
                }
                
                // Update the editor if this is the active tab
                if (window.activeTab === tabId && window.monaco && window.monaco.editor) {
                    const editor = window.monaco.editor.getModels()[0];
                    if (editor) {
                        editor.setValue(content);
                    }
                }
                
                // Switch to the tab
                if (typeof switchToTab === 'function') {
                    switchToTab(tabId);
                }
                
                showToast(`Created file: ${filePath}`, 'success');
                return tabId;
            }
        }
        return null;
    },

    // Reset the current context
    resetContext: function() {
        this.currentContext = {
            language: null,
            filePath: null,
            projectStructure: {}
        };
    }
};

// Enhanced processFileOperations function
function processFileOperations(content) {
    // Process create file commands: [create_file] path/to/file [content]
    const createFileRegex = /\[create_file\]\s*([^\s\[\]]+)(?:\s*\[([\s\S]*?)\])?/g;
    let createMatch;
    let result = content;
    
    // Extract and process file creation commands
    const fileCreations = [];
    while ((createMatch = createFileRegex.exec(content)) !== null) {
        const filePath = createMatch[1].trim();
        const fileContent = (createMatch[2] || '').trim();
        fileCreations.push({ path: filePath, content: fileContent });
    }
    
    // Process each file creation
    fileCreations.forEach(({ path, content }) => {
        // Use the AI context manager to create the file
        aiContextManager.createFileFromAIContext(content, path);
    });
    
    // Process delete file commands: [delete_file] path/to/file
    const deleteFileRegex = /\[delete_file\]\s*([^\s\[\]]+)/g;
    let deleteMatch;
    while ((deleteMatch = deleteFileRegex.exec(content)) !== null) {
        const filePath = deleteMatch[1].trim();
        if (typeof deleteFile === 'function' && typeof showConfirmToast === 'function') {
            showConfirmToast(
                `Are you sure you want to delete "${filePath}"?`,
                () => {
                    deleteFile(filePath);
                    showToast(`File "${filePath}" deleted`, 'success');
                },
                () => {
                    showToast('File deletion cancelled', 'info');
                }
            );
        }
    }
    
    // Process delete folder commands: [delete_folder] path/to/folder
    const deleteFolderRegex = /\[delete_folder\]\s*([^\s\[\]]+)/g;
    let deleteFolderMatch;
    while ((deleteFolderMatch = deleteFolderRegex.exec(content)) !== null) {
        const folderPath = deleteFolderMatch[1].trim();
        if (typeof deleteFolder === 'function' && typeof showConfirmToast === 'function') {
            showConfirmToast(
                `Are you sure you want to delete the folder "${folderPath}" and all its contents?`,
                () => {
                    deleteFolder(folderPath);
                    showToast(`Folder "${folderPath}" deleted`, 'success');
                },
                () => {
                    showToast('Folder deletion cancelled', 'info');
                }
            );
        }
    }
    
    // Process code blocks in the AI response
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
    let codeBlockMatch;
    const codeBlocks = [];
    
    // Extract all code blocks
    while ((codeBlockMatch = codeBlockRegex.exec(content)) !== null) {
        const language = codeBlockMatch[1] || aiContextManager.currentContext.language || 'text';
        const code = codeBlockMatch[2].trim();
        codeBlocks.push({ language, code });
    }
    
    // If we have exactly one code block and a context, create a file
    if (codeBlocks.length === 1 && aiContextManager.currentContext.language) {
        const { language, code } = codeBlocks[0];
        const fileName = aiContextManager.currentContext.filePath || 
            `untitled.${aiContextManager.getExtensionForLanguage(language)}`;
        
        aiContextManager.createFileFromAIContext(code, fileName);
    } else if (codeBlocks.length > 1) {
        // Multiple code blocks - create files for each
        codeBlocks.forEach(({ language, code }, index) => {
            const fileName = `untitled_${index + 1}.${aiContextManager.getExtensionForLanguage(language)}`;
            aiContextManager.createFileFromAIContext(code, fileName);
        });
    }
    
    // Remove the file operation commands from the displayed content
    return result
        .replace(/\[create_file\][^\[]*/g, '')
        .replace(/\[delete_file\][^\[]*/g, '')
        .replace(/\[delete_folder\][^\[]*/g, '')
        .trim();
}

// Update the initializeChatSystem function to use the new context manager
function initializeChatSystem() {
    // Store the original appendMessage function if it exists
    const originalAppendMessage = window.appendMessage || function() {
        // Default implementation if appendMessage doesn't exist
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${arguments[1] || 'user'}`;
            messageDiv.textContent = arguments[0];
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    };

    // Override the global appendMessage function
    window.appendMessage = function(content, sender, save = true, userQuery = null, messageIndex = -1, stream = false, timestamp = null, userImages = null, hasGeneratedImage = false, imageBase64 = null) {
        // Process user messages to update AI context
        if (sender === 'user' && content) {
            aiContextManager.analyzeInput(content);
        }
        
        // Process file operations for AI messages
        if (sender === 'ai' && content) {
            content = processFileOperations(content);
        }
        
        // Call the original appendMessage function
        return originalAppendMessage(content, sender, save, userQuery, messageIndex, stream, timestamp, userImages, hasGeneratedImage, imageBase64);
    };
}

// File Mention System
const fileMentionState = {
    isActive: false,
    startPos: -1,
    query: '',
    selectedIndex: 0,
    files: []
};

// Get all files for mention
function getFilesForMention() {
    const files = [];
    projectFiles.forEach((file, path) => {
        files.push({
            name: path.split('/').pop(),
            path: path,
            language: file.language || detectLanguageFromExtension(path)
        });
    });
    return files;
}

// Filter files based on query
function filterFiles(query) {
    if (!query) return fileMentionState.files;
    const q = query.toLowerCase();
    return fileMentionState.files.filter(file => 
        file.name.toLowerCase().includes(q) || 
        file.path.toLowerCase().includes(q)
    );
}

// Hide file mention dropdown
function hideFileMentionDropdown() {
    const dropdown = document.getElementById('fileMentionDropdown');
    if (dropdown) dropdown.style.display = 'none';
    fileMentionState.isActive = false;
    fileMentionState.query = '';
    fileMentionState.selectedIndex = 0;
}
