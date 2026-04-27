package com.example.resqsense.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

object LogManager {
    private const val PREFS_NAME = "ResQSenseLogs"
    private const val KEY_LOGS = "logs"
    private const val MAX_LOGS = 30

    fun getLogs(context: Context): List<EmergencyLog> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = prefs.getString(KEY_LOGS, null) ?: return emptyList()
        val type = object : TypeToken<List<EmergencyLog>>() {}.type
        return Gson().fromJson(json, type)
    }

    fun addLog(context: Context, log: EmergencyLog) {
        val currentLogs = getLogs(context).toMutableList()
        currentLogs.add(0, log) // Add to start for reverse chronological
        
        val limitedLogs = if (currentLogs.size > MAX_LOGS) {
            currentLogs.take(MAX_LOGS)
        } else {
            currentLogs
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = Gson().toJson(limitedLogs)
        prefs.edit().putString(KEY_LOGS, json).apply()
    }

    fun clearLogs(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(KEY_LOGS).apply()
    }
}
