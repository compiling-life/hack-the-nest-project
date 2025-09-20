AOS.init();
feather.replace();

const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const termsInput = document.getElementById('terms-input');
const resultsSection = document.getElementById('results-section');
const resultsBox = document.getElementById('results-box');

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

    const aiText = await response.text();
    displayResults(aiText);

  } catch (err) {
    console.error(err);
    alert("Error analyzing terms. Check console for details.");
  } finally {
    analyzeBtn.innerHTML = '<i class="w-5 h-5 mr-2"></i> Analyze Terms';
    feather.replace();
  }
}

function displayResults(aiText) {
  resultsSection.classList.remove('hidden');

  resultsBox.innerHTML = `<pre class="whitespace-pre-wrap text-gray-700">${aiText}</pre>`;

  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function clearInput() {
  termsInput.value = '';
  resultsSection.classList.add('hidden');
}
