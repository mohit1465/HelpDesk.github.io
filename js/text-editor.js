let currentTabId = 'Untitled.txt';
let currentFileHandle = null;
let selectedDirectoryItem = null;
let currentSearchState = null;
let searchTimeout = null;

const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
    extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-L": function(cm) {
            let line = prompt("Enter line number:");
            if (line) cm.setCursor({line: Number(line) - 1, ch: 0});
        },
        "Ctrl-F": "findPersistent"
    },
    hintOptions: { 
        completeSingle: false
    }
});

editor.setSize(null, "95vh");

const tabContents = {};


document.querySelectorAll('#new-file').forEach(function(element) {
    element.addEventListener('click', createNewFile);
});
document.getElementById('open-file').addEventListener('click', handleFileOpen);
document.getElementById('save-file').addEventListener('click', saveFile);
document.getElementById('save-as-file').addEventListener('click', saveAsFile);
document.getElementById('file-input').addEventListener('change', handleFileOpen);
document.getElementById('change-name').addEventListener('click', changeFileNameAndExtension);
document.getElementById('metaMenu').addEventListener('click', toggleUserMenu);
document.getElementById('save-online').addEventListener('click', saveFileOnline);
document.getElementById('load-file').addEventListener('click', loadFileOnline);

const suggestionsBox = document.getElementById('suggestions');

editor.on('change', function(cm, change) {
    const activeTab = document.querySelector('.tab.active');
    const fileType = activeTab.id.split('.').pop();
    if (suggestions.common[fileType]) {
        const lastWord = getLastWord(cm);
        
        if (/^\s*$/.test(lastWord)) {
            hideSuggestions();
        } else {
            const matchedSuggestions = filterSuggestions(lastWord, suggestions.common[fileType]);
            if (matchedSuggestions.length > 0) {
                showSuggestions(matchedSuggestions, suggestions.common[fileType]);
            } else {
                hideSuggestions();
            }
        }
    }
});

function getLastWord(cm) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    const words = line.substring(0, cursor.ch).split(/\s+/);
    return words[words.length - 1];
}

function filterSuggestions(input, suggestionGroup) {
    return Object.keys(suggestionGroup).filter(suggestionKey => {
        const suggestionValue = suggestionGroup[suggestionKey];
        return suggestionValue.toLowerCase().includes(input.toLowerCase()) || isSimilar(input, suggestionValue);
    });
}


function isSimilar(input, suggestion) {
    const inputLower = input.toLowerCase();
    const suggestionLower = suggestion.toLowerCase();

    if (suggestionLower.startsWith(inputLower)) {
        return true;
    }

    let i = 0, j = 0;
    while (i < inputLower.length && j < suggestionLower.length) {
        if (inputLower[i] === suggestionLower[j]) {
            i++;
        }
        j++;
    }

    return i === inputLower.length;
}

function showSuggestions(filteredSuggestions, fullSuggestions) {
    suggestionsBox.innerHTML = '';
    filteredSuggestions.forEach(suggestionKey => {
        const suggestionItem = document.createElement('p');
        suggestionItem.textContent = suggestionKey;
        suggestionItem.addEventListener('click', function() {
            insertSuggestion(suggestionKey, fullSuggestions[suggestionKey]);
        });
        suggestionsBox.appendChild(suggestionItem);
    });
    updateCaretPosition();
    suggestionsBox.style.display = 'block';
}

function hideSuggestions() {
    suggestionsBox.style.display = 'none';
}

function insertSuggestion(suggestionKey, suggestionValue) {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const words = line.split(/\s+/);

    words[words.length - 1] = suggestionValue;
    const updatedLine = words.join(' ');

    editor.replaceRange(updatedLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
    hideSuggestions();
    editor.focus();
}

function updateCaretPosition() {
    const cursorPos = editor.getCursor();
    const charCoords = editor.charCoords(cursorPos, 'local');
    
    const editorWrapper = editor.getWrapperElement();
    
    suggestionsBox.style.left = `${charCoords.left + editorWrapper.offsetLeft}px`;
    suggestionsBox.style.top = `${charCoords.bottom + editorWrapper.offsetTop + 5}px`;
}

document.addEventListener('click', function(event) {
    if (!editor.getWrapperElement().contains(event.target) && !suggestionsBox.contains(event.target)) {
        hideSuggestions();
    }
});

function createNewFile(file_name) {
    let baseName = 'Untitled';
    let ext = 'txt';
    let newName = `${baseName}.${ext}`;
    let counter = 2;

    while (document.getElementById(newName)) {
        newName = `${baseName}_${counter}.${ext}`;
        counter++;
    }

    addTab(newName);
}

function addTab(name) {
    const tabContainer = document.getElementById('tabs');
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = name;
    tab.textContent = name;

    addFileToDirectory(name);

    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.className = 'close-tab';
    closeBtn.onclick = (event) => {
        event.stopPropagation();
        if (tabContainer.children.length > 1) {
            if (confirm('Are you sure you want to close this tab?')) {
                delete tabContents[tab.id];
                tab.remove();
                removeFileFromDirectory(name);
                
                if (tab.classList.contains('active')) {
                    const remainingTabs = tabContainer.children;
                    if (remainingTabs.length > 0) {
                        remainingTabs[0].click();
                    }
                }
            }
        } else {
            alert('At least one tab must be open.');
        }
    };

    tab.appendChild(closeBtn);
    tab.onclick = () => {
        setActiveTab(tab);
        selectDirectoryItemByFileName(name);
    };

    tabContainer.appendChild(tab);
    setActiveTab(tab);
}

function addFileToDirectory(fileName) {
    const dirTabs = selectedDirectoryItem && selectedDirectoryItem.classList.contains('folder') 
        ? selectedDirectoryItem.querySelector('ul') 
        : document.getElementById('dirTabs');

    if (!dirTabs) return;

    const fileItem = document.createElement('li');
    fileItem.textContent = fileName;
    fileItem.dataset.fileName = fileName;

    fileItem.onclick = function (e) {
        e.stopPropagation();
        selectDirectoryItem(fileItem);
        selectTabByFileName(fileName);
    };

    dirTabs.appendChild(fileItem);
}

function addFolder(folderName) {
    const dirTabs = selectedDirectoryItem && selectedDirectoryItem.classList.contains('folder') 
        ? selectedDirectoryItem.querySelector('ul') 
        : document.getElementById('dirTabs');

    if (!dirTabs) return;

    const folderItem = document.createElement('li');
    folderItem.classList.add('folder');
    folderItem.textContent = folderName;

    const subList = document.createElement('ul');
    folderItem.appendChild(subList);

    const folderArrow = document.createElement('span');
    folderArrow.textContent = " >  ";
    folderItem.prepend(folderArrow);

    folderItem.onclick = function (e) {
        e.stopPropagation();
        this.classList.toggle('open'); 
        selectDirectoryItem(folderItem);
    };

    dirTabs.appendChild(folderItem);
}

function selectDirectoryItem(item) {
    const allItems = document.querySelectorAll('#dirTabs li, .folder');
    allItems.forEach(el => el.classList.remove('selected'));

    item.classList.add('selected');
    selectedDirectoryItem = item;
}

function selectDirectoryItemByFileName(fileName) {
    const allDirectoryItems = document.querySelectorAll('#dirTabs li');
    allDirectoryItems.forEach(item => {
        if (item.textContent === fileName) {
            selectDirectoryItem(item);
        }
    });
}

function selectTabByFileName(fileName) {
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => {
        if (tab.id === fileName) {
            setActiveTab(tab);
        }
    });
}

function removeFileFromDirectory(fileName) {
    const allDirectoryItems = document.querySelectorAll('#dirTabs li');
    allDirectoryItems.forEach(item => {
        if (item.dataset.fileName === fileName) {
            item.remove();
        }
    });
}

function setActiveTab(tab) {
    if (currentTabId) {
        tabContents[currentTabId] = editor.getValue();
    }
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    currentTabId = tab.id;

    editor.setValue(tabContents[currentTabId] || '');

    document.getElementById('editor').value = tabContents[currentTabId] || '';
    const allItems = document.querySelectorAll('.directory li');
    allItems.forEach(item => item.classList.remove('selected'));

    allItems.forEach(item => {
        if (item.textContent === tab.id) {
            item.classList.add('selected');
        }
    });
    const folders = document.querySelectorAll('.directory .folder');
    folders.forEach(folder => {
        folder.classList.add('open');
    });
}


function createCloseButton(tab) {
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.className = 'close-tab';
    closeBtn.onclick = () => {
        if (document.querySelectorAll('.tab').length > 1) {
            if (confirm('Are you sure you want to close this tab?')) {
                delete tabContents[tab.id];
                tab.remove();
                if (tab.classList.contains('active')) {
                    document.querySelector('.tab').click();
                }
            }
        } else {
            alert('At least one tab must be open.');
        }
    };
    return closeBtn;
}

async function saveFile() {
    if (!currentFileHandle) {
        saveAsFile();
        return;
    }

    const writable = await currentFileHandle.createWritable();
    await writable.write(editor.getValue());
    await writable.close();
    alert('File saved successfully.');
}

async function saveAsFile() {
    const defaultFileName = currentTabId || 'Untitled.txt';
    
    const options = {
        suggestedName: defaultFileName,
        types: [{
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] }
        }]
    };

    try {
        const fileHandle = await window.showSaveFilePicker(options);
        const newFileName = fileHandle.name;

        if (currentFileHandle) {
            const existingTab = document.getElementById(currentTabId);
            if (existingTab) {
                existingTab.id = newFileName;
                existingTab.textContent = newFileName;

                const closeBtn = existingTab.querySelector('.close-tab');
                if (!closeBtn) {
                    const newCloseBtn = document.createElement('span');
                    newCloseBtn.textContent = '×';
                    newCloseBtn.className = 'close-tab';
                    newCloseBtn.onclick = () => {
                        if (document.querySelectorAll('.tab').length > 1) {
                            if (confirm('Are you sure you want to close this tab?')) {
                                delete tabContents[existingTab.id]; // Remove content of closed tab
                                existingTab.remove();
                                if (existingTab.classList.contains('active')) {
                                    document.querySelector('.tab').click(); // Activate first tab
                                }
                            }
                        } else {
                            alert('At least one tab must be open.');
                        }
                    };
                    existingTab.appendChild(newCloseBtn);
                }
                tabContents[newFileName] = editor.getValue();
                delete tabContents[currentTabId];
                currentTabId = newFileName;
                editor.setValue(tabContents[currentTabId] || '');
            }
        }
        currentFileHandle = fileHandle;
        await saveFile();
    } catch (err) {
        console.error('Error saving file:', err);
    }
}

async function handleFileOpen() {
    try {
        [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const contents = await file.text();
        document.getElementById('editor').value = contents;

        addTab(file.name);
        editor.setValue(contents);
        currentFileHandle = fileHandle;
        tabContents[currentTabId] = contents;
    } catch (err) {
        console.error(err);
    }
}

function changeFileNameAndExtension() {
    const activeTab = document.querySelector('.tab.active');
    console.log(activeTab.id);
    const selectedList = document.querySelector('#dirTabs .selected');

    if (activeTab && selectedList) {
        const newFullName = prompt('Enter the new file name and extension (e.g., myFile.js):', activeTab.id);
        if (newFullName) {
            const nameParts = newFullName.split('.');

            if (nameParts.length < 2) {
                alert('Invalid format! Please include both a file name and extension.');
                return;
            }

            const newId = newFullName;

            // Check if the new file name already exists in tabContents or directory
            if (tabContents[newId]) {
                alert('A file with that name already exists.');
                return;
            }

            // Save the content under the new name in tabContents
            tabContents[newId] = tabContents[activeTab.id];
            delete tabContents[activeTab.id];

            // Update the tab's id and textContent
            activeTab.id = newId;
            activeTab.textContent = newId;

            // Update the directory list item
            selectedList.textContent = newFullName;
            selectedList.setAttribute('data-file-name', newFullName);

            // Reassign onclick handlers for both tab and directory item
            activeTab.onclick = () => {
                setActiveTab(activeTab);
                selectDirectoryItemByFileName(newFullName);
            };

            selectedList.onclick = (e) => {
                e.stopPropagation();
                selectDirectoryItem(selectedList);
                selectTabByFileName(newFullName);
            };

            // Recreate the close button with updated logic
            const closeBtn = document.createElement('span');
            closeBtn.textContent = '×';
            closeBtn.className = 'close-tab';
            closeBtn.onclick = (event) => {
                event.stopPropagation(); 
                if (document.querySelectorAll('.tab').length > 1) {
                    if (confirm('Are you sure you want to close this tab?')) {
                        delete tabContents[activeTab.id];
                        activeTab.remove();
                        removeFileFromDirectory(newFullName); // Update this to remove file from directory
                        if (activeTab.classList.contains('active')) {
                            document.querySelector('.tab').click();
                        }
                    }
                } else {
                    alert('At least one tab must be open.');
                }
            };
            activeTab.appendChild(closeBtn);
        }
    }
}

editor.on('cursorActivity', () => {
    const { line, ch } = editor.getCursor();
    document.getElementById('cursor-position').textContent = `Ln: ${line + 1}, Col: ${ch + 1}`;
});

editor.on('change', () => {
    const lineCount = editor.lineCount();
    document.getElementById('total-lines').textContent = `Total Ln: ${lineCount}`;
    document.getElementById('file-size').textContent = `File Size: ${(new Blob([editor.getValue()]).size / 1024).toFixed(2)} KB`;

    const activeTab = document.querySelector('.tab.active');
    const fileExtension = activeTab.id.split('.').pop();
    updateOutput(fileExtension);

    if (!currentFileHandle) {
        return;
    }
    else{
        const writable = currentFileHandle.createWritable();
        writable.write(editor.getValue());
        writable.close();
        alert('File saved successfully.');
    }
});

function updateOutput(fileExtension) {
    const content = editor.getValue();
    const outputFrame = document.getElementById('outputFrame');
    const outputDocument = outputFrame.contentDocument || outputFrame.contentWindow.document;

    outputDocument.open();
    outputDocument.write('');
    
    if (fileExtension === 'html') {
        outputDocument.write(content);
    } else if (fileExtension === 'css') {
        outputDocument.write('<style>' + content + '</style>');
    } else if (fileExtension === 'js') {
        outputDocument.write('<script>' + content + '<\/script>');
    } else {
        outputDocument.write('<h3 style="text-align:center;">Currently we can only provide HTML file Output.</h3>');
    }

    outputDocument.close();
}

function redirectToLogin() {
    const pageName = window.location.pathname.split("/").pop();
    localStorage.setItem('lastPage', pageName);
    const confirmation = confirm("Before you Leave must save your files locally.")
    if (confirmation) {
        window.location.href = 'login-signup.html';
    }
}

async function saveFileOnline() {
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to save files.");
        return;
    }

    const fileName = prompt("Enter the file name:");
    const fileID = prompt("Enter a unique file ID:");
    const filePassword = prompt("Enter a password for the file:");

    if (!fileName || !fileID || !filePassword) {
        alert("Please provide a file name, unique file ID, and password.");
        return;
    }

    const content = editor.getValue();

    const existingFile = await db.collection('files').doc(fileID).get();
    if (existingFile.exists) {
        alert("File ID already exists. Please choose a different ID.");
        return;
    }

    await db.collection('files').doc(fileID).set({
        content: content,
        name: fileName,
        password: filePassword,
        userId: user.uid,
        timestamp: new Date().toISOString()
    });

    alert("File saved successfully!");

    loadUserFiles();
}

async function loadFileOnline() {
    const fileID = prompt("Enter the file ID:");
    const filePassword = prompt("Enter the file password:");

    if (!fileID || !filePassword) {
        alert("Please provide both file ID and password.");
        return;
    }

    const fileDoc = await db.collection('files').doc(fileID).get();

    if (!fileDoc.exists) {
        alert("No file found with this ID.");
        return;
    }

    const fileData = fileDoc.data();

    if (fileData.password !== filePassword) {
        alert("Incorrect password. Access denied.");
        return;
    }

    loadFileIntoTab(fileData.name, fileData.content);
    alert("File loaded successfully!");
}

function loadFileIntoTab(fileName, fileContents) {    
    addTab(fileName);
    editor.setValue(fileContents);
    tabContents[currentTabId] = fileContents;
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
            alert('Error fetching user data.');
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
    alert("Logged out successfully!");
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const fileName = localStorage.getItem('selectedFileName');
    const fileContents = localStorage.getItem('selectedFileContent');

    if (fileName) {
        if (fileContents !== null) {
            loadFileIntoTab(fileName, fileContents);
        } else {
            loadFileIntoTab(fileName, '');
        }
        localStorage.removeItem('selectedFileName');
        localStorage.removeItem('selectedFileContent');
    } else {
        console.log("No file selected.");
    }
});


function setTheme(theme) {
    document.body.className = theme;
    editor.setOption('theme', theme === 'light' ? 'default' : 'dracula');
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        logoimg.src = 'assets/Text Editor logo dark.png';
        editor.setOption('theme', 'dracula');
    } else {
        body.removeAttribute('data-theme');
        logoimg.src = 'assets/Text Editor logo light.png';
        editor.setOption('theme', 'light');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    loadUserFiles();
});

window.onload = () => {
    addTab('Untitled.txt');
    const savedTheme = localStorage.getItem('currentTheme') || 'light';
    setTheme(savedTheme);
    initializeSearch();
};

const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const logoimg = document.getElementById('logo');
const footerlogoimg = document.getElementById('footerLogo');

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        logoimg.src = 'assets/Text Editor logo light.png';
        editor.setOption('theme', 'light'); // Update CodeMirror theme
        localStorage.setItem('currentTheme', 'light'); // Save theme
    } else {
        // Switch to dark theme
        body.setAttribute('data-theme', 'dark');
        logoimg.src = 'assets/Text Editor logo dark.png';
        editor.setOption('theme', 'dracula'); // Update CodeMirror theme
        localStorage.setItem('currentTheme', 'dark'); // Save theme
    }
});


// function toggleMenu() {
//     const profileInfo = document.getElementById('profileInfo-box');
    
//     if (profileInfo.style.display === 'none' || profileInfo.style.display === '') {
//         profileInfo.style.display = 'block';
//     } else {
//         profileInfo.style.display = 'none';
//     }
// }


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

document.addEventListener('click', function(event) {
    const profileInfo = document.getElementById('profileInfo-box');
    const toggleBtn = document.getElementById('metaMenu');

    if (!profileInfo.contains(event.target) && !toggleBtn.contains(event.target)) {
        profileInfo.style.display = 'none';
    }
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

// Add window resize event listener to handle width changes
window.addEventListener('resize', function() {
    const middleDiv = document.getElementById('middleDiv');
    const isMobileView = window.matchMedia('(max-width: 850px)').matches;
    
    if (isMobileView) {
        middleDiv.style.width = '100%';
    }
});

// Initial check on page load
document.addEventListener('DOMContentLoaded', function() {
    const middleDiv = document.getElementById('middleDiv');
    const isMobileView = window.matchMedia('(max-width: 850px)').matches;
    
    if (isMobileView) {
        middleDiv.style.width = '100%';
    }
});

// Add event listener to close sidebars when clicking outside
document.addEventListener('click', function(event) {
    if (window.innerWidth <= 850) {
        const leftDiv = document.getElementById('leftDiv');
        const rightDiv = document.getElementById('rightDiv');
        const btnLeft = document.querySelector('.btn-left');
        const btnRight = document.querySelector('.btn-right');

        // Close left sidebar if clicking outside
        if (!leftDiv.contains(event.target) && !btnLeft.contains(event.target)) {
            leftDiv.classList.remove('show');
        }

        // Close right sidebar if clicking outside
        if (!rightDiv.contains(event.target) && !btnRight.contains(event.target)) {
            rightDiv.classList.remove('show');
        }
    }
});

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


const dirTabs = document.getElementById('dirTabs');
const contextMenu = document.getElementById('context-menu');
let clickedItem = null;

function showContextMenu(event) {
    event.preventDefault();
    const posX = event.clientX;
    const posY = event.clientY;
    contextMenu.style.left = `${posX}px`;
    contextMenu.style.top = `${posY}px`;
    contextMenu.style.display = 'block';
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
}

dirTabs.addEventListener('contextmenu', function(event) {
    if (event.target.tagName === 'LI') {
        clickedItem = event.target;
        showContextMenu(event);
    }
});

function removeFile(fileName) {
    const tab = document.getElementById(fileName);
    console.log(fileName);

    if (!tab) {
        alert('File not found.');
        return;
    }

    if (document.querySelectorAll('.tab').length > 1) {
        if (confirm(`Are you sure you want to close the tab: ${fileName}?`)) {
            removeFileFromDirectory(fileName);
            delete tabContents[fileName];
            tab.remove();

            if (tab.classList.contains('active')) {
                const remainingTabs = document.querySelectorAll('.tab');
                if (remainingTabs.length > 0) {
                    remainingTabs[0].click();
                }
            }
        }
    } else {
        alert('At least one tab must be open.');
    }
}

function removeItem(item) {
    if (item.classList.contains('folder')) {
        const folderName = item.textContent.trim();
        const confirmDeletion = confirm(`Are you sure you want to delete the folder: ${folderName}? This will delete all files and folders inside it.`);

        if (confirmDeletion) {
            const subfolders = item.querySelectorAll('.folder');
            subfolders.forEach(subfolder => removeItem(subfolder)); // Recursive removal of subfolders

            const files = item.querySelectorAll('ul li[data-file-name]');
            console.log(files);
            files.forEach(file => removeFile(file.dataset.fileName)); // Remove files in the folder

            item.remove(); // Remove the folder itself
            alert(`Folder ${folderName} and all its contents have been deleted.`);
        }
    } else {
        // If the item is a file, remove it directly
        const fileName = item.dataset.fileName;
        removeFile(fileName);
    }
}

document.querySelectorAll('.context-menu ul li').forEach(function (menuItem) {
    menuItem.addEventListener('click', function () {
        if (clickedItem) {
            removeItem(clickedItem);
            hideContextMenu(); // Assuming this is the function to hide context menu
        }
    });
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

// Add after editor initialization
function initializeSearch() {
    const searchPanel = document.getElementById('searchReplacePanel');
    const searchInput = document.getElementById('searchInput');
    const replaceInput = document.getElementById('replaceInput');
    const replaceRow = document.getElementById('replaceRow');
    const matchCount = document.getElementById('matchCount');
    
    // Search options
    const matchCase = document.getElementById('matchCase');
    const wholeWord = document.getElementById('wholeWord');
    const regexSearch = document.getElementById('regexSearch');

    function clearSearch() {
        if (currentSearchState) {
            currentSearchState.markers.forEach(marker => marker.clear());
            currentSearchState = null;
        }
        matchCount.textContent = 'No results';
    }

    function findNext() {
        if (!currentSearchState || currentSearchState.markers.length === 0) return;
        
        currentSearchState.currentMatch++;
        if (currentSearchState.currentMatch >= currentSearchState.markers.length) {
            currentSearchState.currentMatch = 0;
        }
        
        const marker = currentSearchState.markers[currentSearchState.currentMatch];
        const pos = marker.find();
        editor.setCursor(pos.from);
        editor.scrollIntoView({ from: pos.from, to: pos.to }, 20);
    }

    function findPrev() {
        if (!currentSearchState || currentSearchState.markers.length === 0) return;
        
        currentSearchState.currentMatch--;
        if (currentSearchState.currentMatch < 0) {
            currentSearchState.currentMatch = currentSearchState.markers.length - 1;
        }
        
        const marker = currentSearchState.markers[currentSearchState.currentMatch];
        const pos = marker.find();
        editor.setCursor(pos.from);
        editor.scrollIntoView({ from: pos.from, to: pos.to }, 20);
    }

    function replace() {
        if (!currentSearchState || currentSearchState.markers.length === 0) return;
        
        const marker = currentSearchState.markers[currentSearchState.currentMatch];
        const pos = marker.find();
        if (pos) {
            editor.replaceRange(replaceInput.value, pos.from, pos.to);
            performSearch(); // Refresh search
        }
    }

    function replaceAll() {
        if (!currentSearchState) return;
        
        editor.operation(() => {
            let cursor = editor.getSearchCursor(currentSearchState.regex);
            while (cursor.findNext()) {
                cursor.replace(replaceInput.value);
            }
        });
        performSearch(); // Refresh search
    }

    function performSearch() {
        // Clear any existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout to prevent too many searches while typing
        searchTimeout = setTimeout(() => {
            const searchTerm = searchInput.value;
            if (!searchTerm) {
                matchCount.textContent = 'No results';
                clearSearch();
                return;
            }

            let searchQuery = searchTerm;
            if (wholeWord.checked) {
                searchQuery = `\\b${searchQuery}\\b`;
            }
            
            try {
                const searchRegex = new RegExp(
                    regexSearch.checked ? searchTerm : searchQuery,
                    `g${matchCase.checked ? '' : 'i'}`
                );

                // Clear previous search
                clearSearch();

                // Perform new search
                let cursor = editor.getSearchCursor(searchRegex);
                let matches = 0;
                let markers = [];

                while (cursor.findNext()) {
                    matches++;
                    markers.push(editor.markText(cursor.from(), cursor.to(), {
                        className: 'CodeMirror-search-match'
                    }));
                }

                currentSearchState = {
                    regex: searchRegex,
                    markers: markers,
                    currentMatch: -1
                };

                matchCount.textContent = `${matches} match${matches !== 1 ? 'es' : ''}`;
                if (matches > 0) findNext();
            } catch (e) {
                matchCount.textContent = 'Invalid regex';
            }
        }, 150);
    }

    // Event listeners
    searchInput.addEventListener('input', performSearch);
    matchCase.addEventListener('change', performSearch);
    wholeWord.addEventListener('change', performSearch);
    regexSearch.addEventListener('change', performSearch);
    
    document.getElementById('findNext').addEventListener('click', findNext);
    document.getElementById('findPrev').addEventListener('click', findPrev);
    document.getElementById('replaceBtn').addEventListener('click', replace);
    document.getElementById('replaceAllBtn').addEventListener('click', replaceAll);
    document.getElementById('closeSearch').addEventListener('click', () => {
        searchPanel.style.display = 'none';
        clearSearch();
    });
    document.getElementById('toggleReplace').addEventListener('click', () => {
        replaceRow.style.display = replaceRow.style.display === 'none' ? 'flex' : 'none';
    });
}

function toggleSearchPanel() {
    const searchPanel = document.getElementById('searchReplacePanel');
    const searchInput = document.getElementById('searchInput');
    const isHidden = searchPanel.style.display === 'none' || !searchPanel.style.display;

    searchPanel.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        searchInput.focus();
        if (searchInput.value) {
            // Trigger search if there's already text in the input
            searchInput.dispatchEvent(new Event('input'));
        }
    } else {
        clearSearch();
    }

    return false;
}

// Add keyboard shortcut
document.addEventListener('keydown', function(e) {
    // Ctrl+F or Cmd+F (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault(); // Prevent browser's default find
        toggleSearchPanel();
    }
    
    // Ctrl+H or Cmd+H (Mac) for replace
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggleSearchPanel();
        document.getElementById('replaceRow').style.display = 'flex';
        document.getElementById('replaceInput').focus();
    }
});









