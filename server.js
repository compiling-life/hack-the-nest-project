import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// Serve static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  const prompt = `
You are a Terms of Service and Privacy Policy analyzer.

Analyze the following text and explain potential risks, concerns, or noteworthy points for a user.

At the **end of your response**, provide a single numeric safety score from 0 (very unsafe) to 100 (completely safe) in the format:

"Overall score: <number>"

Text:
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
    const aiText = data.candidates[0]?.content[0]?.text || "No response from AI.";
    res.send(aiText);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error calling AI");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
