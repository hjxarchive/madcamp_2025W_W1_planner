package com.madcampone.planner.ui.navigation

sealed class Screen(val route: String) {
    // Auth
    data object Login : Screen("login")
    data object SignUp : Screen("signup")

    // Main Tabs
    data object Current : Screen("current")
    data object Past : Screen("past")
    data object Collab : Screen("collab")
    data object Study : Screen("study")

    // Detail Screens
    data object ProjectDetail : Screen("project/{projectId}") {
        fun createRoute(projectId: String) = "project/$projectId"
    }
    data object MonthDetail : Screen("month/{yearMonth}") {
        fun createRoute(yearMonth: String) = "month/$yearMonth"
    }
    data object CollabDetail : Screen("collab/{collabId}") {
        fun createRoute(collabId: String) = "collab/$collabId"
    }
    data object StudySession : Screen("study/session/{sessionId}") {
        fun createRoute(sessionId: String) = "study/session/$sessionId"
    }

    // Create/Edit Screens
    data object CreateProject : Screen("project/create")
    data object EditProject : Screen("project/edit/{projectId}") {
        fun createRoute(projectId: String) = "project/edit/$projectId"
    }
    data object CreateCollab : Screen("collab/create")
    data object JoinCollab : Screen("collab/join")
}
