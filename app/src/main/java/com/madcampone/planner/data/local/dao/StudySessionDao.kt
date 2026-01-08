package com.madcampone.planner.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.madcampone.planner.data.local.entity.StudySessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StudySessionDao {
    @Query("SELECT * FROM study_sessions ORDER BY startTime DESC")
    fun getAllStudySessions(): Flow<List<StudySessionEntity>>

    @Query("SELECT * FROM study_sessions WHERE id = :sessionId")
    suspend fun getStudySessionById(sessionId: String): StudySessionEntity?

    @Query("SELECT * FROM study_sessions WHERE endTime IS NULL LIMIT 1")
    suspend fun getActiveSession(): StudySessionEntity?

    @Query("SELECT * FROM study_sessions WHERE endTime IS NULL")
    fun getActiveSessionFlow(): Flow<StudySessionEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudySession(session: StudySessionEntity)

    @Update
    suspend fun updateStudySession(session: StudySessionEntity)

    @Query("UPDATE study_sessions SET endTime = :endTime, duration = :duration WHERE id = :sessionId")
    suspend fun endSession(sessionId: String, endTime: Long, duration: Long)

    @Delete
    suspend fun deleteStudySession(session: StudySessionEntity)

    @Query("DELETE FROM study_sessions WHERE id = :sessionId")
    suspend fun deleteStudySessionById(sessionId: String)

    @Query("SELECT SUM(duration) FROM study_sessions WHERE startTime >= :startTime")
    suspend fun getTotalDurationSince(startTime: Long): Long?

    @Query("SELECT COUNT(*) FROM study_sessions WHERE startTime >= :startTime")
    suspend fun getSessionCountSince(startTime: Long): Int
}
