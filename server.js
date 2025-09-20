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

// Analyze endpoint
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

**IMPORTANT:** Respond ONLY in valid JSON in EXACTLY this format:

{
  "score": number,
  "redFlags": [{"title": string, "description": string}],
  "neutralPoints": [{"title": string, "description": string}]
}

Do not include explanations, markdown, or extra text outside the JSON.

Example output:
{
  "score": 72,
  "redFlags": [
    {"title": "Data Sharing", "description": "Allows sharing personal data with third parties"},
    {"title": "Mandatory Arbitration", "description": "Limits user's ability to sue in court"}
  ],
  "neutralPoints": [
    {"title": "Cookie Policy", "description": "Explains cookie usage clearly"}
  ]
}

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
                    "X-goog-api-key": process.env.GEMINI_API_KEY,
                },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
        );

        const data = await response.json();

        let jsonText = data.candidates[0].content[0].text;

        // Remove extra formatting/backticks
        jsonText = jsonText.trim().replace(/^```json/, "").replace(/```$/, "");

        let analysis;
        try {
            analysis = JSON.parse(jsonText);

            // Ensure required fields exist
            analysis.score = analysis.score ?? 50;
            analysis.redFlags = analysis.redFlags ?? [];
            analysis.neutralPoints = analysis.neutralPoints ?? [];

        } catch (err) {
            console.error("JSON parsing error:", err, "\nOriginal text:", jsonText);
            // fallback if parsing fails
            analysis = {
                score: 50,
                redFlags: [
                    { title: "Parsing Error", description: "Gemini did not return valid JSON." }
                ],
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
