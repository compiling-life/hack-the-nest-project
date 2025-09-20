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

// Replace with your Gemini API key
const GEMINI_API_KEY = "AIzaSyCmRSRYBlLQZOtui1RfN784sZF4Cb1EpaE";

analyzeBtn.addEventListener('click', analyzeTerms);
clearBtn.addEventListener('click', clearInput);

async function analyzeWithGemini(text) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    // Clear, explicit instructions for Gemini
    const prompt = `
Analyze the following Terms of Service and Privacy Policy.
Identify clauses that may be risky or harmful to the user.
Classify them as:
- Red Flag: High risk or very user-unfriendly
- Yellow Flag: Medium risk or somewhat concerning
Include neutral points.
Give an overall safety score from 0 to 100.
Return the results as JSON with this format:
{
  "score": number,
  "redFlags": [{"title": string, "description": string}],
  "neutralPoints": [{"title": string, "description": string}]
}

Terms:
${text}
`;

    const body = {
        contents: [
            { parts: [{ text: prompt }] }
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
        // Gemini returns text in result.candidates[0].content[0].text
        const generatedText = result.candidates[0].content[0].text;

        // Try to parse JSON from Gemini response
        let analysis;
        try {
            analysis = JSON.parse(generatedText);
        } catch (err) {
            console.error("Error parsing Gemini output as JSON:", err);
            analysis = {
                score: 50,
                redFlags: [{ title: "Parsing Error", description: generatedText }],
                neutralPoints: []
            };
        }

        displayResults(analysis);

    } catch (err) {
        console.error(err);
        alert("Error analyzing terms. Check console for details.");
    } finally {
        analyzeBtn.innerHTML = '<i data-feather="search" class="w-5 h-5 mr-2"></i> Analyze Terms';
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

    // Populate red flags
    redFlagsList.innerHTML = "";
    analysis.redFlags.forEach(flag => {
        redFlagsList.innerHTML += `
        <div class="p-4 border-l-4 border-red-500 bg-red-50 rounded-r">
            <h5 class="font-semibold text-red-800">${flag.title}</h5>
            <p class="text-gray-700 mt-1">${flag.description}</p>
        </div>
        `;
    });

    // Populate neutral points
    neutralPointsList.innerHTML = "";
    analysis.neutralPoints.forEach(point => {
        neutralPointsList.innerHTML += `
        <div class="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r">
            <h5 class="font-semibold text-blue-800">${point.title}</h5>
            <p class="text-gray-700 mt-1">${point.description}</p>
        </div>
        `;
    });

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function clearInput() {
    termsInput.value = '';
    resultsSection.classList.add('hidden');
}
