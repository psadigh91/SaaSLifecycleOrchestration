import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { User, CreateUserRequest } from '@/lib/types';
import { hashPassword } from '@/lib/auth';
import { formatError } from '@/lib/error';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['admin', 'gtm', 'proserv', 'product', 'ux', 'engineering', 'cs', 'support']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body) as CreateUserRequest;

    // Hash password
    const password_hash = await hashPassword(data.password);

    // Insert user into database
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.email, password_hash, data.first_name, data.last_name, data.role]
    );

    const user = result[0];

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}
