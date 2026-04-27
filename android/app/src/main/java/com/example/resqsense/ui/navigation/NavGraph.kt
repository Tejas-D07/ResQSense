package com.example.resqsense.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Main : Screen("main")
}

sealed class BottomNavScreen(val route: String, val title: String) {
    object Home : BottomNavScreen("home", "Home")
    object Monitoring : BottomNavScreen("monitoring", "Monitor")
    object Contacts : BottomNavScreen("contacts", "Contacts")
    object Logs : BottomNavScreen("logs", "Logs")
    object Settings : BottomNavScreen("settings", "Settings")
}
