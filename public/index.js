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

        const analysis = await response.json(); // <- THIS IS ALREADY JSON!

        // Ensure required fields exist
        analysis.score = analysis.score ?? 50;
        analysis.redFlags = analysis.redFlags ?? [];
        analysis.neutralPoints = analysis.neutralPoints ?? [];

        displayResults(analysis);

    } catch (err) {
        console.error(err);
        alert("Error analyzing terms. Check console for details.");
    } finally {
        analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2"></i> Analyze Terms';
        feather.replace();
    }
}

function displayResults(analysis) {
    resultsSection.classList.remove('hidden');

    scoreValue.textContent = `${analysis.score}/100`;
    scoreBar.style.width = `${analysis.score}%`;

    if (analysis.score >= 80) {
        safetyBadge.textContent = "Safe";
        safetyBadge.className = "ml-4 px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800";
        scoreBar.className = "h-4 rounded-full bg-green-500";
    } else if (analysis.score >= 50) {
        safetyBadge.textContent = "Moderate";
        safetyBadge.className = "ml-4 px-4 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800";
        scoreBar.className = "h-4 rounded-full bg-yellow-500";
    } else {
        safetyBadge.textContent = "High Risk";
        safetyBadge.className = "ml-4 px-4 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800";
        scoreBar.className = "h-4 rounded-full bg-red-500";
    }

    redFlagsList.innerHTML = "";
    analysis.redFlags.forEach(flag => {
        redFlagsList.innerHTML += `
        <div class="p-4 border-l-4 border-red-500 bg-red-50 rounded-r">
            <h5 class="font-semibold text-red-800">${flag.title}</h5>
            <p class="text-gray-700 mt-1">${flag.description}</p>
        </div>`;
    });

    neutralPointsList.innerHTML = "";
    analysis.neutralPoints.forEach(point => {
        neutralPointsList.innerHTML += `
        <div class="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r">
            <h5 class="font-semibold text-blue-800">${point.title}</h5>
            <p class="text-gray-700 mt-1">${point.description}</p>
        </div>`;
    });

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function clearInput() {
    termsInput.value = '';
    resultsSection.classList.add('hidden');
}
