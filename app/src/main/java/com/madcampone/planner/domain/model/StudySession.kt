package com.madcampone.planner.domain.model

data class StudySession(
    val id: String,
    val participants: List<String>,
    val startTime: Long,
    val endTime: Long?,
    val duration: Long,
    val location: String?
)

data class StudyParticipant(
    val id: String,
    val nickname: String,
    val emoji: String,
    val currentTask: String?,
    val isActive: Boolean
)
