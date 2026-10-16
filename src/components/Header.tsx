import React from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Wallet, 
  Receipt, 
  Bot, 
  Trophy, 
  Mic, 
  Sparkles,
  Layers,
  BarChart3
} from 'lucide-react';
import { UserSubscriberProfile } from '../types/index.ts';
import { formatCurrency } from '../utils/predictionMath.ts';

interface HeaderProps {
  currentTab: 'matches' | 'agents' | 'dashboard' | 'posters';
  onSelectTab: (tab: 'matches' | 'agents' | 'dashboard' | 'posters') => void;
  userProfile: UserSubscriberProfile;
  betSlipCount: number;
  onOpenBetSlip: () => void;
  onOpenVoiceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  betSlipCount,
  onOpenBetSlip,
  onOpenVoiceModal,
}) => {
  const tierColor =
    userProfile.vipTier === 'black_elite'
      ? 'from-amber-400 to-yellow-600 text-black font-extrabold'
      : userProfile.vipTier === 'vip'
      ? 'from-emerald-400 to-teal-500 text-black font-bold'
      : 'from-zinc-400 to-zinc-600 text-white font-medium';

  const tierLabel =
    userProfile.vipTier === 'black_elite'
      ? 'COBRA BLACK ÉLITE'
      : userProfile.vipTier === 'vip'
      ? 'COBRA VIP'
      : 'MEMBRE BRONZE';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070d14]/95 backdrop-blur border-b border-emerald-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('matches')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-900 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            {/* Styled Cobra Icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-black fill-current">
              <path d="M12 2C7.58 2 4 5.58 4 10c0 2.5 1.15 4.74 2.94 6.22l-.94 3.78 4-2c.64.13 1.31.2 2 .2 4.42 0 8-3.58 8-8s-3.58-8-8-8zm-1.5 5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm4 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-mono text-lg sm:text-xl font-black tracking-wider text-white">
                GUED<span className="text-emerald-400">-COBRA</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                IA v4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
              Pronostics & Intelligence Prédictive Sportive
            </p>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0b1622] p-1 rounded-xl border border-emerald-900/40 text-xs">
          <button
            type="button"
            onClick={() => onSelectTab('matches')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              currentTab === 'matches'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-[#122334]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Pronostics & Matchs</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('agents')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              currentTab === 'agents'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-[#122334]'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Agents IA Temps Réel</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-[#122334]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tableau de Bord VIP</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('posters')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              currentTab === 'posters'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-[#122334]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Studio Affiches IA</span>
          </button>
        </nav>

        {/* Right Section: Voice Action, Bankroll, VIP Tier & Bet Slip */}
        <div className="flex items-center gap-3">
          {/* Audio Voice Input Trigger */}
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1d2c] hover:bg-[#152a40] border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
            title="Poser une question vocale aux agents IA"
            aria-label="Question vocale"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">IA Vocale</span>
          </button>

          {/* User Bankroll Indicator */}
          <div 
            onClick={() => onSelectTab('dashboard')} 
            className="hidden lg:flex items-center gap-2 bg-[#0b1622] px-3 py-1.5 rounded-lg border border-emerald-900/40 text-xs cursor-pointer hover:border-emerald-500/40 transition-colors"
            title="Bankroll actuelle"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-zinc-400 leading-none">Bankroll VIP</div>
              <div className="font-mono font-bold text-emerald-400 leading-tight">
                {formatCurrency(userProfile.bankroll)}
              </div>
            </div>
          </div>

          {/* VIP Badge */}
          <div 
            onClick={() => onSelectTab('dashboard')} 
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-gradient-to-r ${tierColor} cursor-pointer shadow-sm`}
          >
            <Crown className="w-3 h-3" />
            <span>{tierLabel}</span>
          </div>

          {/* Bet Slip Cart Button */}
          <button
            type="button"
            onClick={onOpenBetSlip}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold rounded-lg shadow-lg shadow-emerald-500/20 text-xs transition-all cursor-pointer"
            aria-label="Ouvrir le panier de paris"
          >
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Panier Cobra</span>
            {betSlipCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-emerald-400 text-xs font-bold flex items-center justify-center">
                {betSlipCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around bg-[#050c12] border-t border-emerald-950/60 py-2 px-2 text-[11px]">
        <button
          type="button"
          onClick={() => onSelectTab('matches')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'matches' ? 'text-emerald-400' : 'text-zinc-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Matchs</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('agents')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'agents' ? 'text-emerald-400' : 'text-zinc-400'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Agents IA</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'dashboard' ? 'text-emerald-400' : 'text-zinc-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>VIP & Bankroll</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('posters')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'posters' ? 'text-emerald-400' : 'text-zinc-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Affiches</span>
        </button>
      </div>
    </header>
  );
};
