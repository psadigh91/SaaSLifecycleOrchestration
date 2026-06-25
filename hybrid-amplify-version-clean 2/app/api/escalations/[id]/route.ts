import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { SupportEscalation } from '@/lib/types';
import { verifyAuth, requireRoles } from '@/lib/auth';
import { AppError, formatError } from '@/lib/error';

const updateSupportEscalationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  classification: z.enum(['bug', 'feature-gap', 'config-education']).optional(),
  severity: z.enum(['s1-critical', 's2-high', 's3-medium', 's4-low']).optional(),
  verbatim: z.string().min(1).optional(),
  description: z.string().optional(),
  repro_steps: z.string().optional(),
  workaround: z.string().optional(),
  workaround_quality: z.enum(['none', 'painful', 'easy']).optional(),
  workflow_criticality: z.enum(['primary', 'secondary', 'tertiary']).optional(),
  support_ticket_id: z.string().optional(),
  related_gap_id: z.string().uuid().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request);

    const escalations = await query<SupportEscalation>(
      `SELECT se.*,
              c.name as customer_name,
              c.arr as customer_arr,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM support_escalations se
       LEFT JOIN customers c ON se.customer_id = c.id
       LEFT JOIN users u ON se.created_by = u.id
       WHERE se.id = $1`,
      [params.id]
    );

    if (escalations.length === 0) {
      throw new AppError(404, 'Support escalation not found');
    }

    return NextResponse.json({ escalation: escalations[0] });
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
    requireRoles(user, ['admin', 'support', 'cs', 'product']);

    const body = await request.json();
    const data = updateSupportEscalationSchema.parse(body);

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

    const result = await query<SupportEscalation>(
      `UPDATE support_escalations
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.length === 0) {
      throw new AppError(404, 'Support escalation not found');
    }

    return NextResponse.json({ escalation: result[0] });
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

    const result = await query<SupportEscalation>(
      'DELETE FROM support_escalations WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.length === 0) {
      throw new AppError(404, 'Support escalation not found');
    }

    return NextResponse.json({ message: 'Support escalation deleted successfully' });
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}
