# 🛡️ Predictive Emergency AI

A real-time intelligent safety monitoring system that detects danger using **YAMNet** (Google's audio classification model) and automatically escalates emergencies.

---

## Architecture

```
Frontend (React + Vite)
    ↓ polls every 3s
Backend (Express.js :5002)
    ├── GET  /api/audio  → spawns detect_sound.py → YAMNet inference
    └── POST /api/alert  → 2-confirmation danger logic
```

---

## Prerequisites

| Tool        | Version  |
|-------------|----------|
| Node.js     | ≥ 18     |
| Python      | ≥ 3.9    |
| pip         | ≥ 23     |

---

## Setup

### 1. Install Python dependencies (backend)

```bash
cd backend
pip install -r requirements.txt
```

On Linux you may also need:
```bash
sudo apt install libportaudio2
```

> **Note:** YAMNet model weights (~25 MB compressed) are downloaded automatically on first run and cached at `~/.cache/tfhub_modules/`. No dataset download is required.

### 2. Install Node.js dependencies

```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit .env if needed (default port is 5002)
```

---

## Running

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate      # Activate Python virtual environment
npm start
# → Backend running on http://localhost:5002
```

On Windows, use:
```bash
cd backend
venv\Scripts\activate         # Windows activation
npm start
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# → Frontend running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How YAMNet Works Here

1. Every 3 seconds the frontend polls `GET /api/audio`
2. The backend spawns `detect_sound.py` which:
   - Records **2 seconds** of microphone audio at **16 kHz**
   - Runs the audio through **YAMNet** (521 AudioSet sound classes)
   - Returns `{ sound, confidence, danger, top3 }`
3. If `danger: true`, the frontend posts to `POST /api/alert`
4. The alert route requires **2 consecutive danger signals** before triggering
5. The frontend escalates through: Pre-validation → Danger → Emergency → All Clear

### Danger Keywords

The following AudioSet class patterns trigger `danger: true`:
- Human distress: scream, shout, crying, wail, shriek
- Weapons: gunshot, explosion, blast, artillery
- Breaking: glass break, shatter, crash
- Alarms: smoke detector, fire alarm, siren, klaxon
- Emergency services: police, ambulance, fire engine

---

## SMS & Emergency Alerts

When a danger is confirmed (2 consecutive signals), the system:
1. **Captures live location** — Uses browser Geolocation API to get user coordinates
2. **Reverses geocode** — Converts coordinates to readable address (e.g., "Main St, Downtown")
3. **Sends SMS alerts** — Notifies all emergency contacts via Twilio with:
   - Detected sound type
   - Detection confidence percentage
   - Live user location
   - Timestamp

### Configure SMS (Optional)

To enable SMS alerts to emergency contacts:

```bash
# 1. Sign up for Twilio: https://www.twilio.com
# 2. Get Account SID, Auth Token, and phone number

# 3. Edit backend/.env:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Note:** The app works without SMS configured — alerts will be logged to the console for testing.

See [SMS_SETUP.md](SMS_SETUP.md) for complete setup instructions.

---

## Project Structure

```
predictive-emergency-ai/
├── index.html
├── package.json          ← frontend deps
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── hooks/
│   │   └── useAudioMonitor.ts   ← polling + alert logic
│   └── components/screens/
│       ├── SplashScreen.tsx
│       ├── PermissionsScreen.tsx
│       ├── UserSetupScreen.tsx
│       ├── MonitoringScreen.tsx  ← live detection feed
│       └── AlertScreens.tsx      ← danger escalation flow
└── backend/
    ├── server.js
    ├── package.json
    ├── requirements.txt
    ├── detect_sound.py   ← YAMNet inference
    └── routes/
        ├── audio.js      ← spawns Python
        └── alert.js      ← confirmation logic
```

---

## Build for Production

```bash
npm run build        # outputs to dist/
```

Serve `dist/` with any static host and keep the backend running.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `sounddevice` error on Linux | `sudo apt install libportaudio2` |
| Python not found on Windows | Use `python` instead of `python3` (auto-detected) |
| Model slow on first run | YAMNet downloads once (~25 MB) and caches |
| Backend not connecting | Ensure port 5002 is free; check CORS in `.env` |
| No microphone detected | Grant microphone permission in the browser |
