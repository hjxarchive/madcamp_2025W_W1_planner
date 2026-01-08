package com.madcampone.planner.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.madcampone.planner.data.local.entity.ProjectEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects WHERE isCompleted = 0 ORDER BY dueDate ASC")
    fun getActiveProjects(): Flow<List<ProjectEntity>>

    @Query("SELECT * FROM projects WHERE isCompleted = 1 ORDER BY completedAt DESC")
    fun getCompletedProjects(): Flow<List<ProjectEntity>>

    @Query("SELECT * FROM projects WHERE id = :projectId")
    suspend fun getProjectById(projectId: String): ProjectEntity?

    @Query("SELECT * FROM projects WHERE id = :projectId")
    fun getProjectByIdFlow(projectId: String): Flow<ProjectEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProject(project: ProjectEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProjects(projects: List<ProjectEntity>)

    @Update
    suspend fun updateProject(project: ProjectEntity)

    @Query("UPDATE projects SET progress = :progress WHERE id = :projectId")
    suspend fun updateProgress(projectId: String, progress: Float)

    @Query("UPDATE projects SET isCompleted = 1, completedAt = :completedAt WHERE id = :projectId")
    suspend fun markAsCompleted(projectId: String, completedAt: Long)

    @Delete
    suspend fun deleteProject(project: ProjectEntity)

    @Query("DELETE FROM projects WHERE id = :projectId")
    suspend fun deleteProjectById(projectId: String)

    @Query("SELECT * FROM projects WHERE isCompleted = 1 AND completedAt BETWEEN :startOfMonth AND :endOfMonth ORDER BY completedAt DESC")
    fun getProjectsByMonth(startOfMonth: Long, endOfMonth: Long): Flow<List<ProjectEntity>>
}
