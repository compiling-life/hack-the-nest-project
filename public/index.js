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
    const terms = termsInput.value.trim(); // MUST match backend key
    if (!terms) {
        alert('Please paste some terms first.');
        return;
    }

    analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2 animate-spin"></i> Analyzing...';
    feather.replace();

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ terms }) // key is now 'terms'
        });

        const data = await response.json();

        if (data.error) {
            displayResults(`❌ ${data.error}`);
        } else {
            displayResults(data.output);
        }

    } catch (err) {
        console.error("Error fetching AI:", err);
        displayResults("❌ Error analyzing terms. Check console for details.");
    } finally {
        analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2"></i> Analyze Terms';
        feather.replace();
    }
}

function displayResults(text) {
    resultsSection.classList.remove('hidden');
    aiOutput.innerHTML = `<pre class="whitespace-pre-wrap text-gray-700">${text}</pre>`;
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function clearInput() {
    termsInput.value = '';
    resultsSection.classList.add('hidden');
    aiOutput.innerHTML = '';
}
