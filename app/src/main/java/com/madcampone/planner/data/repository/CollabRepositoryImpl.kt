package com.madcampone.planner.data.repository

import com.madcampone.planner.data.local.dao.CollabDao
import com.madcampone.planner.data.local.entity.CollabProjectEntity
import com.madcampone.planner.domain.model.CollabProject
import com.madcampone.planner.domain.repository.CollabRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CollabRepositoryImpl @Inject constructor(
    private val collabDao: CollabDao
) : CollabRepository {

    override fun getAllCollabProjects(): Flow<List<CollabProject>> {
        return collabDao.getAllCollabProjects()
            .map { list -> list.map { it.toDomainModel() } }
    }

    override fun getCollabProjectById(id: String): Flow<CollabProject?> {
        return collabDao.getCollabProjectByIdFlow(id)
            .map { it?.toDomainModel() }
    }

    override fun getCollabProjectByCode(code: String): Flow<CollabProject?> {
        // Code-based lookup will be implemented with remote API
        return flowOf(null)
    }

    override fun getActiveCollabProjects(): Flow<List<CollabProject>> {
        return collabDao.getAllCollabProjects()
            .map { list -> list.map { it.toDomainModel() } }
    }

    override suspend fun insertCollabProject(collabProject: CollabProject) {
        collabDao.insertCollabProject(CollabProjectEntity.fromDomainModel(collabProject))
    }

    override suspend fun updateCollabProject(collabProject: CollabProject) {
        collabDao.updateCollabProject(CollabProjectEntity.fromDomainModel(collabProject))
    }

    override suspend fun deleteCollabProject(collabProject: CollabProject) {
        collabDao.deleteCollabProject(CollabProjectEntity.fromDomainModel(collabProject))
    }

    override suspend fun joinCollabProject(code: String, userId: String): Result<CollabProject> {
        // Will be implemented with remote API
        return Result.failure(NotImplementedError("Remote API not yet implemented"))
    }

    override suspend fun leaveCollabProject(projectId: String, userId: String) {
        // Will be implemented with remote API
    }
}
