# Quick Reference - SMS & Location Setup

## ⚡ Quick Start

### 1️⃣ Set Twilio Credentials
```bash
# Edit backend/.env and add:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 2️⃣ Run the App
```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate && node server.js

# Terminal 2: Frontend  
npm run dev
```

### 3️⃣ Test the Alert
1. Open http://localhost:5173
2. Enter: Name, Phone, Email
3. Add emergency contact phone numbers
4. Click "Start Monitoring"
5. Trigger a danger sound
6. 📱 SMS will be sent!

---

## 📝 Configuration Checklist

- [ ] Twilio account created at https://www.twilio.com
- [ ] Account SID copied to `.env`
- [ ] Auth Token copied to `.env`
- [ ] Phone number verified in `.env`
- [ ] Emergency contacts have `+1 555 000 0000` format
- [ ] Frontend dev server running (`npm run dev`)
- [ ] Backend server running (`node server.js`)

---

## 🧪 Test Without Twilio

SMS messages will be **logged to console** if Twilio is not configured:

```
✅ SMS will be simulated
✅ Alerts still work
✅ Location still captured
✅ Perfect for development
```

---

## 📊 SMS Message Details

**Sent to:** All emergency contacts in app  
**Trigger:** 2 consecutive danger detections (10s window)  
**Content:**
- Sound detected (e.g., Gunshot)
- Confidence percentage (e.g., 95%)
- Live location (address or coordinates)
- Timestamp

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `backend/routes/alert.js` | SMS sending logic |
| `backend/.env` | Twilio credentials |
| `src/hooks/useGeolocation.ts` | Location capture |
| `src/hooks/useAudioMonitor.ts` | Monitoring + SMS |
| `SMS_SETUP.md` | Full setup guide |
| `IMPLEMENTATION_COMPLETE.md` | Complete documentation |

---

## 🚨 Alert Process

```
1. Sound detected → Danger signal #1
2. Sound detected → Danger signal #2
3. ✅ ALERT TRIGGERED
4. Get user location
5. Send SMS to all contacts
6. Show emergency screen
```

---

## 💬 SMS Example

```
🚨 EMERGENCY ALERT

Sound Detected: Gunshot
Confidence: 95%
Location: Main Street, Downtown

If this is a false alarm, please disregard.
```

---

## ❓ Common Issues

**"SMS not sending?"**
- Check `.env` has Twilio credentials
- Check emergency contacts have valid numbers
- Check server logs for errors
- Test without Twilio first (console logging)

**"Location not available?"**
- Grant browser location permission
- Check console for geolocation errors
- App works without location

**"Build failing?"**
- Run `npm run build` to check errors
- Clear node_modules and reinstall if needed

---

## 🔗 Useful Links

- Twilio: https://www.twilio.com/console
- Twilio SMS Docs: https://www.twilio.com/docs/sms
- Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- OpenStreetMap: https://nominatim.org/

---

## 📞 Getting Twilio

1. Visit https://www.twilio.com
2. Create free account ($15 trial credit)
3. Get Account SID from Console
4. Get Auth Token from Console  
5. Get/verify phone number
6. Add to `.env`

That's it! 🎉

---

**Status:** ✅ SMS & Location Ready  
**App:** Predictive Emergency AI v1.0  
**Date:** April 25, 2026
