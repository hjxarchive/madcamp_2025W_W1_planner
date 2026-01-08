package com.madcampone.planner.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.madcampone.planner.domain.model.Task

@Entity(
    tableName = "tasks",
    foreignKeys = [
        ForeignKey(
            entity = ProjectEntity::class,
            parentColumns = ["id"],
            childColumns = ["projectId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("projectId")]
)
data class TaskEntity(
    @PrimaryKey
    val id: String,
    val projectId: String,
    val description: String,
    val isDone: Boolean,
    val order: Int
) {
    fun toDomainModel(): Task = Task(
        id = id,
        projectId = projectId,
        description = description,
        isDone = isDone,
        order = order
    )

    companion object {
        fun fromDomainModel(task: Task): TaskEntity = TaskEntity(
            id = task.id,
            projectId = task.projectId,
            description = task.description,
            isDone = task.isDone,
            order = task.order
        )
    }
}
