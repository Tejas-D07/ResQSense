const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
  const scriptPath = path.join(__dirname, "../detect_sound.py");

  // Use python3 on Linux/Mac, python on Windows
  const pythonBin = process.platform === "win32" ? "python" : "python3";
  const python = spawn(pythonBin, [scriptPath]);

  let data = "";
  let errorData = "";

  python.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  python.stderr.on("data", (err) => {
    errorData += err.toString();
    console.error("Python stderr:", err.toString());
  });

  python.on("close", (code) => {
    const trimmed = data.trim();

    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);

        if (code !== 0) {
          console.error("Python detector error:", code, parsed, errorData);
          return res.status(500).json({
            error: parsed.error || "Detection failed",
            details: parsed.error || errorData || trimmed,
            sound: parsed.sound || "unknown",
            confidence: parsed.confidence ?? 0,
            danger: parsed.danger ?? false,
          });
        }

        return res.json(parsed);
      } catch (e) {
        console.error("JSON parse error:", e, "Raw output:", data);
        if (code !== 0) {
          return res.status(500).json({
            error: "Detection failed",
            details: errorData || trimmed,
            sound: "unknown",
            confidence: 0,
            danger: false,
          });
        }
      }
    }

    if (code !== 0) {
      console.error("Python exited with code:", code, errorData);
      return res.status(500).json({
        error: "Detection failed",
        details: errorData || "No detector output",
        sound: "unknown",
        confidence: 0,
        danger: false,
      });
    }

    res.status(500).json({ error: "Invalid response from detector" });
  });

  python.on("error", (err) => {
    console.error("Failed to start Python:", err);
    res.status(500).json({
      error: `Could not start Python: ${err.message}`,
      hint: "Make sure python3 is installed and detect_sound.py dependencies are installed.",
    });
  });
});

module.exports = router;
