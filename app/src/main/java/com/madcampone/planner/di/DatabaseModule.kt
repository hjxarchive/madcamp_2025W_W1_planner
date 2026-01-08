package com.madcampone.planner.di

import android.content.Context
import androidx.room.Room
import com.madcampone.planner.data.local.PlannerDatabase
import com.madcampone.planner.data.local.dao.CollabDao
import com.madcampone.planner.data.local.dao.ProjectDao
import com.madcampone.planner.data.local.dao.StudySessionDao
import com.madcampone.planner.data.local.dao.TaskDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun providePlannerDatabase(
        @ApplicationContext context: Context
    ): PlannerDatabase {
        return Room.databaseBuilder(
            context,
            PlannerDatabase::class.java,
            PlannerDatabase.DATABASE_NAME
        ).build()
    }

    @Provides
    @Singleton
    fun provideProjectDao(database: PlannerDatabase): ProjectDao {
        return database.projectDao()
    }

    @Provides
    @Singleton
    fun provideTaskDao(database: PlannerDatabase): TaskDao {
        return database.taskDao()
    }

    @Provides
    @Singleton
    fun provideCollabDao(database: PlannerDatabase): CollabDao {
        return database.collabDao()
    }

    @Provides
    @Singleton
    fun provideStudySessionDao(database: PlannerDatabase): StudySessionDao {
        return database.studySessionDao()
    }
}
