import React from 'react';
import { TrendingUp, Flame, Radio } from 'lucide-react';
import { MatchItem } from '../types/index.ts';

interface LiveOddsTickerProps {
  matches: MatchItem[];
  onSelectMatch: (match: MatchItem) => void;
}

export const LiveOddsTicker: React.FC<LiveOddsTickerProps> = ({ matches, onSelectMatch }) => {
  return (
    <div className="w-full bg-[#050b10] border-y border-emerald-950/80 py-2.5 overflow-hidden select-none">
      <div className="flex items-center gap-6 animate-pulse">
        <div className="flex items-center gap-2 pl-4 text-emerald-400 font-mono text-xs font-bold shrink-0">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>COBRA LIVE FEED :</span>
        </div>

        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-xs">
          {matches.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMatch(m)}
              className="flex items-center gap-2.5 px-3 py-1 rounded bg-[#0b1520] hover:bg-[#122232] border border-emerald-900/40 text-left transition-colors cursor-pointer shrink-0"
            >
              {m.isLive ? (
                <span className="flex items-center gap-1 text-[10px] bg-red-950/80 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  LIVE {m.liveTime} ({m.liveScore})
                </span>
              ) : (
                <span className="text-[10px] text-zinc-500 font-mono">{m.startTime}</span>
              )}
              <span className="font-semibold text-zinc-200">
                {m.homeTeam} <span className="text-zinc-500">vs</span> {m.awayTeam}
              </span>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                Cote {m.odds.home}
              </span>
              {m.aiPrediction.isValueBet && (
                <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold bg-amber-950/50 px-1.5 py-0.5 rounded">
                  <Flame className="w-3 h-3 text-amber-400" />
                  +{m.aiPrediction.edge}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
