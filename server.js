import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  const prompt = `
You are a Terms of Service and Privacy Policy analyzer.

Analyze the following text and identify clauses that may be risky or harmful to the user.

Provide an overall safety score (0-100), red flags, yellow flags, and neutral points. 
Format your response naturally in plain text. Example:

Score: 72
Red Flags:
- Data Sharing: Allows sharing personal data with third parties
- Mandatory Arbitration: Limits user's ability to sue in court
Yellow Flags:
- Limited Support: Customer support response times are slow
Neutral Points:
- Cookie Policy: Explains cookie usage clearly

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
        body: JSON.stringify({
          textFormat: "text",
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.[0]?.text || "";

    res.json({ text: aiText });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error processing Gemini API" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
