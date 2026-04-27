const express = require("express");
const twilio = require("twilio");
const admin = require("firebase-admin");
const router = express.Router();

// Initialize Firebase Admin
try {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log("✅ Firebase Admin initialized");
} catch (error) {
  console.warn("⚠️  Firebase Admin not configured. Alert syncing to Android app will be disabled.");
}

const db = admin.apps.length ? admin.database() : null;

// Initialize Twilio client if credentials are provided
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log("✅ Twilio SMS initialized");
} else {
  console.warn("⚠️  Twilio not configured. SMS alerts will be logged only.");
}

// In-memory danger confirmation state
let dangerCount = 0;
let lastDetectionTime = Date.now();
const RESET_TIMEOUT_MS = 10000;   // reset if 10s gap between signals
const CONFIRM_THRESHOLD = 2;      // require 2 consecutive danger signals

/**
 * Send SMS to emergency contacts
 * @param {string[]} contacts - Array of phone numbers
 * @param {string} sound - Detected sound
 * @param {number} confidence - Detection confidence
 * @param {string} location - User's location (address or coords)
 */
async function sendEmergencySMS(contacts, sound, confidence, location) {
  if (!contacts || contacts.length === 0) {
    console.warn("📭 No emergency contacts to notify");
    return { success: false, reason: "No contacts" };
  }

  if (!twilioClient) {
    console.log("📭 Twilio not configured. Simulating SMS delivery:");
    contacts.forEach(contact => {
      console.log(`   [SMS SIMULATED] To: ${contact}`);
      console.log(`   Emergency detected: ${sound} (${Math.round(confidence * 100)}%)`);
      console.log(`   Location: ${location || "Not available"}`);
    });
    return { success: false, reason: "Twilio not configured" };
  }

  const messageBody = `🚨 EMERGENCY ALERT\n\nSound Detected: ${sound}\nConfidence: ${Math.round(confidence * 100)}%\nLocation: ${location || "Not available"}\n\nIf this is a false alarm, please disregard.`;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  const results = [];

  for (const contact of contacts) {
    try {
      const message = await twilioClient.messages.create({
        body: messageBody,
        from: fromNumber,
        to: contact,
      });
      console.log(`📨 SMS sent to ${contact} (SID: ${message.sid})`);
      results.push({ contact, success: true, sid: message.sid });
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${contact}:`, error.message);
      results.push({ contact, success: false, error: error.message });
    }
  }

  return { success: true, results };
}

router.post("/", async (req, res) => {
  const { audioData, contacts = [], location, userName } = req.body;

  if (!audioData) {
    return res.status(400).json({ error: "audioData is required" });
  }

  const now = Date.now();

  // Reset stale danger count
  if (now - lastDetectionTime > RESET_TIMEOUT_MS) {
    dangerCount = 0;
  }
  lastDetectionTime = now;

  if (audioData.danger) {
    dangerCount++;
    console.log(`⚠️  Danger signal #${dangerCount} — sound: "${audioData.sound}" (${audioData.confidence})`);
  } else {
    dangerCount = 0;
  }

  if (dangerCount >= CONFIRM_THRESHOLD) {
    dangerCount = 0;
    console.log("🚨 CONFIRMED EMERGENCY ALERT");
    console.log("   User      :", userName || "Unknown");
    console.log("   Sound     :", audioData.sound);
    console.log("   Confidence:", Math.round(audioData.confidence * 100) + "%");
    console.log("   Location  :", location || "not provided");
    console.log("   Contacts  :", contacts.length, "emergency contact(s)");

    // Send SMS alerts
    const smsResult = await sendEmergencySMS(
      contacts,
      audioData.sound,
      audioData.confidence,
      location
    );

    // Sync to Firebase for Android App
    if (db) {
      db.ref("alerts").set({
        type: audioData.sound,
        confidence: Math.round(audioData.confidence * 100),
        active: true,
        timestamp: Date.now()
      });

      // Auto-reset alert after 10 seconds
      setTimeout(() => {
        db.ref("alerts/active").set(false);
      }, 10000);
    }

    return res.json({
      status: "ALERT_TRIGGERED",
      sound: audioData.sound,
      confidence: audioData.confidence,
      location: location || null,
      userName: userName || null,
      smsResult: smsResult,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({ status: "SAFE", dangerCount });
});

module.exports = router;
