package com.madcampone.planner.data.repository

import com.madcampone.planner.data.local.dao.StudySessionDao
import com.madcampone.planner.data.local.entity.StudySessionEntity
import com.madcampone.planner.domain.model.StudySession
import com.madcampone.planner.domain.repository.StudyRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StudyRepositoryImpl @Inject constructor(
    private val studySessionDao: StudySessionDao
) : StudyRepository {

    override fun getAllStudySessions(): Flow<List<StudySession>> {
        return studySessionDao.getAllStudySessions()
            .map { list -> list.map { it.toDomainModel() } }
    }

    override fun getStudySessionById(id: String): Flow<StudySession?> {
        return flowOf(null) // Will implement Flow version if needed
    }

    override fun getActiveStudySessions(): Flow<List<StudySession>> {
        return studySessionDao.getActiveSessionFlow()
            .map { session -> listOfNotNull(session?.toDomainModel()) }
    }

    override fun getStudySessionsByUserId(userId: String): Flow<List<StudySession>> {
        // Filter by user will be implemented when user management is added
        return studySessionDao.getAllStudySessions()
            .map { list -> list.map { it.toDomainModel() } }
    }

    override suspend fun insertStudySession(studySession: StudySession) {
        studySessionDao.insertStudySession(StudySessionEntity.fromDomainModel(studySession))
    }

    override suspend fun updateStudySession(studySession: StudySession) {
        studySessionDao.updateStudySession(StudySessionEntity.fromDomainModel(studySession))
    }

    override suspend fun deleteStudySession(studySession: StudySession) {
        studySessionDao.deleteStudySession(StudySessionEntity.fromDomainModel(studySession))
    }

    override suspend fun endStudySession(sessionId: String) {
        val session = studySessionDao.getStudySessionById(sessionId)
        session?.let {
            val endTime = System.currentTimeMillis()
            val duration = endTime - it.startTime
            studySessionDao.endSession(sessionId, endTime, duration)
        }
    }
}
