package com.madcampone.planner.domain.model

data class Task(
    val id: String,
    val projectId: String,
    val description: String,
    val isDone: Boolean,
    val order: Int
)
