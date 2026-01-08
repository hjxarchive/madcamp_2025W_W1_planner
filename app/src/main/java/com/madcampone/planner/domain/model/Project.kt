package com.madcampone.planner.domain.model

data class Project(
    val id: String,
    val name: String,
    val dueDate: Long,
    val progress: Float,
    val tags: List<String>,
    val isCompleted: Boolean,
    val createdAt: Long,
    val completedAt: Long?
)
