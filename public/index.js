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

        const aiText = await response.text(); // just take AI's raw response
        displayResults(aiText);

    } catch (err) {
        console.error(err);
        alert("Error analyzing terms. Check console for details.");
    } finally {
        analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2"></i> Analyze Terms';
        feather.replace();
    }
}

// Show AI output in organized box
function displayResults(aiText) {
    resultsSection.classList.remove('hidden');

    // Reset fields
    scoreValue.textContent = "N/A";
    scoreBar.style.width = "0%";
    safetyBadge.textContent = "";
    redFlagsList.innerHTML = "";
    neutralPointsList.innerHTML = "";

    // Simple "score" detection
    const scoreMatch = aiText.match(/score\s*[:=]?\s*(\d{1,3})/i);
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

    // Put the AI response directly in the redFlagsList for simplicity
    redFlagsList.innerHTML = `<pre class="whitespace-pre-wrap text-gray-700">${aiText}</pre>`;

    // Keep yellow flags empty if you want, or could duplicate same text there
    neutralPointsList.innerHTML = "";

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function clearInput() {
    termsInput.value = '';
    resultsSection.classList.add('hidden');
}
