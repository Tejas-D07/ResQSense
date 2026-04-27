package com.example.resqsense.helpers

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.resqsense.MainActivity
import com.example.resqsense.services.EmergencyForegroundService

object NotificationHelper {
    const val CHANNEL_ID = "ResQSenseEmergencyChannel"
    const val SERVICE_NOTIFICATION_ID = 101
    const val ALERT_NOTIFICATION_ID = 102

    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Emergency Alerts"
            val descriptionText = "Notifications for predictive emergency AI"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableVibration(true)
            }
            val notificationManager: NotificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun getServiceNotification(context: Context): Notification {
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)

        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("ResQSense Active")
            .setContentText("Monitoring for emergency sounds...")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }

    fun getAlertNotification(
        context: Context,
        sound: String,
        confidence: Int,
        countdown: Int,
        isCancelled: Boolean = false
    ): Notification {
        val cancelIntent = Intent(context, EmergencyForegroundService::class.java).apply {
            action = "ACTION_CANCEL_ALERT"
        }
        val cancelPendingIntent = PendingIntent.getService(
            context, 1, cancelIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("🚨 EMERGENCY DETECTED!")
            .setContentText("Sound: $sound ($confidence%) - Action in $countdown...")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)

        if (!isCancelled && countdown > 0) {
            builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, "CANCEL", cancelPendingIntent)
        } else if (isCancelled) {
            builder.setContentText("Alert Cancelled.")
            builder.clearActions()
        }

        return builder.build()
    }
}
