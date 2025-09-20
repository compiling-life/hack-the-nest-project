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

// Replace with your Gemini API key (keep private, don't push to public repos)
const GEMINI_API_KEY = "AIzaSyCmRSRYBlLQZOtui1RfN784sZF4Cb1EpaE"; 

async function analyzeWithGemini(text) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    // This prompt tells Gemini exactly what to look for
    const prompt = `
Analyze the following Terms of Service and Privacy Policy. 
Identify any clauses that may be risky, unfair, or harmful to the user. 
Classify them as:
- Red Flag: High risk or very user-unfriendly
- Yellow Flag: Medium risk or somewhat concerning
Also include neutral points and give an overall safety score from 0 to 100. 
Respond in a clear format that can be displayed directly in a web UI.

Terms:
${text}
`;

    const body = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    return data;
}


async function analyzeTerms() {
    const text = termsInput.value.trim();
    if (!text) {
        alert('Please paste some terms text to analyze.');
        return;
    }

    analyzeBtn.innerHTML = '<i data-feather="loader" class="w-5 h-5 mr-2 animate-spin"></i> Analyzing...';
    feather.replace();

    try {
        const result = await analyzeWithGemini(text);
        const analysisText = result.candidates[0].content[0].text;

        // Clear previous results
        redFlagsList.innerHTML = '';
        neutralPointsList.innerHTML = '';
        
        // Display analysis in a simple way (you can later parse JSON if you ask Gemini for structured output)
        redFlagsList.innerHTML = `<div class="p-4 bg-yellow-50 rounded">${analysisText}</div>`;

        // Show results section
        resultsSection.classList.remove('hidden');

        // Set dummy score (replace with parsed score if structured JSON used)
        const score = 70; // default for demo
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

        analyzeBtn.innerHTML = '<i data-feather="search" class="w-5 h-5 mr-2"></i> Analyze Terms';
        feather.replace();

    } catch (err) {
        console.error(err);
        alert("Error analyzing terms. Check console for details.");
        analyzeBtn.innerHTML = '<i data-feather="search" class="w-5 h-5 mr-2"></i> Analyze Terms';
        feather.replace();
    }
}

function clearInput() {
    termsInput.value = '';
    resultsSection.classList.add('hidden');
}
