package com.example.resqsense.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.resqsense.data.prefs.SettingsManager

@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    var autoDetect by remember { mutableStateOf(SettingsManager.isAutoDetectionEnabled(context)) }
    var smsEnabled by remember { mutableStateOf(SettingsManager.isSmsEnabled(context)) }
    var callEnabled by remember { mutableStateOf(SettingsManager.isCallEnabled(context)) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Safety Settings", style = MaterialTheme.typography.titleLarge)

        SettingToggle(
            title = "Auto AI Detection",
            subtitle = "Automatically trigger alerts on danger sound",
            checked = autoDetect,
            onCheckedChange = { 
                autoDetect = it
                SettingsManager.setAutoDetectionEnabled(context, it)
            },
            icon = Icons.Default.Settings
        )

        SettingToggle(
            title = "SMS Alerts",
            subtitle = "Send emergency messages to contacts",
            checked = smsEnabled,
            onCheckedChange = { 
                smsEnabled = it
                SettingsManager.setSmsEnabled(context, it)
            },
            icon = Icons.Default.Notifications
        )

        SettingToggle(
            title = "Emergency Calls",
            subtitle = "Auto-call primary contact after alert",
            checked = callEnabled,
            onCheckedChange = { 
                callEnabled = it
                SettingsManager.setCallEnabled(context, it)
            },
            icon = Icons.Default.Phone
        )

        Divider()

        Text("App Information", style = MaterialTheme.typography.titleMedium)
        
        ListItem(
            headlineContent = { Text("Version") },
            supportingContent = { Text("1.0.2-pro") },
            leadingContent = { Icon(Icons.Default.Info, contentDescription = null) }
        )
    }
}

@Composable
fun SettingToggle(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(title, style = MaterialTheme.typography.bodyLarge)
                    Text(subtitle, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                }
            }
            Switch(checked = checked, onCheckedChange = onCheckedChange)
        }
    }
}
