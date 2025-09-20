AOS.init();

feather.replace();

// Sample analysis data (in a real app, this would come from an API)
const sampleAnalysis = {
score: 72,
safety: "Moderate",
redFlags: [
{
title: "Data Sharing with Third Parties",
description: "The terms allow sharing your data with numerous third-party services without clear limitations.",
severity: "high"
},
{
title: "Arbitration Clause",
description: "Contains a mandatory arbitration clause that limits your ability to sue in court.",
severity: "medium"
},
{
title: "Automatic Renewal",
description: "The agreement includes an automatic renewal clause that may lead to unexpected charges.",
severity: "medium"
}
],
neutralPoints: [
{
title: "Data Retention Policy",
description: "The policy states data will be retained for 12 months after account closure."
},
{
title: "Cookie Usage",
description: "The terms clearly explain cookie usage and provide opt-out options."
}
]
};

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

function analyzeTerms() 
{
    const text = termsInput.value.trim();

    if (!text) 
    {
        alert('Please paste some terms text to analyze.');

        return;
    }

    analyzeBtn.innerHTML = '<i data-feather="loader" class="w-5 h-5 mr-2 animate-spin"></i> Analyzing...';

    feather.replace();

    setTimeout(() => 
    {
        displayResults(sampleAnalysis);

        analyzeBtn.innerHTML = '<i data-feather="search" class="w-5 h-5 mr-2"></i> Analyze Terms';

        feather.replace();
    }, 1500);
}

function displayResults(analysis) 
{
    resultsSection.classList.remove('hidden');

    scoreValue.textContent = `${analysis.score}/100`;

    scoreBar.style.width = `${analysis.score}%`;

    safetyBadge.textContent = analysis.safety;

    if (analysis.score >= 80) 
    {
        safetyBadge.classList.add('bg-green-100', 'text-green-800');

        scoreBar.classList.add('bg-green-500');
    } 
    
    else if (analysis.score >= 50) 
    {
        safetyBadge.classList.add('bg-yellow-100', 'text-yellow-800');

        scoreBar.classList.add('bg-yellow-500');
    } 
    
    else 
    {
        safetyBadge.classList.add('bg-red-100', 'text-red-800');

        scoreBar.classList.add('bg-red-500');
    }
    
    redFlagsList.innerHTML = '';

    analysis.redFlags.forEach(flag => 
    {
        const severityColor = flag.severity === 'high' ? 'red' : 'yellow';

        redFlagsList.innerHTML += `

        <div class="p-4 border-l-4 border-${severityColor}-500 bg-${severityColor}-50 rounded-r">

        <h5 class="font-semibold text-${severityColor}-800">${flag.title}</h5>

        <p class="text-gray-700 mt-1">${flag.description}</p>

        </div>
        `;
    });
    
    neutralPointsList.innerHTML = '';

    analysis.neutralPoints.forEach(point => 
    {
        neutralPointsList.innerHTML += `

        <div class="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r">

        <h5 class="font-semibold text-blue-800">${point.title}</h5>

        <p class="text-gray-700 mt-1">${point.description}</p>

        </div>
        `;
    });
    
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function clearInput() 
{
    termsInput.value = '';

    resultsSection.classList.add('hidden');
}
