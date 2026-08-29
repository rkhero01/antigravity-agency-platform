/**
 * Authentication Service
 * Task 28 — Step 1: User Login, Token Issuance & Profile Management
 */

import { userRepository } from '../repositories/userRepository.js';
import { verifyPassword } from '../auth/passwordUtils.js';
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
}

export const authService = new AuthService();
export default authService;
