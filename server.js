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
            "X-goog-api-key": process.env.GEMINI_API_KEY, // Use environment variable
          },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
  
      const data = await response.json();
  
      let analysis;
      try {
        analysis = JSON.parse(data.candidates[0].content[0].text);
      } catch {
        analysis = {
          score: 50,
          redFlags: [{ title: "Parsing Error", description: data.candidates[0].content[0].text }],
          neutralPoints: []
        };
      }
  
      res.json(analysis);
  
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Server error processing Gemini output" });
    }
  });  

app.listen(3000, () => console.log("Server running on port 3000"));
