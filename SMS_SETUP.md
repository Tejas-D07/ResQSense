# Emergency Alert SMS Setup Guide

## Overview
The Silent Guardian now sends SMS alerts and user location to emergency contacts when an emergency is detected. This guide explains how to configure Twilio for SMS functionality.

## Setup Instructions

### 1. Get Twilio Credentials

1. Visit [https://www.twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Go to the [Twilio Console](https://www.twilio.com/console)
4. Copy your **Account SID** and **Auth Token**
5. Get or create a verified/rented phone number (Twilio provides a trial number for testing)

### 2. Configure Environment Variables

Edit `/backend/.env` and fill in your Twilio credentials:

```env
PORT=5002
FRONTEND_URL=http://localhost:5173

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
EMERGENCY_CONTACT_NUMBER=+1234567890
```

**Important:** Never commit `.env` to version control. It's already in `.gitignore`.

### 3. How It Works

#### When Emergency is Detected:
1. User sets up emergency contacts in the app (with valid phone numbers)
2. Monitoring is started
3. When dangerous sound is detected twice (to avoid false positives):
   - App requests user's geolocation
   - Location is converted to readable address (using OpenStreetMap)
   - SMS is sent to all emergency contacts with:
     - Detected sound type
     - Detection confidence percentage
     - User's current location

#### SMS Message Format:
```
🚨 EMERGENCY ALERT

Sound Detected: Gunshot
Confidence: 95%
Location: Main St, Downtown

If this is a false alarm, please disregard.
```

### 4. Testing SMS

#### Without Twilio Configuration (Development Mode):
If Twilio is not configured, the app will:
- Log simulated SMS messages to the server console
- Still trigger alerts
- Send location data to frontend

This is perfect for testing the app logic without SMS costs.

#### With Twilio Configuration:
Real SMS messages will be sent to emergency contacts.

**Free Tier Limits:**
- Twilio free account includes $15 trial credit
- SMS is approximately $0.0075 per message
- Each alert sends SMS to all emergency contacts

### 5. Emergency Contact Format

Users must enter emergency contact phone numbers in the setup screen:
- Format: `+1 555 000 0000` (international format preferred)
- Minimum 1 contact required
- Maximum 10 contacts recommended

### 6. Location Privacy

- Geolocation is only requested **when danger is detected**
- Location data is sent to emergency contacts and your backend only
- Uses OpenStreetMap for address conversion (no Google API key needed)
- Users must grant browser location permission

### 7. Backend Features

**Alert Endpoint: `POST /api/alert`**

Receives:
- `audioData`: Sound detection results from YAMNet
- `contacts`: Array of emergency contact phone numbers
- `location`: User's address/coordinates
- `userName`: User's name for logging

Returns:
- `status`: "ALERT_TRIGGERED" or "SAFE"
- `smsResult`: Details of SMS delivery attempts
- `timestamp`: When alert was triggered

### 8. Troubleshooting

**"SMS not being sent?"**
1. Check Twilio credentials in `.env` are correct
2. Verify emergency contacts have valid phone numbers
3. Check backend console logs for errors
4. Verify Twilio account has sufficient balance/credits

**"Location not available?"**
1. Allow location permission in browser
2. Check browser console for geolocation errors
3. App continues to work without location (shows "Location unavailable")

**"False positives?"**
- App requires 2 consecutive danger detections (10-second window)
- This reduces false alert SMS messages

## Architecture

```
Frontend (React)
  ├── Collects user info and emergency contacts
  ├── Starts monitoring (polls every 3s)
  ├── Requests geolocation on danger detection
  └── Sends alert with location to backend

Backend (Node.js + Express)
  ├── /api/audio → Runs YAMNet sound detection
  ├── /api/alert → Confirms 2nd danger signal
  │   ├── Gets location from frontend
  │   └── Sends SMS via Twilio
  └── Logs all alerts to console

Sound Detection (Python)
  └── detect_sound.py → YAMNet model
      └── Returns sound type + confidence
```

## Production Deployment

For production:
1. Use environment variable management (e.g., `.env` files, secrets manager)
2. Store Twilio credentials securely (not in code)
3. Set up uptime monitoring for the alert endpoint
4. Consider rate limiting to prevent SMS spam
5. Add database logging for audit trail

## Support

For Twilio issues:
- [Twilio Docs](https://www.twilio.com/docs)
- [Twilio Support](https://www.twilio.com/help/support)

For app issues:
- Check backend console logs
- Check browser developer console (F12)
- Verify all services are running (backend + frontend)
