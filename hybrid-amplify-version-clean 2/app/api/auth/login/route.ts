import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { User, LoginResponse } from '@/lib/types';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { AppError, formatError } from '@/lib/error';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Find user by email
    const users = await query<User>(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [data.email]
    );

    if (users.length === 0) {
      throw new AppError(401, 'Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const token = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      token,
      refreshToken,
      user: userWithoutPassword,
    };

    // Set cookie for browser clients
    const res = NextResponse.json(response);
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    return res;
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}
