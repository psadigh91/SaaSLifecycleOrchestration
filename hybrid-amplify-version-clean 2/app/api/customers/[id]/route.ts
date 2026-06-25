import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { Customer } from '@/lib/types';
import { verifyAuth, requireRoles } from '@/lib/auth';
import { AppError, formatError } from '@/lib/error';

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  arr: z.number().optional(),
  icp_fit: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['prospect', 'active', 'churned', 'paused']).optional(),
  primary_contact_name: z.string().optional(),
  primary_contact_email: z.string().email().optional(),
  primary_contact_title: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request);

    const customers = await query<Customer>(
      'SELECT * FROM customers WHERE id = $1',
      [params.id]
    );

    if (customers.length === 0) {
      throw new AppError(404, 'Customer not found');
    }

    return NextResponse.json({ customer: customers[0] });
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    requireRoles(user, ['admin', 'gtm', 'cs']);

    const body = await request.json();
    const data = updateCustomerSchema.parse(body);

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      throw new AppError(400, 'No fields to update');
    }

    values.push(params.id);

    const result = await query<Customer>(
      `UPDATE customers
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.length === 0) {
      throw new AppError(404, 'Customer not found');
    }

    return NextResponse.json({ customer: result[0] });
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    requireRoles(user, ['admin']);

    const result = await query<Customer>(
      `UPDATE customers
       SET status = 'churned', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [params.id]
    );

    if (result.length === 0) {
      throw new AppError(404, 'Customer not found');
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}
