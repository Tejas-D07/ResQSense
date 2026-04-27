package com.example.resqsense.data.prefs

import android.content.Context

object SettingsManager {
    private const val PREFS_NAME = "ResQSenseSettings"
    private const val KEY_AUTO_DETECTION = "auto_detection"
    private const val KEY_SMS_ENABLED = "sms_enabled"
    private const val KEY_CALL_ENABLED = "call_enabled"
    private const val KEY_IS_LOGGED_IN = "is_logged_in"

    fun isAutoDetectionEnabled(context: Context): Boolean =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getBoolean(KEY_AUTO_DETECTION, true)

    fun setAutoDetectionEnabled(context: Context, enabled: Boolean) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putBoolean(KEY_AUTO_DETECTION, enabled).apply()

    fun isSmsEnabled(context: Context): Boolean =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getBoolean(KEY_SMS_ENABLED, true)

    fun setSmsEnabled(context: Context, enabled: Boolean) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putBoolean(KEY_SMS_ENABLED, enabled).apply()

    fun isCallEnabled(context: Context): Boolean =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getBoolean(KEY_CALL_ENABLED, true)

    fun setCallEnabled(context: Context, enabled: Boolean) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putBoolean(KEY_CALL_ENABLED, enabled).apply()

    fun isLoggedIn(context: Context): Boolean =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getBoolean(KEY_IS_LOGGED_IN, false)

    fun setLoggedIn(context: Context, loggedIn: Boolean) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putBoolean(KEY_IS_LOGGED_IN, loggedIn).apply()
}
