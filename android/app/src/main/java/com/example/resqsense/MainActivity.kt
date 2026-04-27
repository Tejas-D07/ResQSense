package com.example.resqsense

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.resqsense.data.DetectionState
import com.example.resqsense.data.prefs.SettingsManager
import com.example.resqsense.services.EmergencyForegroundService
import com.example.resqsense.ui.navigation.BottomNavScreen
import com.example.resqsense.ui.navigation.Screen
import com.example.resqsense.ui.screens.*
import com.example.resqsense.ui.theme.ResQSenseTheme

class MainActivity : ComponentActivity() {

    private val requiredPermissions = mutableListOf(
        Manifest.permission.SEND_SMS,
        Manifest.permission.CALL_PHONE,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    ).apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            add(Manifest.permission.POST_NOTIFICATIONS)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            add(Manifest.permission.FOREGROUND_SERVICE)
        }
    }.toTypedArray()

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.entries.all { it.value }
        if (allGranted) {
            Log.d("DEBUG", "MainActivity: All permissions granted")
        } else {
            Toast.makeText(this, "ResQSense needs all permissions to protect you properly.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        checkAndRequestPermissions()
        setContent {
            ResQSenseTheme {
                ResQSenseApp()
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val allGranted = requiredPermissions.all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
        if (!allGranted) {
            Log.d("DEBUG", "MainActivity: Requesting permissions")
            permissionLauncher.launch(requiredPermissions)
        }
    }

    @Composable
    fun ResQSenseApp() {
        val navController = rememberNavController()
        
        NavHost(
            navController = navController, 
            startDestination = Screen.Splash.route,
            enterTransition = { fadeIn(animationSpec = tween(500)) },
            exitTransition = { fadeOut(animationSpec = tween(500)) }
        ) {
            composable(Screen.Splash.route) {
                SplashScreen(onNavigateNext = {
                    val startRoute = if (SettingsManager.isLoggedIn(this@MainActivity)) Screen.Main.route else Screen.Login.route
                    navController.navigate(startRoute) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                })
            }
            composable(Screen.Login.route) {
                LoginScreen(onLoginSuccess = {
                    SettingsManager.setLoggedIn(this@MainActivity, true)
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                })
            }
            composable(Screen.Main.route) {
                MainContainer()
            }
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun MainContainer() {
        var currentBottomTab by remember { mutableStateOf<BottomNavScreen>(BottomNavScreen.Home) }
        val isMonitoring = DetectionState.isMonitoring
        
        val bottomTabs = listOf(
            BottomNavScreen.Home,
            BottomNavScreen.Monitoring,
            BottomNavScreen.Contacts,
            BottomNavScreen.Logs,
            BottomNavScreen.Settings
        )
        val icons = listOf(
            Icons.Default.Home,
            Icons.Default.Search,
            Icons.Default.Person,
            Icons.Default.List,
            Icons.Default.Settings
        )

        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = { 
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Image(
                                painter = painterResource(id = R.drawable.app_logo),
                                contentDescription = null,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                if (isMonitoring) "PROTECTION ACTIVE" else "ResQSense AI", 
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isMonitoring) Color(0xFF00E676) else MaterialTheme.colorScheme.onPrimaryContainer,
                                letterSpacing = if (isMonitoring) 1.sp else 0.sp
                            )
                        }
                    },
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = if (isMonitoring) Color(0xFF0D1B2A) else MaterialTheme.colorScheme.primaryContainer,
                        titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                )
            },
            bottomBar = {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
                    contentColor = MaterialTheme.colorScheme.onSurface
                ) {
                    bottomTabs.forEachIndexed { index, screen ->
                        NavigationBarItem(
                            selected = currentBottomTab == screen,
                            onClick = { currentBottomTab = screen },
                            icon = { Icon(icons[index], contentDescription = screen.title) },
                            label = { Text(screen.title) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                unselectedIconColor = Color.Gray,
                                indicatorColor = Color.Transparent
                            )
                        )
                    }
                }
            }
        ) { padding ->
            Box(modifier = Modifier.padding(padding)) {
                when (currentBottomTab) {
                    BottomNavScreen.Home -> HomeScreen()
                    BottomNavScreen.Monitoring -> MonitoringScreen()
                    BottomNavScreen.Contacts -> ContactsScreen()
                    BottomNavScreen.Logs -> LogsScreen()
                    BottomNavScreen.Settings -> SettingsScreen()
                }
            }
        }
    }
}
