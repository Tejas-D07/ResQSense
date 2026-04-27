package com.example.resqsense.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

object ContactManager {
    private const val PREFS_NAME = "ResQSenseContacts"
    private const val KEY_CONTACTS = "contacts"

    fun getContacts(context: Context): List<Contact> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = prefs.getString(KEY_CONTACTS, null) ?: return emptyList()
        val type = object : TypeToken<List<Contact>>() {}.type
        return Gson().fromJson(json, type)
    }

    fun saveContacts(context: Context, contacts: List<Contact>) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = Gson().toJson(contacts)
        prefs.edit().putString(KEY_CONTACTS, json).apply()
    }
}
