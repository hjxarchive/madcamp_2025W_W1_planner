package com.madcampone.planner.di

import com.madcampone.planner.data.repository.CollabRepositoryImpl
import com.madcampone.planner.data.repository.ProjectRepositoryImpl
import com.madcampone.planner.data.repository.StudyRepositoryImpl
import com.madcampone.planner.data.repository.TaskRepositoryImpl
import com.madcampone.planner.domain.repository.CollabRepository
import com.madcampone.planner.domain.repository.ProjectRepository
import com.madcampone.planner.domain.repository.StudyRepository
import com.madcampone.planner.domain.repository.TaskRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindProjectRepository(
        projectRepositoryImpl: ProjectRepositoryImpl
    ): ProjectRepository

    @Binds
    @Singleton
    abstract fun bindTaskRepository(
        taskRepositoryImpl: TaskRepositoryImpl
    ): TaskRepository

    @Binds
    @Singleton
    abstract fun bindCollabRepository(
        collabRepositoryImpl: CollabRepositoryImpl
    ): CollabRepository

    @Binds
    @Singleton
    abstract fun bindStudyRepository(
        studyRepositoryImpl: StudyRepositoryImpl
    ): StudyRepository
}
