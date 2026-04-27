package com.example.resqsense.data

data class Contact(val name: String, val phone: String)

data class Alert(
    val sound: String = "",
    val confidence: Int = 0,
    val timestamp: String = "",
    val lat: Double = 0.0,
    val lng: Double = 0.0
)

data class EmergencyLog(
    val sound: String,
    val confidence: Int,
    val timestamp: String,
    val status: String
)
