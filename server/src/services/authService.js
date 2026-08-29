/**
 * Authentication Service
 * Task 28 — Step 1: User Login, Token Issuance & Profile Management
 */

import { userRepository } from '../repositories/userRepository.js';
import { verifyPassword, hashPassword } from '../auth/passwordUtils.js';
import { generateToken } from '../auth/tokenUtils.js';
import { AuthenticationError, NotFoundError } from '../utils/errors.js';
import { ROLE_PERMISSIONS } from '../middleware/auth.js';

export class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw new AuthenticationError('Email and password are required');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('Account is inactive or suspended');
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    const token = generateToken({
      userId: user.id,
      agencyId: user.agencyId,
      email: user.email,
      role: user.role,
      permissions,
    });

    const userProfile = {
      id: user.id,
      agencyId: user.agencyId,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    };

    return {
      user: userProfile,
      token,
      expiresIn: 86400,
    };
  }

  async getCurrentUser(userId, agencyId) {
    const user = await userRepository.findById(userId, agencyId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const { passwordHash, ...safeUser } = user;
    safeUser.permissions = ROLE_PERMISSIONS[user.role] || [];
    return safeUser;
  }

  async updateProfile(userId, agencyId, updates = {}) {
    const user = await userRepository.findById(userId, agencyId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const safeUpdates = {};
    if (updates.name !== undefined) {
      const trimmed = String(updates.name).trim();
      if (trimmed.length < 2) {
        throw new AuthenticationError('Full name must be at least 2 characters.');
      }
      safeUpdates.name = trimmed;
    }

    const updated = await userRepository.update(userId, safeUpdates, agencyId);
    const { passwordHash, ...safeUser } = updated;
    safeUser.permissions = ROLE_PERMISSIONS[updated.role] || [];
    return safeUser;
  }

  async changePassword(userId, agencyId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new AuthenticationError('Current password and new password are required');
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new AuthenticationError('New password must be at least 8 characters long');
    }

    const user = await userRepository.findById(userId, agencyId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const isMatch = verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const newPasswordHash = hashPassword(newPassword);
    await userRepository.update(userId, { passwordHash: newPasswordHash }, agencyId);

    return { message: 'Password changed successfully' };
  }
}

export const authService = new AuthService();
export default authService;
