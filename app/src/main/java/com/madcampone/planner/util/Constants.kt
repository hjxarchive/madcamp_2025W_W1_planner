package com.madcampone.planner.util

object Constants {
    const val BASE_URL = "http://10.0.2.2:8080/api/"

    object Tags {
        const val WORK = "Work"
        const val PERSONAL = "Personal"
        const val STUDY = "Study"
        const val HEALTH = "Health"
        const val OTHER = "Other"

        val ALL = listOf(WORK, PERSONAL, STUDY, HEALTH, OTHER)
    }

    object SortOrder {
        const val BY_DUE_DATE = "due_date"
        const val BY_PRIORITY = "priority"
        const val BY_PROGRESS = "progress"
        const val BY_CREATED_AT = "created_at"
    }
}
