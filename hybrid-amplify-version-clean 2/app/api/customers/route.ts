import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { Customer, PaginatedResponse } from '@/lib/types';
import { verifyAuth, requireRoles } from '@/lib/auth';
import { formatError } from '@/lib/error';

const createCustomerSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  arr: z.number().optional(),
  icp_fit: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['prospect', 'active', 'churned', 'paused']).default('prospect'),
  primary_contact_name: z.string().optional(),
  primary_contact_email: z.string().email().optional(),
  primary_contact_title: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const customers = await query<Customer>(
      `SELECT * FROM customers
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalResult = await query<{ count: string }>(
      'SELECT COUNT(*) FROM customers'
    );
    const total = parseInt(totalResult[0].count);

    const response: PaginatedResponse<Customer> = {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    requireRoles(user, ['admin', 'gtm', 'cs']);

    const body = await request.json();
    const data = createCustomerSchema.parse(body);

    const result = await query<Customer>(
      `INSERT INTO customers (
        name, domain, industry, company_size, arr, icp_fit,
        status, primary_contact_name, primary_contact_email, primary_contact_title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.name,
        data.domain,
        data.industry,
        data.company_size,
        data.arr,
        data.icp_fit,
        data.status,
        data.primary_contact_name,
        data.primary_contact_email,
        data.primary_contact_title,
      ]
    );

    return NextResponse.json(
      { customer: result[0] },
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
