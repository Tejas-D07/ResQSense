🛡️ ResQSense – AI-Powered Predictive Emergency Response System

ResQSense, developed by NexQuad, is an intelligent real-time safety platform designed to proactively detect danger, monitor emergencies, and automatically escalate crisis response using AI-powered sound detection, SOS activation, live location sharing, and emergency communication systems.

⸻

🌐 Live Prototype

https://resqsense-nexquad.netlify.app/

⸻

🎥 Demo Video

https://drive.google.com/file/d/1v1GeF-EeG_tmNAbicDDR7pOGa3KwFduB/view?usp=sharing

⸻

💡 Problem Statement

Traditional emergency response systems are often reactive, delayed, and dependent on manual intervention, resulting in slower crisis management during dangerous situations. Individuals facing emergencies such as assaults, accidents, fires, or distress situations may not always be able to manually call for help.

ResQSense solves this problem by using predictive AI, real-time sound analysis, emergency trigger systems, and automated communication protocols to significantly reduce emergency response time and improve public safety.

⸻

🚀 Key Features

* 🎤 Real-time danger sound detection using Google YAMNet
* 🚨 AI-based crisis recognition (screams, gunshots, explosions, alarms)
* 📍 Automatic live location sharing
* 📱 SOS emergency activation button
* 🗣️ Voice/text emergency trigger support
* 📨 Automated SMS alerts to emergency contacts
* 🚓 Future-ready escalation to police, ambulance, and fire services
* 📊 Multi-stage emergency escalation flow
* 🌍 Android + Web prototype support
* 🎨 Modern responsive UI/UX

⸻

🏗️ System Architecture

Frontend (React + Vite)
    ↓ polls every 3s
Backend (Express.js :5002)
    ├── GET  /api/audio  → detect_sound.py → YAMNet inference
    └── POST /api/alert  → emergency confirmation logic

⸻

🧠 How It Works

Step-by-Step Flow:

1. Frontend continuously monitors environment
2. Backend captures microphone audio
3. YAMNet classifies audio into danger/non-danger classes
4. If danger is detected:
    * Validates repeated signals
    * Activates alert workflow
    * Captures geolocation
    * Sends SMS alerts
    * Escalates emergency response
5. User receives emergency guidance and protection workflow

⸻

🎯 Danger Categories Detected

* Human distress (screams, crying, shouting)
* Gunshots / explosions
* Fire alarms / sirens
* Glass breaking
* Vehicle crashes
* Police / ambulance sirens
* Emergency environmental sounds

⸻

📲 SMS & Emergency Alert System

Upon confirmed danger:

* Live location captured
* Reverse geocoding enabled
* Emergency contacts notified
* Alert includes:
    * Danger type
    * Confidence score
    * Location
    * Timestamp

⸻

🛠️ Technology Stack

Layer	Technologies
Frontend	React, Vite, TypeScript
Backend	Node.js, Express.js
AI/ML	TensorFlow, YAMNet
Mobile	Android, Kotlin
Cloud	Firebase
SMS	Twilio API
Deployment	Netlify
Database	Firebase Realtime DB

⸻

📂 Project Structure

ResQSense/
├── android/
├── backend/
│   ├── detect_sound.py
│   ├── server.js
│   └── routes/
├── src/
│   ├── components/
│   ├── hooks/
│   └── App.tsx
├── README.md
├── SMS_SETUP.md
├── QUICK_START.md
└── IMPLEMENTATION_COMPLETE.md

⸻

⚙️ Installation & Setup

Backend:

cd backend
pip install -r requirements.txt
npm install
npm start

Frontend:

npm install
npm run dev

⸻

🔒 Permissions Required

* Microphone access
* Location access
* SMS permissions (Android)
* Emergency contact configuration

⸻

🌍 Deployment

Web Prototype:

Hosted on Netlify:

https://resqsense-nexquad.netlify.app/

Android:

Full mobile implementation available in repository.

⸻

🧩 Unique Selling Proposition (USP)

ResQSense stands out because it:

* Uses predictive AI instead of reactive-only systems
* Provides real-time autonomous crisis detection
* Combines audio intelligence + live location + emergency communication
* Supports both web and Android ecosystems
* Offers scalable public safety deployment potential

⸻

🔮 Future Scope

* 🚓 Direct law enforcement integration
* 🚑 Ambulance/fire department auto-dispatch
* 📶 Offline AI inference
* ⌚ Wearable emergency devices
* ☁️ Cloud-scale analytics dashboard
* 🌐 Smart city emergency integration
* 🧠 Advanced behavioral threat prediction

⸻

🏆 Why ResQSense Matters

ResQSense transforms emergency response from passive reporting into proactive protection by leveraging AI to detect danger before it escalates, empowering faster interventions and potentially saving lives.

⸻

👨‍💻 Team

NexQuad

* AI Safety Innovation
* Emergency Technology Solutions
* Predictive Crisis Response Systems

⸻

📜 License

Prototype / Academic Innovation Project

⸻

⭐ Final Note

ResQSense represents the future of AI-driven public safety, combining machine learning, emergency automation, and modern user-centric design to create a smarter and safer world.
