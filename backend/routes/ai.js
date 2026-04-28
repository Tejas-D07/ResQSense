const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

let model = null;
if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("✅ Gemini AI initialized");
} else {
  console.warn("⚠️ Gemini API key not configured. AI analysis endpoint will return SAFE by default.");
}

router.post("/analyze-message", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Simple keyword pre-check for speed (though instructed to do on Android, good to have here too)
  const keywords = ["help", "danger", "emergency"];
  const lowerMsg = message.toLowerCase();
  if (keywords.some(k => lowerMsg.includes(k))) {
    return res.json({ result: "EMERGENCY" });
  }

  if (!model) {
    return res.status(503).json({ error: "Gemini API key not configured", result: "SAFE" });
  }

  try {
    const prompt = `Classify if the following message indicates a real emergency or danger.
Respond ONLY with 'EMERGENCY' or 'SAFE'.

Message: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim().toUpperCase();

    // Sanitize response
    if (text.includes("EMERGENCY")) text = "EMERGENCY";
    else if (text.includes("SAFE")) text = "SAFE";
    else text = "SAFE"; // Fallback

    console.log(`AI Analysis for "${message}": ${text}`);
    res.json({ result: text });
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    // On error, we fallback to SAFE or check simple heuristics
    res.status(500).json({ error: "Analysis failed", result: "SAFE" });
  }
});

module.exports = router;
