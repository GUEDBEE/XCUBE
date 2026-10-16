import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Plus, 
  Check, 
  ShieldAlert, 
  ShieldCheck,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { MatchItem } from '../types/index.ts';
import { getConfidenceBadge } from '../utils/predictionMath.ts';

interface MatchCardProps {
  match: MatchItem;
  onOpenAnalysis: (match: MatchItem) => void;
  onAddToSlip: (match: MatchItem, selection: string, odds: number) => void;
  isSelectionInSlip: (matchId: string, selection: string) => boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onOpenAnalysis,
  onAddToSlip,
  isSelectionInSlip,
}) => {
  const badge = getConfidenceBadge(match.aiPrediction.confidence);

  return (
    <div className="bg-[#0b141e] border border-emerald-950/70 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between gap-4">
      {/* Top Header: Competition & Live/Time */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#122232] text-emerald-400 font-mono font-medium border border-emerald-900/40">
            {match.competition}
          </span>
          {match.isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/80 text-red-400 font-bold border border-red-800/40">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              LIVE {match.liveTime}
            </span>
          ) : (
            <span className="text-zinc-400 font-mono text-[11px]">{match.startTime}</span>
          )}
        </div>

        {/* Confidence Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
          style={{
            backgroundColor: `${badge.color}15`,
            borderColor: `${badge.color}40`,
            color: badge.color,
          }}
        >
          <Sparkles className="w-3 h-3" />
          <span>{match.aiPrediction.confidence}% IA</span>
        </div>
      </div>

      {/* Main Teams Matchup */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {match.homeTeam}
            </h3>
            {match.isLive && (
              <span className="text-lg font-mono font-black text-emerald-400">
                {match.liveScore?.split('-')[0]?.trim()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <h3 className="text-base sm:text-lg font-bold text-zinc-300 tracking-wide">
              {match.awayTeam}
            </h3>
            {match.isLive && (
              <span className="text-lg font-mono font-black text-emerald-400">
                {match.liveScore?.split('-')[1]?.trim()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Odds Selection Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Home Win */}
        <button
          type="button"
          onClick={() => onAddToSlip(match, `Victoire ${match.homeTeam}`, match.odds.home)}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
            isSelectionInSlip(match.id, `Victoire ${match.homeTeam}`)
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'bg-[#101e2c] border-emerald-950/60 hover:border-emerald-600/50 text-zinc-300'
          }`}
        >
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">1 (Dom.)</span>
          <span className="font-mono text-sm font-bold text-white">{match.odds.home.toFixed(2)}</span>
        </button>

        {/* Draw (if soccer) */}
        {match.odds.draw ? (
          <button
            type="button"
            onClick={() => onAddToSlip(match, 'Match Nul', match.odds.draw!)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
              isSelectionInSlip(match.id, 'Match Nul')
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-[#101e2c] border-emerald-950/60 hover:border-emerald-600/50 text-zinc-300'
            }`}
          >
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">N (Nul)</span>
            <span className="font-mono text-sm font-bold text-white">{match.odds.draw.toFixed(2)}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#091119] border border-zinc-900 text-zinc-600 text-[11px] font-mono">
            H2H
          </div>
        )}

        {/* Away Win */}
        <button
          type="button"
          onClick={() => onAddToSlip(match, `Victoire ${match.awayTeam}`, match.odds.away)}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
            isSelectionInSlip(match.id, `Victoire ${match.awayTeam}`)
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'bg-[#101e2c] border-emerald-950/60 hover:border-emerald-600/50 text-zinc-300'
          }`}
        >
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">2 (Ext.)</span>
          <span className="font-mono text-sm font-bold text-white">{match.odds.away.toFixed(2)}</span>
        </button>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-[#0e1e2d] border border-emerald-500/30 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>PRONOSTIC OFFICIEL COBRA</span>
          </div>

          {match.aiPrediction.isValueBet && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
              <Flame className="w-3 h-3 text-amber-400" />
              VALUE +{match.aiPrediction.edge}%
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-zinc-100">
            {match.aiPrediction.recommendedBet}
          </span>
          <button
            type="button"
            onClick={() => onAddToSlip(match, match.aiPrediction.recommendedBet, match.aiPrediction.targetOdds)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs shrink-0 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{match.aiPrediction.targetOdds.toFixed(2)}</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400 line-clamp-2">
          {match.aiPrediction.tacticalSummary}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-zinc-400 flex items-center gap-1">
          <span className="text-zinc-500">Risque :</span>
          <span className={`font-semibold ${
            match.aiPrediction.riskLevel === 'FAIBLE' ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {match.aiPrediction.riskLevel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenAnalysis(match)}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold group cursor-pointer"
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Analyse Détaillée IA</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
