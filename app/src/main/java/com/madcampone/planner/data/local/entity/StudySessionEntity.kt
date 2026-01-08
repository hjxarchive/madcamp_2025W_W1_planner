package com.madcampone.planner.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.madcampone.planner.domain.model.StudySession

@Entity(tableName = "study_sessions")
data class StudySessionEntity(
    @PrimaryKey
    val id: String,
    val participants: List<String>,
    val startTime: Long,
    val endTime: Long?,
    val duration: Long,
    val location: String?
) {
    fun toDomainModel(): StudySession = StudySession(
        id = id,
        participants = participants,
        startTime = startTime,
        endTime = endTime,
        duration = duration,
        location = location
    )

    companion object {
        fun fromDomainModel(studySession: StudySession): StudySessionEntity = StudySessionEntity(
            id = studySession.id,
            participants = studySession.participants,
            startTime = studySession.startTime,
            endTime = studySession.endTime,
            duration = studySession.duration,
            location = studySession.location
        )
    }
}
