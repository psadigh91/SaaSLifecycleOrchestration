import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { User } from '@/lib/types';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import { AppError, formatError } from '@/lib/error';

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshSchema.parse(body);

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const users = await query<User>(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [payload.userId]
    );

    if (users.length === 0) {
      throw new AppError(401, 'User not found or inactive');
    }

    // Generate new access token
    const token = generateAccessToken(payload.userId);

    // Set cookie for browser clients
    const res = NextResponse.json({ token });
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
