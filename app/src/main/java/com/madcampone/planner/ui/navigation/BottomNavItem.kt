package com.madcampone.planner.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.School
import androidx.compose.ui.graphics.vector.ImageVector

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    data object Current : BottomNavItem(
        route = Screen.Current.route,
        title = "Current",
        icon = Icons.Default.DateRange
    )

    data object Past : BottomNavItem(
        route = Screen.Past.route,
        title = "Past",
        icon = Icons.Default.History
    )

    data object Collab : BottomNavItem(
        route = Screen.Collab.route,
        title = "Collab",
        icon = Icons.Default.Groups
    )

    data object Study : BottomNavItem(
        route = Screen.Study.route,
        title = "Study",
        icon = Icons.Default.School
    )

    companion object {
        val items = listOf(Current, Past, Collab, Study)
    }
}
