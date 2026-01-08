package com.madcampone.planner.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.madcampone.planner.data.local.converter.Converters
import com.madcampone.planner.data.local.dao.CollabDao
import com.madcampone.planner.data.local.dao.ProjectDao
import com.madcampone.planner.data.local.dao.StudySessionDao
import com.madcampone.planner.data.local.dao.TaskDao
import com.madcampone.planner.data.local.entity.CollabProjectEntity
import com.madcampone.planner.data.local.entity.ProjectEntity
import com.madcampone.planner.data.local.entity.StudySessionEntity
import com.madcampone.planner.data.local.entity.TaskEntity

@Database(
    entities = [
        ProjectEntity::class,
        TaskEntity::class,
        CollabProjectEntity::class,
        StudySessionEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class PlannerDatabase : RoomDatabase() {
    abstract fun projectDao(): ProjectDao
    abstract fun taskDao(): TaskDao
    abstract fun collabDao(): CollabDao
    abstract fun studySessionDao(): StudySessionDao

    companion object {
        const val DATABASE_NAME = "planner_database"
    }
}
