import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// Serve static frontend files from 'public' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  const prompt = `
You are a Terms of Service and Privacy Policy analyzer.

Analyze the following text and identify clauses that may be risky or harmful to the user.

Classify each clause as one of:
- Red Flag: High risk or very user-unfriendly
- Yellow Flag: Medium risk or somewhat concerning
- Neutral Point: Not risky but informative

Also, give an overall safety score from 0 (very unsafe) to 100 (completely safe).

**Respond ONLY in JSON with this exact format**:

{
  "score": number,
  "redFlags": [{"title": string, "description": string}],
  "yellowFlags": [{"title": string, "description": string}],
  "neutralPoints": [{"title": string, "description": string}]
}

Terms:
${text}
`;

  try {
    // Call Aimlapi
    const response = await fetch("https://api.aimlapi.com/v1/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AIMLAPI_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    let jsonText = data.response || data.text || "";

    // Remove backticks or extra formatting
    jsonText = jsonText.trim().replace(/^```json/, "").replace(/```$/, "");

    let analysis;
    try {
      analysis = JSON.parse(jsonText);

      // Ensure fields exist
      analysis.score = analysis.score ?? 50;
      analysis.redFlags = analysis.redFlags ?? [];
      analysis.yellowFlags = analysis.yellowFlags ?? [];
      analysis.neutralPoints = analysis.neutralPoints ?? [];

    } catch (err) {
      console.error("JSON parsing error:", err, "\nOriginal text:", jsonText);
      analysis = {
        score: 50,
        redFlags: [],
        yellowFlags: [],
        neutralPoints: [],
      };
    }

    res.json(analysis);

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error processing AI API" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
