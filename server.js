import express from "express";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Root route (homepage)
app.get("/", (req, res) => {
  res.send("✅ Server is running. Use POST /analyze to analyze terms.");
});

// Load credentials from Render environment variable
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON env var");
}

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

// Analyze route
app.post("/analyze", async (req, res) => {
    try {
      const client = await auth.getClient();
      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following terms:\n\n${req.body.terms}`,
                },
              ],
            },
          ],
        }),
      });
  
      const data = await response.json();
      console.log("Gemini API response:", JSON.stringify(data, null, 2));
  
      if (data.candidates && data.candidates.length > 0) {
        res.json({ output: data.candidates[0].content.parts[0].text });
      } else {
        res.status(500).json({ error: "Gemini did not return candidates", details: data });
      }
    } catch (err) {
      console.error("Error in /analyze:", err);
      res.status(500).json({ error: "Exception in /analyze", details: err.message });
    }
  });  

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
