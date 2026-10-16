/**
 * Pure mathematical and statistical calculation engine for GUED-COBRA
 * Decoupled from React UI for deterministic testing and validation.
 */

export interface MatchOdds {
  home: number;
  draw?: number;
  away: number;
}

export interface ValueBetAnalysis {
  impliedProbability: number;
  aiProbability: number;
  edgePercentage: number;
  isValue: boolean;
  recommendedKellyStake: number; // Percentage of bankroll (0-100)
}

/**
 * Calculates implied probability from decimal odds (e.g. 2.00 -> 50%)
 */
export function calculateImpliedProbability(decimalOdds: number): number {
  if (decimalOdds <= 1) return 100;
  return Number(((1 / decimalOdds) * 100).toFixed(2));
}

/**
 * Evaluates whether a bet holds statistical value (Positive Expected Value +EV)
 * Edge = (AI Probability * Odds) - 1
 */
export function evaluateValueBet(
  decimalOdds: number,
  aiProbabilityPercent: number,
  bankroll: number = 1000,
  fractionalKelly: number = 0.25 // Quarter-Kelly for conservative sports bankroll risk
): ValueBetAnalysis {
  const implied = calculateImpliedProbability(decimalOdds);
  const aiProbDecimal = Math.max(0, Math.min(100, aiProbabilityPercent)) / 100;
  const edge = (aiProbDecimal * decimalOdds - 1) * 100;
  const isValue = edge > 2.5; // Minimum 2.5% edge threshold for certified Cobra Value Bet

  // Kelly Criterion formula: f* = (b * p - q) / b
  // where b = odds - 1, p = win probability, q = 1 - p
  const b = decimalOdds - 1;
  const p = aiProbDecimal;
  const q = 1 - p;
  
  let rawKelly = b > 0 ? (b * p - q) / b : 0;
  rawKelly = Math.max(0, rawKelly); // Never negative stake
  
  // Apply fractional Kelly for safe bankroll longevity and cap at 5% max single bet
  const kellyStakePercent = Math.min(5.0, Number((rawKelly * fractionalKelly * 100).toFixed(2)));

  return {
    impliedProbability: implied,
    aiProbability: aiProbabilityPercent,
    edgePercentage: Number(edge.toFixed(2)),
    isValue,
    recommendedKellyStake: isValue ? kellyStakePercent : 0,
  };
}

/**
 * Calculates Parlay / Combined odds and theoretical win
 */
export function calculateParlayOdds(oddsList: number[]): {
  totalOdds: number;
  estimatedMargin: number;
} {
  if (!oddsList || oddsList.length === 0) {
    return { totalOdds: 1.0, estimatedMargin: 0 };
  }
  const total = oddsList.reduce((acc, curr) => acc * Math.max(1, curr), 1);
  return {
    totalOdds: Number(total.toFixed(2)),
    estimatedMargin: Number((oddsList.length * 4.5).toFixed(1)), // Standard bookmaker vigorish margin
  };
}

/**
 * Formats currency in Euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates Return on Investment (ROI)
 */
export function calculateROI(profit: number, totalStaked: number): number {
  if (totalStaked <= 0) return 0;
  return Number(((profit / totalStaked) * 100).toFixed(2));
}

/**
 * Determines Cobra Confidence Badge tier
 */
export function getConfidenceBadge(confidencePercent: number): {
  label: string;
  tier: 'elite' | 'high' | 'medium' | 'speculative';
  color: string;
} {
  if (confidencePercent >= 85) {
    return { label: 'COBRA ÉLITE (85%+)', tier: 'elite', color: '#10b981' };
  }
  if (confidencePercent >= 75) {
    return { label: 'FORTE CONFIANCE', tier: 'high', color: '#00ff87' };
  }
  if (confidencePercent >= 60) {
    return { label: 'VALUE MOYENNE', tier: 'medium', color: '#eab308' };
  }
  return { label: 'SPÉCULATIF / FUN', tier: 'speculative', color: '#f97316' };
}
