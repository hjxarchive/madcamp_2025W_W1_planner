package com.madcampone.planner.data.repository

import com.madcampone.planner.data.local.dao.ProjectDao
import com.madcampone.planner.data.local.entity.ProjectEntity
import com.madcampone.planner.domain.model.Project
import com.madcampone.planner.domain.repository.ProjectRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectRepositoryImpl @Inject constructor(
    private val projectDao: ProjectDao
) : ProjectRepository {

    private val currentProjectId = MutableStateFlow<String?>(null)

    override fun getAllProjects(): Flow<List<Project>> {
        return combine(
            projectDao.getActiveProjects(),
            projectDao.getCompletedProjects()
        ) { active, completed ->
            (active + completed).map { it.toDomainModel() }
        }
    }

    override fun getProjectById(id: String): Flow<Project?> {
        return projectDao.getProjectByIdFlow(id).map { it?.toDomainModel() }
    }

    override fun getProjectsByStatus(isCompleted: Boolean): Flow<List<Project>> {
        return if (isCompleted) {
            projectDao.getCompletedProjects().map { list -> list.map { it.toDomainModel() } }
        } else {
            projectDao.getActiveProjects().map { list -> list.map { it.toDomainModel() } }
        }
    }

    override fun getCurrentProject(): Flow<Project?> {
        return combine(
            currentProjectId,
            projectDao.getActiveProjects()
        ) { currentId, projects ->
            currentId?.let { id ->
                projects.find { it.id == id }?.toDomainModel()
            }
        }
    }

    override fun getProjectsByMonth(year: Int, month: Int): Flow<List<Project>> {
        val calendar = Calendar.getInstance().apply {
            set(year, month - 1, 1, 0, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startOfMonth = calendar.timeInMillis

        calendar.add(Calendar.MONTH, 1)
        val endOfMonth = calendar.timeInMillis - 1

        return projectDao.getProjectsByMonth(startOfMonth, endOfMonth)
            .map { list -> list.map { it.toDomainModel() } }
    }

    override suspend fun insertProject(project: Project) {
        projectDao.insertProject(ProjectEntity.fromDomainModel(project))
    }

    override suspend fun updateProject(project: Project) {
        projectDao.updateProject(ProjectEntity.fromDomainModel(project))
    }

    override suspend fun deleteProject(project: Project) {
        projectDao.deleteProject(ProjectEntity.fromDomainModel(project))
    }

    override suspend fun setCurrentProject(projectId: String) {
        currentProjectId.value = projectId
    }

    override suspend fun clearCurrentProject() {
        currentProjectId.value = null
    }
}
