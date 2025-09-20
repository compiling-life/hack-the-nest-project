AOS.init();
feather.replace();

const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const termsInput = document.getElementById('terms-input');
const resultsSection = document.getElementById('results-section');
const aiOutput = document.getElementById('ai-output');

analyzeBtn.addEventListener('click', analyzeTerms);
clearBtn.addEventListener('click', clearInput);

async function analyzeTerms() {
    const terms = termsInput.value.trim();
    if (!terms) {
        alert('Please paste some terms first.');
        return;
    }

    analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2 animate-spin"></i> Analyzing...';
    feather.replace();
    resultsSection.classList.remove('hidden');
    aiOutput.innerHTML = '';

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ terms })
        });

        const data = await response.json();

        if (data.error) {
            displayTyping(`❌ ${data.error}`);
        } else {
            displayTyping(markdownToHTML(data.output));
        }

    } catch (err) {
        console.error("Error fetching AI:", err);
        displayTyping("❌ Error analyzing terms. Check console for details.");
    } finally {
        analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2"></i> Analyze Terms';
        feather.replace();
    }
}

// Typing effect function with HTML/Markdown support
function displayTyping(html) {
    const container = aiOutput;
    let i = 0;

    // Split HTML into tags and text
    const chunks = html.match(/(<[^>]+>|[^<]+)/g);

    function typeChunk() {
        if (i >= chunks.length) return;

        const chunk = chunks[i];

        if (chunk.startsWith('<')) {
            // Append HTML tags immediately
            container.innerHTML += chunk;
        } else {
            // Type text character by character
            let charIndex = 0;
            function typeChar() {
                if (charIndex < chunk.length) {
                    container.innerHTML += chunk[charIndex];
                    charIndex++;
                    setTimeout(typeChar, 15); // adjust typing speed here
                } else {
                    i++;
                    typeChunk();
                }
            }
            typeChar();
            return;
        }

        i++;
        typeChunk();
    }

    typeChunk();
}

// Markdown to HTML converter
function markdownToHTML(md) {
    let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>');

    // Wrap list items in <ul>
    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    return html;
}

function clearInput() {
    termsInput.value = '';
    resultsSection.classList.add('hidden');
    aiOutput.innerHTML = '';
}

// About Me Modal
const aboutLink = document.querySelector('a[href="about-me"]'); // selects your link
const aboutModal = document.getElementById('about-modal');
const closeModal = document.getElementById('close-modal');

aboutLink.addEventListener('click', (e) => {
    e.preventDefault(); // prevents the page from navigating
    aboutModal.classList.remove('hidden'); // shows the modal
});

closeModal.addEventListener('click', () => {
    aboutModal.classList.add('hidden'); // hides the modal when clicking the X
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.add('hidden');
    }
});
