package com.example.resqsense.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.resqsense.data.DetectionState

@Composable
fun MonitoringScreen() {
    val infiniteTransition = rememberInfiniteTransition()
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        )
    )

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(contentAlignment = Alignment.Center) {
            // Pulse effect
            if (DetectionState.isListening) {
                Box(
                    modifier = Modifier
                        .size(150.dp)
                        .scale(scale)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f), CircleShape)
                )
            }
            // Core circle
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .background(if (DetectionState.isListening) MaterialTheme.colorScheme.primary else Color.Gray, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(if (DetectionState.isListening) "AI" else "OFF", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
            }
        }
        
        Spacer(modifier = Modifier.height(48.dp))
        
        Text(
            text = if (DetectionState.isListening) "Listening for Danger..." else "System Paused",
            fontSize = 20.sp,
            fontWeight = FontWeight.Medium
        )
        Text(
            text = if (DetectionState.isListening) "YAMNet model is active" else "Detection is inactive",
            fontSize = 14.sp,
            color = Color.Gray
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        DetectionStream()
    }
}

@Composable
fun DetectionStream() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 32.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Real-time Analysis", style = MaterialTheme.typography.labelMedium)
            Spacer(modifier = Modifier.height(8.dp))
            DetectionItem(DetectionState.currentLabel, DetectionState.currentConfidence)
            Text(
                "Live feed from microphone",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

@Composable
fun DetectionItem(label: String, confidence: Int) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall)
        Text("${confidence}%", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
    }
}
