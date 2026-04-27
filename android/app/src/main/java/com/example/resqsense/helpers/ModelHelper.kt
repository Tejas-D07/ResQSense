package com.example.resqsense.helpers

import android.content.Context
import android.util.Log
import org.tensorflow.lite.task.audio.classifier.AudioClassifier
import org.tensorflow.lite.task.core.BaseOptions

class ModelHelper(private val context: Context) {

    private var classifier: AudioClassifier? = null
    private var labels: List<String> = emptyList()

    init {
        loadModel()
        loadLabels()
    }

    private fun loadModel() {
        try {
            val options = AudioClassifier.AudioClassifierOptions.builder()
                .setBaseOptions(BaseOptions.builder().useNnapi().build())
                .setMaxResults(5)
                .setScoreThreshold(0.3f)
                .build()
            
            classifier = AudioClassifier.createFromFileAndOptions(context, "yamnet.tflite", options)
            Log.d("ModelHelper", "YAMNet model loaded successfully")
        } catch (e: Exception) {
            Log.e("ModelHelper", "Failed to load model: ${e.message}")
        }
    }

    private fun loadLabels() {
        try {
            labels = context.assets.open("labels.txt").bufferedReader().readLines()
            Log.d("ModelHelper", "Labels loaded: ${labels.size}")
        } catch (e: Exception) {
            Log.e("ModelHelper", "Failed to load labels: ${e.message}")
        }
    }

    fun getClassifier() = classifier
    fun getLabels() = labels
}
