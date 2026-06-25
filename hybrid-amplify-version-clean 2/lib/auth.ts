import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { query } from './db';
import { User } from './types';
import { AppError } from './error';

const SALT_ROUNDS = 10;

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token expired');
    }
    throw error;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Refresh token expired');
    }
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
  const users = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND is_active = true',
    [userId]
  );

  if (users.length === 0) {
    return null;
  }

  const { password_hash, ...userWithoutPassword } = users[0];
  return userWithoutPassword;
}

/**
 * Verify authentication from request
 * Extracts token from Authorization header or cookies
 */
export async function verifyAuth(request: NextRequest): Promise<Omit<User, 'password_hash'>> {
  // Try to get token from Authorization header
  let token = request.headers.get('authorization');

  if (token && token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  // If not in header, try cookies
  if (!token) {
    const cookieStore = cookies();
    token = cookieStore.get('auth-token')?.value || null;
  }

  if (!token) {
    throw new AppError(401, 'No authentication token provided');
  }

  // Verify token
  const payload = verifyAccessToken(token);

  // Get user
  const user = await getUserById(payload.userId);

  if (!user) {
    throw new AppError(401, 'User not found or inactive');
  }

  return user;
}

/**
 * Check if user has one of the allowed roles
 */
export function hasRole(user: Omit<User, 'password_hash'>, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Require specific roles for authorization
 */
export function requireRoles(user: Omit<User, 'password_hash'>, allowedRoles: string[]): void {
  if (!hasRole(user, allowedRoles)) {
    throw new AppError(403, 'Insufficient permissions');
  }
}
