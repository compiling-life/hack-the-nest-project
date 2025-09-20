import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleAuth } from "google-auth-library";

const app = express();
app.use(express.json());

// Serve static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Set up Google Auth with your service account
const auth = new GoogleAuth({
  keyFile: path.join(__dirname, "service_account.json"),
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send("No text provided");
  }

  const prompt = `
You are a Terms of Service and Privacy Policy analyzer.
Analyze the following text and explain potential risks, concerns, or noteworthy points for a user.
You may also give a rough safety score (0-100) if possible, but respond naturally in plain text.

Text:
${text}
`;

  try {
    // Get access token from service account
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error("Failed to get access token from service account");
    }

    // Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          textFormat: "text",
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("Raw AI response:", JSON.stringify(data, null, 2));

    const aiText = data.candidates?.[0]?.content?.[0]?.text || "";
    res.send(aiText);

  } catch (err) {
    console.error("Error calling AI:", err);
    res.status(500).send("Error analyzing terms");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
