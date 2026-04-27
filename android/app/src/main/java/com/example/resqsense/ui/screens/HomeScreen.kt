package com.example.resqsense.ui.screens

import android.content.Intent
import android.util.Log
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.resqsense.data.*
import com.example.resqsense.helpers.HapticHelper
import com.example.resqsense.helpers.SmsHelper
import com.example.resqsense.services.EmergencyForegroundService
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, androidx.compose.ui.ExperimentalComposeUiApi::class)
@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val isMonitoring = DetectionState.isMonitoring
    var inputText by remember { mutableStateOf("") }
    var isAnalyzing by remember { mutableStateOf(false) }
    val keyboardController = LocalSoftwareKeyboardController.current
    val scope = rememberCoroutineScope()
    val apiService = remember { AiApiService.create() }

    val emergencyPhrases = listOf("help", "danger", "emergency")

    fun executeEmergencyTrigger(message: String) {
        Log.d("DEBUG", "Manual Emergency Triggered: $message")
        HapticHelper.vibrateEmergency(context)
        Toast.makeText(context, "Emergency Triggered!", Toast.LENGTH_SHORT).show()
        
        val database = FirebaseDatabase.getInstance().getReference("alerts")
        val alert = Alert(
            sound = "Manual Trigger: $message",
            confidence = 100,
            timestamp = System.currentTimeMillis().toString()
        )
        database.push().setValue(alert)
        inputText = ""
        keyboardController?.hide()
    }

    fun triggerManualEmergency() {
        val message = inputText.trim()
        if (message.isEmpty()) return
        HapticHelper.vibrateTick(context)

        // 1. First check keywords
        if (emergencyPhrases.any { message.contains(it, ignoreCase = true) }) {
            executeEmergencyTrigger(message)
        } else {
            // 2. If not matched, send to backend API
            scope.launch {
                isAnalyzing = true
                try {
                    val response = apiService.analyzeMessage(AnalysisRequest(message))
                    if (response.isSuccessful && response.body()?.result == "EMERGENCY") {
                        executeEmergencyTrigger(message)
                    } else {
                        Toast.makeText(context, "Message classified as SAFE", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Log.e("DEBUG", "AI Analysis Failed: ${e.message}")
                    Toast.makeText(context, "AI Check failed. Try simple keywords like 'help'.", Toast.LENGTH_SHORT).show()
                } finally {
                    isAnalyzing = false
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF0D1B2A), Color(0xFF1E1E2F), Color(0xFF2D1B36))
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Status Section
            StatusSection(isMonitoring)

            Spacer(modifier = Modifier.height(32.dp))

            // Glassmorphism Manual Trigger Card
            GlassCard {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Manual Emergency Trigger",
                        color = Color.White.copy(alpha = 0.7f),
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Type 'help me'...", color = Color.White.copy(alpha = 0.4f)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFFBB86FC),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            cursorColor = Color(0xFFBB86FC)
                        ),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(onSend = { triggerManualEmergency() })
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { if (!isAnalyzing) triggerManualEmergency() },
                            modifier = Modifier.weight(1f).height(50.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFBB86FC)),
                            shape = RoundedCornerShape(12.dp),
                            enabled = !isAnalyzing
                        ) {
                            if (isAnalyzing) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Color.White,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text("Send Alert", fontWeight = FontWeight.Bold)
                            }
                        }
                        
                        OutlinedButton(
                            onClick = {
                                val contacts = ContactManager.getContacts(context)
                                if (contacts.isNotEmpty()) {
                                    SmsHelper.sendSms(context, contacts[0].phone, "Test message from ResQSense")
                                    Toast.makeText(context, "Test SMS sent to ${contacts[0].name}", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "No emergency contacts found!", Toast.LENGTH_LONG).show()
                                }
                            },
                            modifier = Modifier.weight(1f).height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.3f))
                        ) {
                            Text("Test SMS", color = Color.White)
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "⚠️ SMS works only on real devices with a SIM card.",
                        color = Color.White.copy(alpha = 0.5f),
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Detection Feedback (Visible only when monitoring)
            AnimatedVisibility(
                visible = isMonitoring,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                GlassCard {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            val infiniteTransition = rememberInfiniteTransition()
                            val glowAlpha by infiniteTransition.animateFloat(
                                initialValue = 0.3f,
                                targetValue = 1f,
                                animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse)
                            )
                            Box(
                                modifier = Modifier
                                    .size(12.dp)
                                    .background(Color(0xFF4D88FF).copy(alpha = glowAlpha), CircleShape)
                                    .border(1.dp, Color(0xFF4D88FF), CircleShape)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("AI Analyzing Audio...", color = Color.White, style = MaterialTheme.typography.bodyMedium)
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            DetectionState.currentLabel,
                            style = MaterialTheme.typography.headlineSmall,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = DetectionState.currentConfidence / 100f,
                            modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                            color = if (DetectionState.currentConfidence > 70) Color(0xFFFF5252) else Color(0xFF4D88FF),
                            trackColor = Color.White.copy(alpha = 0.1f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Control Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ActionButton(
                    text = "START",
                    icon = Icons.Default.PlayArrow,
                    color = Color(0xFF4CAF50),
                    enabled = !isMonitoring,
                    modifier = Modifier.weight(1f)
                ) {
                    Log.d("DEBUG", "UI: Starting Service")
                    HapticHelper.vibrateStart(context)
                    val intent = Intent(context, EmergencyForegroundService::class.java)
                    ContextCompat.startForegroundService(context, intent)
                }

                ActionButton(
                    text = "STOP",
                    icon = Icons.Default.Close,
                    color = Color(0xFFF44336),
                    enabled = isMonitoring,
                    modifier = Modifier.weight(1f)
                ) {
                    Log.d("DEBUG", "UI: Stopping Service")
                    HapticHelper.vibrateStop(context)
                    context.stopService(Intent(context, EmergencyForegroundService::class.java))
                }
            }
        }
    }
}

@Composable
fun StatusSection(isMonitoring: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        val color = if (isMonitoring) Color(0xFF4CAF50) else Color(0xFFF44336)
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(color.copy(alpha = 0.1f), CircleShape)
                .border(2.dp, color, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (isMonitoring) Icons.Default.CheckCircle else Icons.Default.Warning,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(48.dp)
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            if (isMonitoring) "SAFE" else "ALERT",
            style = MaterialTheme.typography.displaySmall,
            fontWeight = FontWeight.Black,
            color = color
        )
    }
}

@Composable
fun GlassCard(content: @Composable () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White.copy(alpha = 0.07f),
        shape = RoundedCornerShape(24.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        content()
    }
}

@Composable
fun ActionButton(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "ButtonScale"
    )

    Button(
        onClick = onClick,
        enabled = enabled,
        interactionSource = interactionSource,
        modifier = modifier
            .height(64.dp)
            .scale(scale),
        colors = ButtonDefaults.buttonColors(
            containerColor = color,
            disabledContainerColor = color.copy(alpha = 0.2f)
        ),
        shape = RoundedCornerShape(20.dp),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
    ) {
        Icon(icon, contentDescription = null)
        Spacer(modifier = Modifier.width(8.dp))
        Text(text, fontWeight = FontWeight.Bold, fontSize = 18.sp)
    }
}
