package com.madcampone.planner.domain.repository

import com.madcampone.planner.domain.model.CollabProject
import kotlinx.coroutines.flow.Flow

interface CollabRepository {
    fun getAllCollabProjects(): Flow<List<CollabProject>>
    fun getCollabProjectById(id: String): Flow<CollabProject?>
    fun getCollabProjectByCode(code: String): Flow<CollabProject?>
    fun getActiveCollabProjects(): Flow<List<CollabProject>>
    suspend fun insertCollabProject(collabProject: CollabProject)
    suspend fun updateCollabProject(collabProject: CollabProject)
    suspend fun deleteCollabProject(collabProject: CollabProject)
    suspend fun joinCollabProject(code: String, userId: String): Result<CollabProject>
    suspend fun leaveCollabProject(projectId: String, userId: String)
}
