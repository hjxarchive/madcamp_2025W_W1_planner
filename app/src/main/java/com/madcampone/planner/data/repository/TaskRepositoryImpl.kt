package com.madcampone.planner.data.repository

import com.madcampone.planner.data.local.dao.TaskDao
import com.madcampone.planner.data.local.entity.TaskEntity
import com.madcampone.planner.domain.model.Task
import com.madcampone.planner.domain.repository.TaskRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TaskRepositoryImpl @Inject constructor(
    private val taskDao: TaskDao
) : TaskRepository {

    override fun getTasksByProjectId(projectId: String): Flow<List<Task>> {
        return taskDao.getTasksByProjectId(projectId)
            .map { list -> list.map { it.toDomainModel() } }
    }

    override fun getTaskById(id: String): Flow<Task?> {
        return flowOf(null) // TaskDao doesn't have Flow version, will update if needed
    }

    override fun getCompletedTasksByProjectId(projectId: String): Flow<List<Task>> {
        return taskDao.getTasksByProjectId(projectId)
            .map { list -> list.filter { it.isDone }.map { it.toDomainModel() } }
    }

    override fun getPendingTasksByProjectId(projectId: String): Flow<List<Task>> {
        return taskDao.getTasksByProjectId(projectId)
            .map { list -> list.filter { !it.isDone }.map { it.toDomainModel() } }
    }

    override suspend fun insertTask(task: Task) {
        taskDao.insertTask(TaskEntity.fromDomainModel(task))
    }

    override suspend fun updateTask(task: Task) {
        taskDao.updateTask(TaskEntity.fromDomainModel(task))
    }

    override suspend fun deleteTask(task: Task) {
        taskDao.deleteTask(TaskEntity.fromDomainModel(task))
    }

    override suspend fun deleteTasksByProjectId(projectId: String) {
        taskDao.deleteTasksByProjectId(projectId)
    }

    override suspend fun toggleTaskCompletion(taskId: String) {
        val task = taskDao.getTaskById(taskId)
        task?.let {
            taskDao.updateTaskStatus(taskId, !it.isDone)
        }
    }
}
