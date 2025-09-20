import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files (optional: if you have frontend in /public)
app.use(express.static(path.join(__dirname, "public")));

// 🔑 Load Gemini API key from Render env variable
if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

// Initialize the official client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Server is running. Use POST /analyze to analyze terms.");
});

// Analyze endpoint
app.post("/analyze", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          {
            text: `Analyze the following terms:\n\n${req.body.terms}`,
          },
        ],
      },
    ]);

    const output = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (output) {
      res.json({ output });
    } else {
      res.status(500).json({ error: "No response from AI" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error analyzing terms" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
