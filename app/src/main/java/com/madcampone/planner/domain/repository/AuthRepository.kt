package com.madcampone.planner.domain.repository

import com.madcampone.planner.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    val currentUser: Flow<User?>
    val isLoggedIn: Flow<Boolean>
    suspend fun signIn(email: String, password: String): Result<User>
    suspend fun signUp(email: String, password: String, displayName: String): Result<User>
    suspend fun signOut()
    suspend fun updateProfile(displayName: String?, photoUrl: String?): Result<User>
    suspend fun deleteAccount(): Result<Unit>
}
