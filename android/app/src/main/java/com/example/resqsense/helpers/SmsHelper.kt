package com.example.resqsense.helpers

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.SmsManager
import android.util.Log
import androidx.core.content.ContextCompat

object SmsHelper {
    private const val TAG = "SMS_DEBUG"
    private const val ERROR_TAG = "SMS_ERROR"

    fun sendSms(context: Context, phoneNumber: String, message: String): Boolean {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            Log.e(ERROR_TAG, "Permission SEND_SMS not granted")
            return false
        }

        return try {
            Log.d(TAG, "Sending SMS to: $phoneNumber")
            
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                context.getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }

            smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            Log.d(TAG, "SMS sent")
            true
        } catch (e: Exception) {
            Log.e(ERROR_TAG, "Failed to send SMS: ${e.message}")
            false
        }
    }
}
