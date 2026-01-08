package com.madcampone.planner.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.madcampone.planner.ui.auth.LoginScreen
import com.madcampone.planner.ui.auth.SignUpScreen
import com.madcampone.planner.ui.collab.CollabDetailScreen
import com.madcampone.planner.ui.collab.CollabScreen
import com.madcampone.planner.ui.collab.CreateCollabScreen
import com.madcampone.planner.ui.collab.JoinCollabScreen
import com.madcampone.planner.ui.current.CreateProjectScreen
import com.madcampone.planner.ui.current.CurrentScreen
import com.madcampone.planner.ui.current.EditProjectScreen
import com.madcampone.planner.ui.current.ProjectDetailScreen
import com.madcampone.planner.ui.past.MonthDetailScreen
import com.madcampone.planner.ui.past.PastScreen
import com.madcampone.planner.ui.study.StudyScreen
import com.madcampone.planner.ui.study.StudySessionScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Current.route,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        // Auth
        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateToSignUp = { navController.navigate(Screen.SignUp.route) },
                onLoginSuccess = {
                    navController.navigate(Screen.Current.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.SignUp.route) {
            SignUpScreen(
                onNavigateBack = { navController.popBackStack() },
                onSignUpSuccess = {
                    navController.navigate(Screen.Current.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // Main Tabs
        composable(Screen.Current.route) {
            CurrentScreen(
                onProjectClick = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                },
                onCreateProjectClick = {
                    navController.navigate(Screen.CreateProject.route)
                }
            )
        }

        composable(Screen.Past.route) {
            PastScreen(
                onMonthClick = { yearMonth ->
                    navController.navigate(Screen.MonthDetail.createRoute(yearMonth))
                }
            )
        }

        composable(Screen.Collab.route) {
            CollabScreen(
                onCollabClick = { collabId ->
                    navController.navigate(Screen.CollabDetail.createRoute(collabId))
                },
                onCreateCollabClick = {
                    navController.navigate(Screen.CreateCollab.route)
                },
                onJoinCollabClick = {
                    navController.navigate(Screen.JoinCollab.route)
                }
            )
        }

        composable(Screen.Study.route) {
            StudyScreen(
                onSessionClick = { sessionId ->
                    navController.navigate(Screen.StudySession.createRoute(sessionId))
                }
            )
        }

        // Detail Screens
        composable(
            route = Screen.ProjectDetail.route,
            arguments = listOf(navArgument("projectId") { type = NavType.StringType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getString("projectId") ?: return@composable
            ProjectDetailScreen(
                projectId = projectId,
                onNavigateBack = { navController.popBackStack() },
                onEditClick = {
                    navController.navigate(Screen.EditProject.createRoute(projectId))
                }
            )
        }

        composable(
            route = Screen.MonthDetail.route,
            arguments = listOf(navArgument("yearMonth") { type = NavType.StringType })
        ) { backStackEntry ->
            val yearMonth = backStackEntry.arguments?.getString("yearMonth") ?: return@composable
            MonthDetailScreen(
                yearMonth = yearMonth,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.CollabDetail.route,
            arguments = listOf(navArgument("collabId") { type = NavType.StringType })
        ) { backStackEntry ->
            val collabId = backStackEntry.arguments?.getString("collabId") ?: return@composable
            CollabDetailScreen(
                collabId = collabId,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.StudySession.route,
            arguments = listOf(navArgument("sessionId") { type = NavType.StringType })
        ) { backStackEntry ->
            val sessionId = backStackEntry.arguments?.getString("sessionId") ?: return@composable
            StudySessionScreen(
                sessionId = sessionId,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Create/Edit Screens
        composable(Screen.CreateProject.route) {
            CreateProjectScreen(
                onNavigateBack = { navController.popBackStack() },
                onProjectCreated = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.EditProject.route,
            arguments = listOf(navArgument("projectId") { type = NavType.StringType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getString("projectId") ?: return@composable
            EditProjectScreen(
                projectId = projectId,
                onNavigateBack = { navController.popBackStack() },
                onProjectUpdated = { navController.popBackStack() }
            )
        }

        composable(Screen.CreateCollab.route) {
            CreateCollabScreen(
                onNavigateBack = { navController.popBackStack() },
                onCollabCreated = { navController.popBackStack() }
            )
        }

        composable(Screen.JoinCollab.route) {
            JoinCollabScreen(
                onNavigateBack = { navController.popBackStack() },
                onCollabJoined = { navController.popBackStack() }
            )
        }
    }
}
