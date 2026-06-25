import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { Deal } from '@/lib/types';
import { verifyAuth, requireRoles } from '@/lib/auth';
import { AppError, formatError } from '@/lib/error';

const updateDealSchema = z.object({
  name: z.string().min(1).optional(),
  arr: z.number().positive().optional(),
  icp_fit: z.enum(['high', 'medium', 'low']).optional(),
  close_date: z.string().transform((val) => new Date(val)).optional(),
  champion_name: z.string().optional(),
  champion_title: z.string().optional(),
  stage: z.string().optional(),
  status: z.enum(['active', 'closed-won', 'closed-lost']).optional(),
  crm_id: z.string().optional(),
  owner_id: z.string().uuid().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request);

    const deals = await query<Deal>(
      `SELECT d.*, c.name as customer_name, c.arr as customer_arr
       FROM deals d
       JOIN customers c ON d.customer_id = c.id
       WHERE d.id = $1`,
      [params.id]
    );

    if (deals.length === 0) {
      throw new AppError(404, 'Deal not found');
    }

    // Get related feature gaps
    const gaps = await query(
      'SELECT * FROM feature_gaps WHERE deal_id = $1 ORDER BY created_at DESC',
      [params.id]
    );

    return NextResponse.json({
      deal: deals[0],
      feature_gaps: gaps,
    });
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
    requireRoles(user, ['admin', 'gtm']);

    const body = await request.json();
    const data = updateDealSchema.parse(body);

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

    const result = await query<Deal>(
      `UPDATE deals
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.length === 0) {
      throw new AppError(404, 'Deal not found');
    }

    return NextResponse.json({ deal: result[0] });
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

    const result = await query<Deal>(
      'DELETE FROM deals WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.length === 0) {
      throw new AppError(404, 'Deal not found');
    }

    return NextResponse.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}
