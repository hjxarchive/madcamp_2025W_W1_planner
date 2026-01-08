package com.madcampone.planner.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.madcampone.planner.data.local.entity.CollabProjectEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CollabDao {
    @Query("SELECT * FROM collab_projects ORDER BY createdAt DESC")
    fun getAllCollabProjects(): Flow<List<CollabProjectEntity>>

    @Query("SELECT * FROM collab_projects WHERE id = :collabId")
    suspend fun getCollabProjectById(collabId: String): CollabProjectEntity?

    @Query("SELECT * FROM collab_projects WHERE id = :collabId")
    fun getCollabProjectByIdFlow(collabId: String): Flow<CollabProjectEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCollabProject(collabProject: CollabProjectEntity)

    @Update
    suspend fun updateCollabProject(collabProject: CollabProjectEntity)

    @Query("UPDATE collab_projects SET overallProgress = :progress WHERE id = :collabId")
    suspend fun updateOverallProgress(collabId: String, progress: Float)

    @Delete
    suspend fun deleteCollabProject(collabProject: CollabProjectEntity)

    @Query("DELETE FROM collab_projects WHERE id = :collabId")
    suspend fun deleteCollabProjectById(collabId: String)
}
