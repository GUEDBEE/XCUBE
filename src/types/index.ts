export type SportCategory = 'all' | 'football' | 'basketball' | 'tennis' | 'mma' | 'esport' | 'f1';

export type VipTier = 'bronze' | 'vip' | 'black_elite';

export interface MatchItem {
  id: string;
  sport: SportCategory;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  isLive?: boolean;
  liveTime?: string;
  liveScore?: string;
  odds: {
    home: number;
    draw?: number;
    away: number;
  };
  aiPrediction: {
    recommendedBet: string;
    targetOdds: number;
    confidence: number; // 0 - 100
    aiProbability: number; // 0 - 100
    isValueBet: boolean;
    edge: number; // %
    riskLevel: 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ';
    keyStats: string[];
    tacticalSummary: string;
  };
}

export interface BetSelection {
  matchId: string;
  matchTitle: string;
  competition: string;
  sport: SportCategory;
  selection: string;
  odds: number;
  aiConfidence: number;
  stake: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinkingUsed?: boolean;
}

export interface UserSubscriberProfile {
  name: string;
  vipTier: VipTier;
  memberSince: string;
  bankroll: number;
  startingBankroll: number;
  monthlyProfit: number;
  totalBets: number;
  wonBets: number;
  winStreak: number;
  roiPercentage: number;
}
