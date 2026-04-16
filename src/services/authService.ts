// authService.ts - JWT-based authentication service
import { useStore } from '../store/useStore';

// Get token from localStorage
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

// Save token to localStorage
export const saveToken = (token: string): void => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

// Remove token from localStorage
export const removeToken = (): void => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

// API base URL
const API_BASE_URL = '/api';

// Register user
export const register = async (email: string, password: string, name: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  // Save access token
  if (data.accessToken) {
    saveToken(data.accessToken);
  }

  return data;
};

// Login user
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // Save access token
  if (data.accessToken) {
    saveToken(data.accessToken);
  }

  return data;
};

// Logout user
export const logout = async () => {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }

  // Remove tokens from localStorage
  removeToken();
  localStorage.removeItem('refreshToken');
};

// Refresh token
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Token refresh failed');
  }

  // Save new access token
  if (data.accessToken) {
    saveToken(data.accessToken);
  }

  // Save new refresh token if provided
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  return data;
};

// Get current user
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user');
  }

  return data.user;
};

// Update user profile
export const updateUserProfile = async (profileData: any) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  return data;
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to change password');
  }

  return data;
};

// Forgot password
export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send reset link');
  }

  return data;
};

// Reset password
export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to reset password');
  }

  return data;
};