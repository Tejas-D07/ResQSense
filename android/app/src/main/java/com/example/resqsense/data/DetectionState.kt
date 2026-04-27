package com.example.resqsense.data

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

object DetectionState {
    var currentLabel by mutableStateOf("Ambient Noise")
    var currentConfidence by mutableStateOf(0)
    var isListening by mutableStateOf(false)
    var isMonitoring by mutableStateOf(false)

    fun updateLabel(label: String, confidence: Int) {
        Log.d("DEBUG", "Detection Update: $label ($confidence%)")
        currentLabel = label
        currentConfidence = confidence
    }
}
