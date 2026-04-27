const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/analyze-message", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Simple keyword pre-check for speed (though instructed to do on Android, good to have here too)
  const keywords = ["help", "danger", "emergency"];
  const lowerMsg = message.toLowerCase();
  if (keywords.some(k => lowerMsg.includes(keywords))) {
      // If found in backend too, return immediately
      // return res.json({ result: "EMERGENCY" });
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
