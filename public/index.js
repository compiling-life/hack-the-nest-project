AOS.init();
feather.replace();

const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const termsInput = document.getElementById('terms-input');
const resultsSection = document.getElementById('results-section');
const safetyBadge = document.getElementById('safety-badge');
const scoreValue = document.getElementById('score-value');
const scoreBar = document.getElementById('score-bar');
const redFlagsList = document.getElementById('red-flags-list');
const neutralPointsList = document.getElementById('neutral-points-list');

analyzeBtn.addEventListener('click', analyzeTerms);
clearBtn.addEventListener('click', clearInput);

async function analyzeTerms() {
    const text = termsInput.value.trim();
    if (!text) { alert('Paste some terms.'); return; }

    analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2 animate-spin"></i> Analyzing...';
    feather.replace();

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const aiText = await response.text(); // <-- keep as text, not JSON
        displayResults(aiText);

    } catch (err) {
        console.error(err);
        alert("Error analyzing terms. Check console for details.");
    } finally {
        analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2"></i> Analyze Terms';
        feather.replace();
    }
}

// ---- Updated displayResults with flexible parsing ----
function displayResults(aiText) {
    resultsSection.classList.remove('hidden');

    scoreValue.textContent = "N/A";
    scoreBar.style.width = "0%";
    safetyBadge.textContent = "";
    redFlagsList.innerHTML = "";
    neutralPointsList.innerHTML = "";

    // Flexible score parsing
    const scoreMatch = aiText.match(/(?:overall\s*score|score)[^\d]{0,5}(\d{1,3})/i);
    let score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    if (score !== null) {
        scoreValue.textContent = `${score}/100`;
        scoreBar.style.width = `${score}%`;

        if (score >= 80) {
            safetyBadge.textContent = "Safe";
            safetyBadge.className = "ml-4 px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800";
            scoreBar.className = "h-4 rounded-full bg-green-500";
        } else if (score >= 50) {
            safetyBadge.textContent = "Moderate";
            safetyBadge.className = "ml-4 px-4 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800";
            scoreBar.className = "h-4 rounded-full bg-yellow-500";
        } else {
            safetyBadge.textContent = "High Risk";
            safetyBadge.className = "ml-4 px-4 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800";
            scoreBar.className = "h-4 rounded-full bg-red-500";
        }
    }

    // Flexible flags parsing
    const lines = aiText.split(/\r?\n/);
    let currentSection = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        if (/red flag/i.test(line)) currentSection = 'red';
        else if (/yellow flag/i.test(line)) currentSection = 'yellow';
        else if (/neutral/i.test(line)) currentSection = null;

        if (currentSection && /^[-\d.]/.test(line)) {
            const cleanLine = line.replace(/^[-\d.\s]+/, '');
            if (currentSection === 'red') {
                redFlagsList.innerHTML += `
                <div class="p-4 border-l-4 border-red-500 bg-red-50 rounded-r">
                    <p class="text-gray-700">${cleanLine}</p>
                </div>`;
            } else if (currentSection === 'yellow') {
                neutralPointsList.innerHTML += `
                <div class="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r">
                    <p class="text-gray-700">${cleanLine}</p>
                </div>`;
            }
        }
    });

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function clearInput() {
    termsInput.value = '';
    resultsSection.classList.add('hidden');
}
