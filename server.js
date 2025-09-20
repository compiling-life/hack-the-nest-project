import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
// lol
const app = express();
app.use(express.json());

// Serve static frontend files from 'public' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Analyze endpoint
app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  const prompt = `
Analyze the following Terms of Service and Privacy Policy.
Identify clauses that may be risky or harmful.
Classify them as Red Flags, Yellow Flags, Neutral Points.
Give an overall safety score from 0 to 100.
Return ONLY valid JSON in this exact format:
{
  "score": number,
  "redFlags": [{"title": string, "description": string}],
  "neutralPoints": [{"title": string, "description": string}]
}
Do NOT include any explanation, extra text, or markdown. Respond ONLY with JSON.

Terms:
${text}
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY, // Use environment variable
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();

    let analysis;
    let jsonText = data.candidates[0].content[0].text;

    // Clean backticks or extra whitespace
    jsonText = jsonText.trim().replace(/^```json/, "").replace(/```$/, "");

    try {
      analysis = JSON.parse(jsonText);
    } catch (err) {
      console.error("JSON parsing error:", err, "\nOriginal text:", jsonText);
      analysis = {
        score: 50,
        redFlags: [{ title: "Parsing Error", description: jsonText }],
        neutralPoints: []
      };
    }

    res.json(analysis);

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error processing Gemini API" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
