package com.madcampone.planner.domain.repository

import com.madcampone.planner.domain.model.Task
import kotlinx.coroutines.flow.Flow

interface TaskRepository {
    fun getTasksByProjectId(projectId: String): Flow<List<Task>>
    fun getTaskById(id: String): Flow<Task?>
    fun getCompletedTasksByProjectId(projectId: String): Flow<List<Task>>
    fun getPendingTasksByProjectId(projectId: String): Flow<List<Task>>
    suspend fun insertTask(task: Task)
    suspend fun updateTask(task: Task)
    suspend fun deleteTask(task: Task)
    suspend fun deleteTasksByProjectId(projectId: String)
    suspend fun toggleTaskCompletion(taskId: String)
}
