document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    if (generateBtn) {
        generateBtn.addEventListener('click', startNotesGeneration);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadNotes);
    }

    document.querySelectorAll('.sidebar-nav li[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav li').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            item.classList.add('active');

            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.remove('active');
            });

            const sectionId = item.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                if (sectionId === 'ai-notes') {
                    const inputSection = targetSection.querySelector('.input-section');
                    if (inputSection) {
                        inputSection.style.display = 'block';
                    }
                    
                    const generateBtn = targetSection.querySelector('#generateBtn');
                    if (generateBtn) {
                        generateBtn.style.display = 'block';
                    }
                }
            }
        });
    });

    const aiNotesLink = document.querySelector('[data-section="ai-notes"]');
    if (aiNotesLink) {
        aiNotesLink.click();
    }

    const notesOutput = document.getElementById('notesOutput');
    const aiNotesSection = document.querySelector('.ai-notes-section');
    
    if (notesOutput && notesOutput.innerHTML.trim() !== '') {
        aiNotesSection.classList.add('has-notes');
    } else {
        aiNotesSection.classList.remove('has-notes');
    }

    const textarea = document.querySelector('textarea');
    if (textarea) {
        let defaultHeight = '50px';
        
        function adjustHeight() {
            if (document.activeElement === textarea) {
                textarea.style.height = defaultHeight;
                const scrollHeight = Math.min(textarea.scrollHeight, 300);
                textarea.style.height = scrollHeight + 'px';
                textarea.style.overflowY = textarea.scrollHeight > 300 ? 'auto' : 'hidden';
            }
        }

        textarea.addEventListener('input', adjustHeight);

        textarea.addEventListener('focus', function() {
            adjustHeight();
        });

        textarea.addEventListener('blur', function() {
            this.style.height = defaultHeight;
            this.style.overflowY = 'hidden';
        });
    }
});

const GEMINI_API_KEY = CONFIG?.GEMINI_API_KEY || '';
const GROQ_API_KEY = CONFIG?.GROQ_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let currentPlan = [];
let currentStep = 0;

function getPlanningPrompt() {
    return `You are a study plan generator. Return ONLY a JSON array of study sections. Create section according to user says.

Format MUST be exactly:
[
    {
        "title": "clear section title",
        "prompt": "detailed instructions for generating this section"
    }
]

Rules:
1. Return ONLY the JSON array, nothing else
2. No HTML, markdown, or explanatory text
3. Each section should cover one main concept
4. Start with basics, progress to complex topics
5. Ensure JSON is valid and properly formatted`;
}

function getContentPrompt() {
    return `You MUST format your response using HTML tags only. Format requirements:

<div class="content-section">
    <h1>Main topics use h1 tags</h1>
    
    <h2>Subtopics use h2 tags</h2>
    <p>All explanatory text must be in paragraph tags</p>
    
    <h3>Points and Details</h3>
    <ul>
        <li>List items must use proper list tags</li>
        <li>Each point should be properly structured</li>
    </ul>
    
    <pre><code class="language-javascript">
    // Code examples must use pre and code tags
    function example() {
        return "Like this";
    }
    </code></pre>
    
    <table>
        <thead>
            <tr><th>Column 1</th><th>Column 2</th></tr>
        </thead>
        <tbody>
            <tr><td>Data</td><td>Description</td></tr>
        </tbody>
    </table>
</div>`;
}

// Update the queryAI function to handle planning vs content responses differently
async function queryAI(prompt, isPlanning = false, retryWithGroq = true) {
    try {
        const systemPrompt = isPlanning ? getPlanningPrompt() : getContentPrompt();
        let formattedPrompt;
        
        if (isPlanning) {
            formattedPrompt = `${systemPrompt}\n\nIMPORTANT: You MUST return ONLY valid JSON array. No HTML, no markdown, no extra text.\n\nCreate a study plan for: ${prompt}`;
        } else {
            formattedPrompt = `${systemPrompt}\n\nIMPORTANT: Return content in HTML format for: ${prompt}`;
        }
        
        const response = await queryGemini(formattedPrompt);
        return isPlanning ? response : formatResponse(response);
    } catch (error) {
        if (retryWithGroq) {
            console.log('Falling back to Groq API...');
            return await queryGroq(prompt, isPlanning);
        }
        throw error;
    }
}

// Add a function to get system prompt
function getSystemPrompt() {
    return `You MUST format your response using HTML tags only. Format requirements:

<div class="content-section">
    <h1>Main topics use h1 tags</h1>
    
    <h2>Subtopics use h2 tags</h2>
    <p>All explanatory text must be in paragraph tags</p>
    
    <h3>Points and Details</h3>
    <ul>
        <li>List items must use proper list tags</li>
        <li>Each point should be properly structured</li>
    </ul>
    
    <pre><code class="language-javascript">
    // Code examples must use pre and code tags
    function example() {
        return "Like this";
    }
    </code></pre>
    
    <table>
        <thead>
            <tr><th>Column 1</th><th>Column 2</th></tr>
        </thead>
        <tbody>
            <tr><td>Data</td><td>Description</td></tr>
        </tbody>
    </table>
</div>`;
}

// Update queryGemini to handle the system prompt
async function queryGemini(prompt) {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
}

// Update queryGroq to use the same system prompt
async function queryGroq(prompt) {
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
                role: 'system',
                content: getSystemPrompt()
            }, {
                role: 'user',
                content: prompt
            }]
        })
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.choices[0].message.content;
}

// Update startNotesGeneration function
async function startNotesGeneration() {
    if (!GEMINI_API_KEY && !GROQ_API_KEY) {
        alert('No API keys configured');
        return;
    }

    const userInput = document.getElementById('userInput').value;
    if (!userInput) {
        alert('Please enter a topic');
        return;
    }

    // Show progress section
    document.querySelector('.progress-section').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'none';
    const outputDiv = document.getElementById('notesOutput');
    outputDiv.innerHTML = '';

    try {
        // Get the plan
        const planningPrompt = `${userInput}`;
        const planResponse = await queryAI(planningPrompt, true);
        
        // Clean and parse JSON
        let cleanJson = planResponse
            .trim()
            .replace(/^[^[]*/, '')  // Remove anything before [
            .replace(/][^]*$/, ']')  // Remove anything after ]
            .replace(/```json\s*|\s*```/g, ''); // Remove code blocks
            
        try {
            currentPlan = JSON.parse(cleanJson);
        } catch (jsonError) {
            console.error('JSON parsing failed:', jsonError);
            console.log('Received response:', planResponse);
            throw new Error('Failed to generate a valid study plan. Please try again.');
        }

        // Validate plan structure
        if (!Array.isArray(currentPlan) || currentPlan.length === 0) {
            throw new Error('Invalid plan format received');
        }

        currentStep = 0;
        
        // Generate notes section by section
        let fullNotes = [];
        for (let i = 0; i < currentPlan.length; i++) {
            updateProgress(i, currentPlan.length);
            const section = currentPlan[i];
            
            if (!section.title || !section.prompt) {
                console.warn(`Skipping invalid section at index ${i}:`, section);
                continue;
            }
            
            const content = await queryAI(section.prompt, false);
            fullNotes.push(`
                <div class="notes-section">
                    ${content}
                </div>
            `);
            
            // Update display with all sections processed so far
            outputDiv.innerHTML = fullNotes.join('\n');
        }

        document.querySelector('.progress-section').style.display = 'none';
        document.getElementById('downloadBtn').style.display = 'block';

        // Add has-notes class when notes are generated
        const aiNotesSection = document.querySelector('.ai-notes-section');
        aiNotesSection.classList.add('has-notes');
    } catch (error) {
        // Remove has-notes class if there's an error
        const aiNotesSection = document.querySelector('.ai-notes-section');
        aiNotesSection.classList.remove('has-notes');
        
        outputDiv.textContent = `Error: ${error.message}`;
        document.querySelector('.progress-section').style.display = 'none';
    }

    try {
        // Add fixed-bottom class to input section
        const inputSection = document.querySelector('.input-section');
        const aiNotesSection = document.querySelector('.ai-notes-section');
        
        // Move download button to new container
        const notesOutput = document.getElementById('notesOutput');
        const downloadBtn = document.getElementById('downloadBtn');
        
        // Create notes header if it doesn't exist
        let notesHeader = document.querySelector('.notes-header');
        if (!notesHeader) {
            notesHeader = document.createElement('div');
            notesHeader.className = 'notes-header';
            
            // Add title element
            const title = document.createElement('h2');
            title.textContent = 'AI Notes';
            title.style.margin = '0';
            notesHeader.appendChild(title);
            
            // Move download button to header
            notesHeader.appendChild(downloadBtn);
            
            notesOutput.parentNode.insertBefore(notesHeader, notesOutput);
        }

        // Add classes for fixed positioning
        inputSection.classList.add('fixed-bottom');
        aiNotesSection.classList.add('has-fixed-input');

        // ...rest of your existing code...
    } catch (error) {
        // ...existing error handling...
    }
}

function updateProgress(current, total) {
    const progress = document.querySelector('.progress');
    const percentage = (current / total) * 100;
    progress.style.width = `${percentage}%`;
    document.getElementById('currentStep').textContent = 
        `Generating section ${current + 1} of ${total}...`;
}

async function downloadNotes() {
    const notesSections = document.querySelectorAll('.notes-section');

    if (!notesSections || notesSections.length === 0) {
        alert('No notes to download. Please generate notes first.');
        return;
    }

    const docContent = [];
  
    notesSections.forEach(notesContent => {
        const children = Array.from(notesContent.children);
        
        children.forEach(node => {
            if (node.tagName === 'TABLE') {
                const headers = Array.from(node.querySelectorAll('th')).map(th => th.textContent.trim());
                const rows = Array.from(node.querySelectorAll('tbody tr')).map(tr => 
                    Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
                );
                
                docContent.push({
                    table: {
                        headerRows: 1,
                        widths: Array(headers.length).fill('*'),
                        body: [headers, ...rows]
                    },
                    style: 'tableStyle',
                    layout: {
                        hLineWidth: function(i, node) { return 1; },
                        vLineWidth: function(i, node) { return 1; },
                        hLineColor: function(i, node) { return '#ddd'; },
                        vLineColor: function(i, node) { return '#ddd'; },
                        paddingLeft: function(i, node) { return 8; },
                        paddingRight: function(i, node) { return 8; },
                        paddingTop: function(i, node) { return 6; },
                        paddingBottom: function(i, node) { return 6; }
                    }
                });
            } else if (node.tagName === 'H1') {
                docContent.push({ text: node.textContent, style: 'header1', pageBreak: docContent.length > 0 ? 'before' : undefined });
            } else if (node.tagName === 'H2') {
                docContent.push({ text: node.textContent, style: 'header2' });
            } else if (node.tagName === 'H3') {
                docContent.push({ text: node.textContent, style: 'header3' });
            } else if (node.tagName === 'P') {
                docContent.push({ text: node.textContent, style: 'paragraph' });
            } else if (node.tagName === 'PRE') {
                const code = node.querySelector('code');
                if (code) {
                    docContent.push({
                        text: code.textContent,
                        style: 'codeBlock'
                    });
                }
            } else if (node.tagName === 'UL') {
                const lis = Array.from(node.querySelectorAll('li'));
                const bulletItems = lis.map(li => li.innerText.trim());
                docContent.push({ ul: bulletItems, style: 'bulletList' });
            }
        });
    });

    const docDefinition = {
        content: docContent,
        styles: {
            header1: { fontSize: 20, bold: true, color: '#0047AB', margin: [0, 10, 0, 6] },
            header2: { fontSize: 18, bold: true, color: '#006400', margin: [0, 8, 0, 4] },
            header3: { fontSize: 16, bold: true, color: '#444', margin: [0, 5, 0, 4] },
            paragraph: {
                fontSize: 14,
                color: '#333333',
                margin: [0, 4, 0, 4]
            },
            bulletList: {
                fontSize: 13,
                margin: [20, 4, 0, 4]
            },
            codeBlock: {
                font: 'Poppins', // Change from 'Courier' to 'Poppins'
                fontSize: 11,
                background: '#f5f5f5',
                margin: [10, 5, 10, 5],
                padding: [5, 5, 5, 5],
                lineHeight: 1.2,
                preserveLeadingSpaces: true
            },
            tableStyle: {
                margin: [0, 5, 0, 15],
                fontSize: 12
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: '#333333',
                fillColor: '#f8f9fa'
            }
        },
        defaultStyle: {
            fontSize: 12,
            font: 'Poppins'  // Change this from 'Roboto' to 'Poppins'
        },
        pageMargins: [40, 60, 40, 60]
    };


    pdfMake.fonts = {
    Poppins: {
    normal: 'https://cdn.jsdelivr.net/npm/@fontsource/poppins@4.5.0/files/poppins-latin-400-normal.woff',
    bold: 'https://cdn.jsdelivr.net/npm/@fontsource/poppins@4.5.0/files/poppins-latin-700-normal.woff',
    italics: 'https://cdn.jsdelivr.net/npm/@fontsource/poppins@4.5.0/files/poppins-latin-400-italic.woff',
    bolditalics: 'https://cdn.jsdelivr.net/npm/@fontsource/poppins@4.5.0/files/poppins-latin-700-italic.woff'
    },
    Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique'
    }
    };

    pdfMake.createPdf(docDefinition).download("AI_Notes.pdf");
}


// Update formatResponse function
function formatResponse(text) {
    // Remove markdown code block syntax
    text = text.replace(/```html?\s*([\s\S]*?)\s*```/g, '$1');
    text = text.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
    
    // Sanitize potentially unsafe HTML
    const sanitizeHtml = (html) => {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    };

    // Process code blocks first
    text = text.replace(/<pre><code.*?>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
        return match.replace(code, sanitizeHtml(code));
    });

    // Add classes for styling
    text = text
        .replace(/<h1>/g, '<h1 class="main-heading">')
        .replace(/<h2>/g, '<h2 class="sub-heading">')
        .replace(/<h3>/g, '<h3 class="sub-heading-2">')
        .replace(/<pre><code/g, '<pre class="code-block"><code')
        .replace(/<table>/g, '<table class="notes-table">')
        .replace(/<ul>/g, '<ul class="bullet-list">')
        .replace(/<p>/g, '<p class="content-paragraph">');

    // Remove duplicate content-section divs
    text = text.replace(/<div class="content-section">/g, '');
    text = text.replace(/<\/div>\s*<\/div>/g, '</div>');

    // Clean up whitespace
    text = text.replace(/\n\s*\n/g, '\n');
    
    return text;
}

// Add to existing main.js
document.querySelectorAll('.sidebar-nav li').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.sidebar-nav li').forEach(i => {
            i.classList.remove('active');
        });
        // Add active class to clicked item
        item.classList.add('active');
    });
});

// Section switching functionality
document.querySelectorAll('.sidebar-nav li[data-section]').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all sidebar items
        document.querySelectorAll('.sidebar-nav li').forEach(navItem => {
            navItem.classList.remove('active');
        });
        
        // Add active class to clicked item
        item.classList.add('active');

        // Hide all sections
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const sectionId = item.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

// Set dashboard as default active section
document.querySelector('[data-section="ai-notes"]').click();