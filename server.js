import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyCmRSRYBlLQZOtui1RfN784sZF4Cb1EpaE";

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  const prompt = `
Analyze the following Terms of Service and Privacy Policy.
Identify clauses that may be risky or harmful.
Classify as Red Flags, Yellow Flags, Neutral Points.
Give a score 0-100.
Return JSON like:
{
  "score": number,
  "redFlags": [{"title": string, "description": string}],
  "neutralPoints": [{"title": string, "description": string}]
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
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    // Return the raw text to the frontend
    res.json({ text: data.candidates[0].content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error calling Gemini");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
