package com.madcampone.planner.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.madcampone.planner.domain.model.CollabProject

@Entity(tableName = "collab_projects")
data class CollabProjectEntity(
    @PrimaryKey
    val id: String,
    val purpose: String,
    val participants: List<String>,
    val schedules: List<Long>,
    val overallProgress: Float,
    val createdAt: Long
) {
    fun toDomainModel(): CollabProject = CollabProject(
        id = id,
        purpose = purpose,
        participants = participants,
        schedules = schedules,
        overallProgress = overallProgress,
        createdAt = createdAt
    )

    companion object {
        fun fromDomainModel(collabProject: CollabProject): CollabProjectEntity = CollabProjectEntity(
            id = collabProject.id,
            purpose = collabProject.purpose,
            participants = collabProject.participants,
            schedules = collabProject.schedules,
            overallProgress = collabProject.overallProgress,
            createdAt = collabProject.createdAt
        )
    }
}
