import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Initialize Google GenAI client
const ai = new GoogleGenAI({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
});

// Analyze terms route
app.post("/analyze", async (req, res) => {
  try {
    const termsText = req.body.terms;
    if (!termsText) {
      return res.status(400).json({ error: "Missing 'terms' in request body" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following terms of service or privacy policy:\n\n${termsText}`,
    });

    res.json({ output: response.text });
  } catch (err) {
    console.error("Error analyzing terms:", err);
    res.status(500).json({ error: "Error analyzing terms", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
