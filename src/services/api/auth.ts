/**
 * Authentication API service (Mock)
 */

import { delay, mockUsers } from '@/services/mock-data'
import type { User, ApiResponse } from '@/types'
import { USER_ROLES } from '@/lib/constants'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
  role?: typeof USER_ROLES[keyof typeof USER_ROLES]
}

// Mock token generator
const generateToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`
}

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(800) // Simulate network delay

    const user = mockUsers.find((u) => u.email === credentials.email)

    if (!user || credentials.password !== 'password') {
      throw new Error('Invalid email or password')
    }

    const token = generateToken(user.id)

    return {
      success: true,
      data: {
        user,
        token,
      },
      message: 'Login successful',
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1000)

    // Check if user exists
    if (mockUsers.some((u) => u.email === data.email)) {
      throw new Error('User with this email already exists')
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role || USER_ROLES.BUYER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    }

    mockUsers.push(newUser)

    const token = generateToken(newUser.id)

    return {
      success: true,
      data: {
        user: newUser,
        token,
      },
      message: 'Registration successful',
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    await delay(500)

    // Extract user ID from token (mock)
    const userId = token.split('_')[2]
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      throw new Error('User not found')
    }

    return {
      success: true,
      data: user,
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    await delay(300)

    return {
      success: true,
      data: null,
      message: 'Logged out successfully',
    }
  },
}

