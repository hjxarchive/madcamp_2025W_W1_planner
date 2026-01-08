package com.madcampone.planner.domain.model

data class User(
    val id: String,
    val nickname: String,
    val emoji: String,
    val email: String,
    val createdAt: Long
)
