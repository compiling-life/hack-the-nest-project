import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Load service account JSON
const serviceAccountPath = path.join(__dirname, "termsguard.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Google Auth setup
const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"]
});

async function getAccessToken() {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  const prompt = `
You are a Terms of Service and Privacy Policy analyzer.

Analyze the following text and explain potential risks, concerns, or noteworthy points for a user.

Text:
${text}
`;

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          textFormat: "text",
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    console.log("AI raw response:", data);

    const aiText = data.candidates?.[0]?.content?.[0]?.text || "No response from AI";
    res.send(aiText);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error analyzing terms");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
