/**
 * Centralized Authentication & Session Management Layer
 * Task 28 — Step 4: Frontend Auth Session Manager
 */

import { apiClient } from './api/apiClient.js';
import { initialMockTeam } from '../data/mockTeam.js';

const USER_PROFILE_KEY = 'antigravity_user_profile';

class AuthSessionService {
  constructor() {
    this.currentUser = this.loadInitialUser();
    this.listeners = new Set();
  }

  loadInitialUser() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = apiClient.getAuthToken();
        const stored = window.localStorage.getItem(USER_PROFILE_KEY);
        if (token && stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            return {
              ...parsed,
              isAuthenticated: true,
            };
          }
        }
      }
    } catch (e) {
      // Fallback
    }

    return null;
  }

  saveUser(user) {
    this.currentUser = user;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(USER_PROFILE_KEY);
        }
      }
    } catch (e) {
      // ignore
    }
    this.notify();
  }

  async login(email, password) {
    try {
      const response = await apiClient.auth.login({ email, password });
      const { user, token } = response.data;

      apiClient.setAuthToken(token);
      const userProfile = {
        ...user,
        isAuthenticated: true,
      };

      this.saveUser(userProfile);
      return { success: true, user: userProfile };
    } catch (err) {
      // Fallback for offline demo mode
      const foundDemo = initialMockTeam.find(
        (m) => m.email.toLowerCase() === (email || '').toLowerCase().trim()
      );
      if (foundDemo) {
        const demoUser = {
          id: foundDemo.id,
          agencyId: 'agency-demo-001',
          email: foundDemo.email,
          name: foundDemo.name,
          role: foundDemo.roleType?.toUpperCase() || 'OPERATOR',
          permissions: ['*'],
          isAuthenticated: true,
        };
        this.saveUser(demoUser);
        return { success: true, user: demoUser, isDemoFallback: true };
      }
      throw err;
    }
  }

  async logout() {
    try {
      await apiClient.auth.logout().catch(() => {});
    } finally {
      apiClient.clearAuthToken();
      this.saveUser(null);
    }
  }

  async restoreSession() {
    const token = apiClient.getAuthToken();
    if (!token) {
      this.saveUser(null);
      return null;
    }

    try {
      const response = await apiClient.auth.me();
      const user = response.data?.user;
      if (user) {
        const userProfile = {
          ...user,
          isAuthenticated: true,
        };
        this.saveUser(userProfile);
        return userProfile;
      }
      return null;
    } catch (err) {
      // If unauthorized, clear invalid token
      if (err.status === 401 || err.code === 'AUTHENTICATION_ERROR') {
        apiClient.clearAuthToken();
        this.saveUser(null);
        return null;
      }
      return this.currentUser;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return Boolean(this.currentUser && this.currentUser.isAuthenticated);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentUser);
      } catch (e) {
        // ignore listener errors
      }
    }
  }
}

export const authSessionService = new AuthSessionService();
export default authSessionService;
