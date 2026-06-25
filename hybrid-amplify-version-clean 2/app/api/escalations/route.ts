import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { SupportEscalation, PaginatedResponse } from '@/lib/types';
import { verifyAuth, requireRoles } from '@/lib/auth';
import { calculateEscalationScore } from '@/lib/escalation-scoring';
import { formatError } from '@/lib/error';

const createSupportEscalationSchema = z.object({
  customer_id: z.string().uuid(),
  title: z.string().min(1).max(500),
  classification: z.enum(['bug', 'feature-gap', 'config-education']).optional(),
  severity: z.enum(['s1-critical', 's2-high', 's3-medium', 's4-low']).optional(),
  verbatim: z.string().min(1),
  description: z.string().optional(),
  repro_steps: z.string().optional(),
  workaround: z.string().optional(),
  workaround_quality: z.enum(['none', 'painful', 'easy']).optional(),
  workflow_criticality: z.enum(['primary', 'secondary', 'tertiary']).optional(),
  support_ticket_id: z.string().optional(),
  related_gap_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const classification = searchParams.get('classification');
    const severity = searchParams.get('severity');
    const min_score = parseFloat(searchParams.get('min_score') || '');

    let queryText = `
      SELECT se.*,
             c.name as customer_name,
             c.arr as customer_arr,
             u.first_name || ' ' || u.last_name as created_by_name
      FROM support_escalations se
      LEFT JOIN customers c ON se.customer_id = c.id
      LEFT JOIN users u ON se.created_by = u.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramCount = 1;

    if (classification) {
      queryText += ` AND se.classification = $${paramCount}`;
      queryParams.push(classification);
      paramCount++;
    }

    if (severity) {
      queryText += ` AND se.severity = $${paramCount}`;
      queryParams.push(severity);
      paramCount++;
    }

    if (!isNaN(min_score)) {
      queryText += ` AND se.score >= $${paramCount}`;
      queryParams.push(min_score);
      paramCount++;
    }

    queryText += ` ORDER BY se.score DESC NULLS LAST, se.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const escalations = await query<SupportEscalation>(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM support_escalations WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (classification) {
      countQuery += ` AND classification = $${countParamIndex}`;
      countParams.push(classification);
      countParamIndex++;
    }

    if (severity) {
      countQuery += ` AND severity = $${countParamIndex}`;
      countParams.push(severity);
      countParamIndex++;
    }

    if (!isNaN(min_score)) {
      countQuery += ` AND score >= $${countParamIndex}`;
      countParams.push(min_score);
    }

    const totalResult = await query<{ count: string }>(countQuery, countParams);
    const total = parseInt(totalResult[0].count);

    const response: PaginatedResponse<SupportEscalation> = {
      data: escalations,
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
    requireRoles(user, ['admin', 'support', 'cs']);

    const body = await request.json();
    const data = createSupportEscalationSchema.parse(body);

    // Calculate initial score
    const score = calculateEscalationScore({
      revenue_exposure: 0, // Will be enriched later from customer ARR
      account_count: 1,
      workflow_criticality: data.workflow_criticality,
      workaround_quality: data.workaround_quality,
      recency_velocity: 1,
    });

    const result = await query<SupportEscalation>(
      `INSERT INTO support_escalations (
        customer_id, title, classification, severity, verbatim,
        description, repro_steps, workaround, workaround_quality,
        score, account_count, workflow_criticality, recency_velocity,
        support_ticket_id, related_gap_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        data.customer_id,
        data.title,
        data.classification,
        data.severity,
        data.verbatim,
        data.description,
        data.repro_steps,
        data.workaround,
        data.workaround_quality,
        score,
        1, // account_count
        data.workflow_criticality,
        1, // recency_velocity
        data.support_ticket_id,
        data.related_gap_id,
        user.id,
      ]
    );

    return NextResponse.json(
      { escalation: result[0] },
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
