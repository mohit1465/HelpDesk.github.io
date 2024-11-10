let currentTabId = 'Untitled.txt';
let currentFileHandle = null;
let selectedDirectoryItem = null;

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
document.getElementById('metaMenu').addEventListener('click', toggleMenu);
document.getElementById('save-online').addEventListener('click', saveFileOnline);
document.getElementById('load-file').addEventListener('click', loadFileOnline);

editor.on('inputRead', function(instance, changeObj) {
    const cursor = editor.getCursor();
    const token = editor.getTokenAt(cursor);
    const searchTerm = token.string.trim();

    if (searchTerm) {
        updateFilteredSuggestions(searchTerm);
    } else {
        updateSuggestions(currentTabId);
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
        if (item.textContent === fileName) {
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
    updateSuggestions(currentTabId);

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

function updateSuggestions(filename) {
    const extension = filename.split('.').pop();
    const suggestionContainer = document.querySelector('.suggestions');
    suggestionContainer.innerHTML = '';

    if (suggestions[`.${extension}`]) {
        suggestions[`.${extension}`].forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = suggestion;
            suggestionDiv.onclick = () => {
                editor.replaceSelection(suggestion);
                editor.focus(); 
            };
            suggestionContainer.appendChild(suggestionDiv);
        });
    }
}

function updateFilteredSuggestions(searchTerm) {
    const activeTab = document.querySelector('.tab.active');
    const extension = activeTab.id.split('.').pop();
    const suggestionContainer = document.querySelector('.suggestions');
    suggestionContainer.innerHTML = '';

    if (suggestions[`.${extension}`]) {
        const filteredSuggestions = suggestions[`.${extension}`].filter(suggestion =>
            suggestion.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredSuggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = suggestion;
            suggestionDiv.onclick = () => {
                editor.replaceSelection(suggestion);
                editor.focus(); 
            };
            suggestionContainer.appendChild(suggestionDiv);
        });
    }
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
    const selectedList = document.querySelector('#dirTabs .selected');

    if (activeTab && selectedList) {
        const newFullName = prompt('Enter the new file name and extension (e.g., myFile.js):');
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
            updateSuggestions(newId);
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
});

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
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                document.getElementById('profileInfo').innerHTML = `
                    <h2>${userData.name}</h2>
                    <p>Email: ${userData.email}</p>
                    <button onclick="logoutUser()">Logout</button>`;
                document.getElementById('profilefiles').innerHTML = `
                    <h4>My Files</h4>
                    <div id='users-files'></div>
                    <div id='users-files-bottom-option'>
                        <a href="#"><i class="fas fa-folder-plus bottom-option-icon filesBtn"></i></a>
                        <a href="#"><i class="fas fa-cog bottom-option-icon settings"></i></a>
                    </div>`;

                loadUserFiles();
            } else {
                document.getElementById('profileInfo').innerHTML = `
                    <h2>No user data found</h2>
                    <p>Please complete your profile.</p>
                    <button onclick="logoutUser()">Logout</button>`;
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
        document.getElementById('profileInfo').innerHTML = `
            <h2>No user data found</h2>
            <p>Please login</p>
            <a onclick="redirectToLogin()">Login | Signup</a>`;
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

function toggleMenu() {
    const profileInfo = document.getElementById('profileInfo-box');
    
    if (profileInfo.style.display === 'none' || profileInfo.style.display === '') {
        profileInfo.style.display = 'block';
    } else {
        profileInfo.style.display = 'none';
    }
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
    const middleDiv = document.getElementById('middleDiv');
    const leftDiv = document.getElementById('leftDiv');
    const rightDiv = document.getElementById('rightDiv');

    // Toggle visibility of the selected div
    if (div.style.display === 'none') {
        div.style.display = 'block';
    } else {
        div.style.display = 'none';
    }

    // Adjust the middle div's width based on visibility of left or right
    if (leftDiv.style.display === 'none' && rightDiv.style.display === 'none') {
        middleDiv.style.width = '100%';
    } else if (leftDiv.style.display === 'none') {
        middleDiv.style.width = '75%';
    } else if (rightDiv.style.display === 'none') {
        middleDiv.style.width = '75%';
    } else {
        middleDiv.style.width = '30%';
    }
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

document.addEventListener('click', hideContextMenu);

document.querySelector('.context-menu ul li').addEventListener('click', function() {
    if (clickedItem) {
        const fileName = clickedItem.dataset.fileName;
        removeFile(fileName);
        hideContextMenu();
    }
});

function removeFile(fileName) {
    const tab = document.getElementById(fileName);

    if (!tab) {
        alert('File not found.');
        return;
    }
    
    if (document.querySelectorAll('.tab').length > 1) {
        removeFileFromDirectory(fileName)
        if (confirm(`Are you sure you want to close the tab: ${fileName}?`)) {
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


