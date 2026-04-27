package com.example.resqsense.helpers

import android.content.Context
import android.media.AudioRecord
import android.util.Log
import org.tensorflow.lite.task.audio.classifier.AudioClassifier
import java.util.*
import kotlin.concurrent.fixedRateTimer

class AudioAnalyzer(
    private val context: Context,
    private val onDangerDetected: (String, Int) -> Unit,
    private val onResultsUpdate: (String, Int) -> Unit
) {
    private var classifier: AudioClassifier? = null
    private var audioRecord: AudioRecord? = null
    private var timer: Timer? = null

    // Tracking for continuous detection
    private var continuousDangerCount = 0
    private val REQUIRED_STREAK = 2 // 2 consecutive seconds

    private val dangerSounds = listOf(
        "Scream", "Screaming", "Gunshot, gunfire", "Explosion", "Siren"
    )

    init {
        try {
            val modelHelper = ModelHelper(context)
            classifier = modelHelper.getClassifier()
            if (classifier != null) {
                audioRecord = classifier?.createAudioRecord()
                Log.d("DEBUG", "AudioAnalyzer: Initialization successful")
            } else {
                Log.e("DEBUG", "AudioAnalyzer: Classifier could not be initialized")
            }
        } catch (e: Exception) {
            Log.e("DEBUG", "AudioAnalyzer: Initialization failed: ${e.message}")
        }
    }

    fun startListening() {
        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            Log.e("DEBUG", "AudioAnalyzer: AudioRecord not initialized")
            return
        }

        try {
            audioRecord?.startRecording()
            Log.d("DEBUG", "AudioAnalyzer: AudioRecord started")
            
            val tensorAudio = classifier?.createInputTensorAudio()
            
            timer = fixedRateTimer("AudioAnalyzerTimer", false, 0L, 1000L) {
                try {
                    tensorAudio?.load(audioRecord)
                    val results = classifier?.classify(tensorAudio)
                    
                    results?.let { classifications ->
                        if (classifications.isNotEmpty()) {
                            val topCategory = classifications[0].categories.firstOrNull()
                            topCategory?.let { category ->
                                onResultsUpdate(category.label, (category.score * 100).toInt())
                                
                                val isDanger = dangerSounds.any { it.equals(category.label, ignoreCase = true) } && category.score > 0.75f
                                
                                if (isDanger) {
                                    continuousDangerCount++
                                    Log.d("DEBUG", "AudioAnalyzer: Danger streak: $continuousDangerCount/2 (${category.label})")
                                } else {
                                    continuousDangerCount = 0
                                }

                                if (continuousDangerCount >= REQUIRED_STREAK) {
                                    Log.d("DEBUG", "AudioAnalyzer: CONTINUOUS DANGER DETECTED (2s streak)")
                                    onDangerDetected(category.label, (category.score * 100).toInt())
                                    continuousDangerCount = 0 // Reset after trigger
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.e("DEBUG", "AudioAnalyzer: Inference error: ${e.message}")
                }
            }
        } catch (e: SecurityException) {
            Log.e("DEBUG", "AudioAnalyzer: Record Audio permission missing")
        } catch (e: Exception) {
            Log.e("DEBUG", "AudioAnalyzer: Error starting listening: ${e.message}")
        }
    }

    fun stopListening() {
        try {
            timer?.cancel()
            audioRecord?.stop()
            continuousDangerCount = 0
            Log.d("DEBUG", "AudioAnalyzer: Stopped listening")
        } catch (e: Exception) {
            Log.e("DEBUG", "AudioAnalyzer: Error stopping: ${e.message}")
        }
    }
}
