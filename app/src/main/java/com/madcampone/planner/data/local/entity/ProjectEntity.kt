package com.madcampone.planner.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.madcampone.planner.domain.model.Project

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val dueDate: Long,
    val progress: Float,
    val tags: List<String>,
    val isCompleted: Boolean,
    val createdAt: Long,
    val completedAt: Long?
) {
    fun toDomainModel(): Project = Project(
        id = id,
        name = name,
        dueDate = dueDate,
        progress = progress,
        tags = tags,
        isCompleted = isCompleted,
        createdAt = createdAt,
        completedAt = completedAt
    )

    companion object {
        fun fromDomainModel(project: Project): ProjectEntity = ProjectEntity(
            id = project.id,
            name = project.name,
            dueDate = project.dueDate,
            progress = project.progress,
            tags = project.tags,
            isCompleted = project.isCompleted,
            createdAt = project.createdAt,
            completedAt = project.completedAt
        )
    }
}
