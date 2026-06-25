import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { SupportEscalation } from '@/lib/types';
import { verifyAuth, requireRoles } from '@/lib/auth';
import { calculateEscalationScore } from '@/lib/escalation-scoring';
import { AppError, formatError } from '@/lib/error';

const calculateScoreSchema = z.object({
  revenue_exposure: z.number().optional(),
  account_count: z.number().optional(),
  workflow_criticality: z.enum(['primary', 'secondary', 'tertiary']).optional(),
  workaround_quality: z.enum(['none', 'painful', 'easy']).optional(),
  recency_velocity: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    requireRoles(user, ['admin', 'product']);

    const body = await request.json();
    const data = calculateScoreSchema.parse(body);

    // Get current escalation
    const current = await query<SupportEscalation>(
      'SELECT * FROM support_escalations WHERE id = $1',
      [params.id]
    );

    if (current.length === 0) {
      throw new AppError(404, 'Support escalation not found');
    }

    const escalation = current[0];

    // Calculate new score
    const newScore = calculateEscalationScore({
      revenue_exposure: data.revenue_exposure ?? escalation.revenue_exposure,
      account_count: data.account_count ?? escalation.account_count,
      workflow_criticality: data.workflow_criticality ?? escalation.workflow_criticality,
      workaround_quality: data.workaround_quality ?? escalation.workaround_quality,
      recency_velocity: data.recency_velocity ?? escalation.recency_velocity,
    });

    // Update score and related fields
    const result = await query<SupportEscalation>(
      `UPDATE support_escalations
       SET score = $1,
           revenue_exposure = $2,
           account_count = $3,
           workflow_criticality = $4,
           workaround_quality = $5,
           recency_velocity = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        newScore,
        data.revenue_exposure ?? escalation.revenue_exposure,
        data.account_count ?? escalation.account_count,
        data.workflow_criticality ?? escalation.workflow_criticality,
        data.workaround_quality ?? escalation.workaround_quality,
        data.recency_velocity ?? escalation.recency_velocity,
        params.id,
      ]
    );

    return NextResponse.json({
      escalation: result[0],
      previous_score: escalation.score,
      new_score: newScore,
    });
  } catch (error) {
    const { error: message, statusCode, details } = formatError(error);
    return NextResponse.json(
      { error: message, details },
      { status: statusCode }
    );
  }
}
