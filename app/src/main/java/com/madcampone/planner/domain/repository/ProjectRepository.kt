package com.madcampone.planner.domain.repository

import com.madcampone.planner.domain.model.Project
import kotlinx.coroutines.flow.Flow

interface ProjectRepository {
    fun getAllProjects(): Flow<List<Project>>
    fun getProjectById(id: String): Flow<Project?>
    fun getProjectsByStatus(isCompleted: Boolean): Flow<List<Project>>
    fun getCurrentProject(): Flow<Project?>
    fun getProjectsByMonth(year: Int, month: Int): Flow<List<Project>>
    suspend fun insertProject(project: Project)
    suspend fun updateProject(project: Project)
    suspend fun deleteProject(project: Project)
    suspend fun setCurrentProject(projectId: String)
    suspend fun clearCurrentProject()
}
