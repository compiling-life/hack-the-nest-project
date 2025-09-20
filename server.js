import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({});

app.get("/", (req, res) => {
  res.send("Server is running. POST /analyze to analyze terms.");
});

app.post("/analyze", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following terms:\n\n${req.body.terms}`,
    });

    res.json({ output: response.text });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error analyzing terms" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
