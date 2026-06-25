/**
 * Calculate escalation score based on 5 dimensions
 * Score ranges from 0-100
 */
export function calculateEscalationScore(data: {
  revenue_exposure?: number;
  account_count?: number;
  workflow_criticality?: string;
  workaround_quality?: string;
  recency_velocity?: number;
}): number {
  // Revenue Exposure (30% weight, 0-30 points)
  const revenueScore = Math.min(30, (data.revenue_exposure || 0) / 50000);

  // Account Breadth (25% weight, 0-25 points)
  const accountScore = Math.min(25, (data.account_count || 1) * 3);

  // Workflow Criticality (20% weight, 0-20 points)
  const criticalityMap: Record<string, number> = {
    primary: 20,
    secondary: 10,
    tertiary: 5,
  };
  const criticalityScore = criticalityMap[data.workflow_criticality || 'tertiary'] || 5;

  // Workaround Quality (15% weight, 0-15 points, inverse)
  const workaroundMap: Record<string, number> = {
    none: 15,
    painful: 10,
    easy: 3,
  };
  const workaroundScore = workaroundMap[data.workaround_quality || 'none'] || 15;

  // Recency Velocity (10% weight, 0-10 points)
  const velocityScore = Math.min(10, (data.recency_velocity || 1) / 3);

  const totalScore = revenueScore + accountScore + criticalityScore + workaroundScore + velocityScore;
  return Math.round(totalScore * 100) / 100; // Round to 2 decimals
}
