package com.madcampone.planner.domain.repository

import com.madcampone.planner.domain.model.StudySession
import kotlinx.coroutines.flow.Flow

interface StudyRepository {
    fun getAllStudySessions(): Flow<List<StudySession>>
    fun getStudySessionById(id: String): Flow<StudySession?>
    fun getActiveStudySessions(): Flow<List<StudySession>>
    fun getStudySessionsByUserId(userId: String): Flow<List<StudySession>>
    suspend fun insertStudySession(studySession: StudySession)
    suspend fun updateStudySession(studySession: StudySession)
    suspend fun deleteStudySession(studySession: StudySession)
    suspend fun endStudySession(sessionId: String)
}
