package com.example.resqsense.services

import android.Manifest
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.telephony.SmsManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.example.resqsense.data.*
import com.example.resqsense.helpers.AudioAnalyzer
import com.example.resqsense.helpers.NotificationHelper
import com.example.resqsense.helpers.SmsHelper
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.firebase.database.*
import java.text.SimpleDateFormat
import java.util.*

class EmergencyForegroundService : Service() {

    private lateinit var database: DatabaseReference
    private var alertListener: ChildEventListener? = null
    private var currentTimer: CountDownTimer? = null
    private var lastAlertId: String? = null
    private val TAG = "DEBUG" // Unified debug tag as requested
    
    private var audioAnalyzer: AudioAnalyzer? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate called")
        NotificationHelper.createNotificationChannel(this)
        startForeground(NotificationHelper.SERVICE_NOTIFICATION_ID, NotificationHelper.getServiceNotification(this))
        
        database = FirebaseDatabase.getInstance().getReference("alerts")
        setupFirebaseListener()
        setupAudioAnalysis()
        
        DetectionState.isMonitoring = true
        Log.d(TAG, "Service started and foregrounded")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand triggered")
        if (intent?.action == "ACTION_CANCEL_ALERT") {
            Log.d(TAG, "Alert Cancelled by User via Notification")
            currentTimer?.cancel()
            LogManager.addLog(this, EmergencyLog("Cancelled", 0, "", "CANCELLED"))
        }
        return START_STICKY
    }

    private fun setupFirebaseListener() {
        Log.d(TAG, "Setting up Firebase Listener")
        alertListener = object : ChildEventListener {
            override fun onChildAdded(snapshot: DataSnapshot, previousChildName: String?) {
                val alert = snapshot.getValue(Alert::class.java)
                val alertId = snapshot.key
                
                if (alert != null && alertId != lastAlertId) {
                    Log.d(TAG, "Firebase Alert Received: ${alert.sound}")
                    lastAlertId = alertId
                    startEmergencyCountdown(alert)
                }
            }
            override fun onChildChanged(snapshot: DataSnapshot, previousChildName: String?) {}
            override fun onChildRemoved(snapshot: DataSnapshot) {}
            override fun onChildMoved(snapshot: DataSnapshot, previousChildName: String?) {}
            override fun onCancelled(error: DatabaseError) {
                Log.e(TAG, "Firebase Error: ${error.message}")
            }
        }
        database.addChildEventListener(alertListener!!)
    }

    private fun setupAudioAnalysis() {
        Log.d(TAG, "Setting up Audio Analysis (YAMNet)")
        audioAnalyzer = AudioAnalyzer(
            context = this,
            onDangerDetected = { label, confidence ->
                Log.d(TAG, "YAMNet Danger Detected: $label ($confidence%)")
                val alert = Alert(
                    sound = label,
                    confidence = confidence,
                    timestamp = System.currentTimeMillis().toString()
                )
                startEmergencyCountdown(alert)
            },
            onResultsUpdate = { label, confidence ->
                DetectionState.updateLabel(label, confidence)
            }
        )
        audioAnalyzer?.startListening()
        DetectionState.isListening = true
    }

    private fun startEmergencyCountdown(alert: Alert) {
        Log.d(TAG, "Emergency Countdown Triggered: 5 seconds")
        currentTimer?.cancel()
        
        currentTimer = object : CountDownTimer(5000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val secondsRemaining = (millisUntilFinished / 1000).toInt() + 1
                Log.d(TAG, "Countdown: $secondsRemaining seconds")
                updateAlertNotification(alert, secondsRemaining)
            }

            override fun onFinish() {
                Log.d(TAG, "Countdown Finished. Executing Emergency Actions.")
                executeEmergencyActions(alert)
                updateAlertNotification(alert, 0)
            }
        }.start()
    }

    private fun updateAlertNotification(alert: Alert, seconds: Int, isCancelled: Boolean = false) {
        val notification = NotificationHelper.getAlertNotification(
            this, alert.sound, alert.confidence, seconds, isCancelled
        )
        try {
            NotificationManagerCompat.from(this).notify(NotificationHelper.ALERT_NOTIFICATION_ID, notification)
        } catch (e: SecurityException) {
            Log.e(TAG, "Notification permission missing for alert")
        }
    }

    private fun executeEmergencyActions(alert: Alert) {
        Log.d(TAG, "executeEmergencyActions: Requesting High Accuracy Live Location...")
        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        val cancellationTokenSource = CancellationTokenSource()

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cancellationTokenSource.token)
                .addOnSuccessListener { location ->
                    if (location != null) {
                        Log.d(TAG, "Live Location Obtained: ${location.latitude}, ${location.longitude}")
                        performActions(alert, location.latitude, location.longitude)
                    } else {
                        Log.w(TAG, "Live location is null, trying last known location as fallback")
                        fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc ->
                            performActions(alert, lastLoc?.latitude ?: 0.0, lastLoc?.longitude ?: 0.0)
                        }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Failed to get live location: ${e.message}")
                    performActions(alert, 0.0, 0.0)
                }
        } else {
            Log.d(TAG, "Location permission not granted. Sending alert without location.")
            performActions(alert, 0.0, 0.0)
        }
    }

    private fun performActions(alert: Alert, lat: Double, lng: Double) {
        val contacts = ContactManager.getContacts(this)
        Log.d(TAG, "Found ${contacts.size} contacts to alert.")
        
        val mapsUrl = if (lat != 0.0 || lng != 0.0) "https://maps.google.com/?q=$lat,$lng" else "Location Unavailable"
        val message = """
            🚨 EMERGENCY ALERT!
            Danger detected: ${alert.sound}
            Confidence: ${alert.confidence}%
            Location: $mapsUrl
        """.trimIndent()

        Log.d(TAG, "Final SMS Message Body:\n$message")

        // Send SMS
        contacts.forEach { contact ->
            SmsHelper.sendSms(this, contact.phone, message)
        }

        // Make Call
        if (contacts.isNotEmpty()) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "Calling First Contact: ${contacts[0].phone}")
                val callIntent = Intent(Intent.ACTION_CALL).apply {
                    data = Uri.parse("tel:${contacts[0].phone}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(callIntent)
            } else {
                Log.e(TAG, "CALL_PHONE permission NOT granted. Call skipped.")
            }
        }

        // Log locally
        val timestamp = SimpleDateFormat("HH:mm:ss dd/MM", Locale.getDefault()).format(Date())
        LogManager.addLog(this, EmergencyLog(alert.sound, alert.confidence, timestamp, "EXECUTED"))
    }

    override fun onDestroy() {
        Log.d(TAG, "Service onDestroy called")
        alertListener?.let { database.removeEventListener(it) }
        currentTimer?.cancel()
        audioAnalyzer?.stopListening()
        DetectionState.isListening = false
        DetectionState.isMonitoring = false
        Log.d(TAG, "Service stopped")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
