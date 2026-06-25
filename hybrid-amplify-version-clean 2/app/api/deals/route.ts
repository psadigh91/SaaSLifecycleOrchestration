import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { Deal, PaginatedResponse } from '@/lib/types';
import { verifyAuth, requireRoles } from '@/lib/auth';
import { formatError } from '@/lib/error';

const createDealSchema = z.object({
  customer_id: z.string().uuid(),
  name: z.string().min(1),
  arr: z.number().positive(),
  icp_fit: z.enum(['high', 'medium', 'low']),
  close_date: z.string().transform((val) => new Date(val)).optional(),
  champion_name: z.string().optional(),
  champion_title: z.string().optional(),
  stage: z.string(),
  status: z.enum(['active', 'closed-won', 'closed-lost']).default('active'),
  crm_id: z.string().optional(),
  owner_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');

    let queryText = `
      SELECT d.*, c.name as customer_name
      FROM deals d
      JOIN customers c ON d.customer_id = c.id
    `;
    const queryParams: any[] = [limit, offset];
    let paramCount = 3;

    if (status) {
      queryText += ` WHERE d.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    queryText += ` ORDER BY d.created_at DESC LIMIT $1 OFFSET $2`;

    const deals = await query<Deal>(queryText, queryParams);

    const countQuery = status
      ? 'SELECT COUNT(*) FROM deals WHERE status = $1'
      : 'SELECT COUNT(*) FROM deals';
    const countParams = status ? [status] : [];
    const totalResult = await query<{ count: string }>(countQuery, countParams);
    const total = parseInt(totalResult[0].count);

    const response: PaginatedResponse<Deal> = {
      data: deals,
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
    requireRoles(user, ['admin', 'gtm']);

    const body = await request.json();
    const data = createDealSchema.parse(body);

    const result = await query<Deal>(
      `INSERT INTO deals (
        customer_id, name, arr, icp_fit, close_date, champion_name,
        champion_title, stage, status, crm_id, owner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.customer_id,
        data.name,
        data.arr,
        data.icp_fit,
        data.close_date,
        data.champion_name,
        data.champion_title,
        data.stage,
        data.status,
        data.crm_id,
        data.owner_id,
      ]
    );

    return NextResponse.json(
      { deal: result[0] },
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
