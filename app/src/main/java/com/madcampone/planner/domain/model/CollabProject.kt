package com.madcampone.planner.domain.model

data class CollabProject(
    val id: String,
    val purpose: String,
    val participants: List<String>,
    val schedules: List<Long>,
    val overallProgress: Float,
    val createdAt: Long
)

data class CollabParticipant(
    val userId: String,
    val nickname: String,
    val emoji: String,
    val progress: Float
)
