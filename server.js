import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";

const app = express();
app.use(express.json());

// Serve static frontend files from 'public' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Path to your service account JSON
const SERVICE_ACCOUNT_FILE = path.join(__dirname, "termsguard.json"); // change filename if needed
const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];
// d
const auth = new GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});

app.post("/analyze", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send("No text provided.");

  try {
    // Get an access token using the service account
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const prompt = `
You are a Terms of Service and Privacy Policy analyzer.

Analyze the following text and explain potential risks, concerns, or noteworthy points for a user.

You may also give a rough safety score (0-100) if possible, but respond naturally in plain text.

Text:
${text}
`;

    // Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken.token || accessToken}`,
        },
        body: JSON.stringify({
          textFormat: "text",
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("AI raw response:", data);

    const aiText = data.candidates?.[0]?.content?.[0]?.text || "No response from AI";
    res.send(aiText);

  } catch (err) {
    console.error("Error calling Gemini API:", err);
    res.status(500).send("Error analyzing terms.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
