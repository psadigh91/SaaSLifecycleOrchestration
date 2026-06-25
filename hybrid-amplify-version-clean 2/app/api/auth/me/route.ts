import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { formatError } from '@/lib/error';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    return NextResponse.json({ user });
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}
