import React, { useState } from 'react';
import { 
  Crown, 
  Wallet, 
  TrendingUp, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  Sliders, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Zap,
  BarChart3,
  Layers,
  Percent
} from 'lucide-react';
import { UserSubscriberProfile, VipTier } from '../types/index.ts';
import { formatCurrency, evaluateValueBet } from '../utils/predictionMath.ts';

interface SubscriberDashboardProps {
  userProfile: UserSubscriberProfile;
  onUpdateTier: (tier: VipTier) => void;
  onUpdateBankroll: (newBankroll: number) => void;
}

export const SubscriberDashboard: React.FC<SubscriberDashboardProps> = ({
  userProfile,
  onUpdateTier,
  onUpdateBankroll,
}) => {
  const [activeHistoryFilter, setActiveHistoryFilter] = useState<'all' | 'won' | 'pending' | 'value'>('all');
  const [simOdds, setSimOdds] = useState<number>(2.10);
  const [simConfidence, setSimConfidence] = useState<number>(65);

  const simAnalysis = evaluateValueBet(simOdds, simConfidence, userProfile.bankroll);

  // Mock historical bets with realistic data
  const betHistory = [
    {
      id: 'h-1',
      match: 'Bayern Munich vs Arsenal',
      competition: 'Ligue des Champions',
      selection: 'Plus de 2.5 Buts',
      odds: 1.85,
      stake: 150,
      payout: 277.5,
      status: 'won',
      date: 'Hier, 22:45',
      edge: '+12.5%',
    },
    {
      id: 'h-2',
      match: 'Golden State Warriors vs Denver Nuggets',
      competition: 'NBA',
      selection: 'Denver Nuggets -3.5',
      odds: 1.92,
      stake: 120,
      payout: 230.4,
      status: 'won',
      date: '14 Oct, 04:15',
      edge: '+8.4%',
    },
    {
      id: 'h-3',
      match: 'Novak Djokovic vs Jannik Sinner',
      competition: 'ATP Masters 1000',
      selection: 'Plus de 22.5 Jeux',
      odds: 1.78,
      stake: 180,
      payout: 320.4,
      status: 'won',
      date: '13 Oct, 17:30',
      edge: '+11.0%',
    },
    {
      id: 'h-4',
      match: 'Real Madrid vs Manchester City',
      competition: 'Ligue des Champions',
      selection: 'Plus de 2.5 Buts & Les deux marquent',
      odds: 1.88,
      stake: 200,
      payout: 376.0,
      status: 'pending',
      date: 'En cours',
      edge: '+14.2%',
    },
    {
      id: 'h-5',
      match: 'PSG vs FC Barcelone',
      competition: 'Ligue des Champions',
      selection: 'PSG Remboursé si Nul',
      odds: 1.65,
      stake: 140,
      payout: 231.0,
      status: 'won',
      date: '11 Oct, 22:50',
      edge: '+9.1%',
    },
  ];

  const filteredHistory = betHistory.filter((b) => {
    if (activeHistoryFilter === 'won') return b.status === 'won';
    if (activeHistoryFilter === 'pending') return b.status === 'pending';
    if (activeHistoryFilter === 'value') return parseFloat(b.edge) > 10;
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner: Subscriber Status & Tiers */}
      <div className="bg-gradient-to-r from-[#07131e] via-[#0b1c2b] to-[#081a29] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30">
                ESPACE ABONNÉ VIP
              </span>
              <span className="text-xs text-zinc-400">Membre depuis {userProfile.memberSince}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Bienvenue, {userProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
              Votre tableau de bord centralisé pour piloter vos investissements sportifs avec la précision chirurgicale de l'IA GUED-COBRA.
            </p>
          </div>

          {/* Quick Tier Upgrader Switcher */}
          <div className="bg-[#0e2133] border border-emerald-500/30 rounded-xl p-3 space-y-2 shrink-0">
            <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
              Formule Active :
            </div>
            <div className="flex items-center gap-1.5">
              {(['bronze', 'vip', 'black_elite'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdateTier(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    userProfile.vipTier === t
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md'
                      : 'bg-[#14283c] text-zinc-300 hover:bg-[#1a354f]'
                  }`}
                >
                  {t === 'bronze' ? 'Bronze' : t === 'vip' ? 'Cobra VIP' : 'Black Élite'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Capital & Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bankroll */}
        <div className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Bankroll Actuelle</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-2">
            {formatCurrency(userProfile.bankroll)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{formatCurrency(userProfile.monthlyProfit)} ce mois</span>
          </div>
        </div>

        {/* ROI % */}
        <div className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Rendement (ROI)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-2">
            +{userProfile.roiPercentage}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Sur les 30 derniers jours</div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Taux de Réussite</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-amber-400 mt-2">
            {((userProfile.wonBets / userProfile.totalBets) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {userProfile.wonBets} gagnés sur {userProfile.totalBets} paris
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Série en Cours</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-2 flex items-center gap-1.5">
            <span>🔥 {userProfile.winStreak}</span>
            <span className="text-xs font-normal text-zinc-400">d'affilée</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            Série certifiée GUED-COBRA
          </div>
        </div>
      </div>

      {/* Middle Row: Kelly Criterion Simulator & Tier Privileges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Kelly Calculator */}
        <div className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-950/60">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">
                Simulateur de Mise Kelly Intelligent
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40">
              Fractionnel 25%
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Ajustez la cote bookmaker et la probabilité estimée par l'IA pour calculer la mise mathématiquement optimale.
          </p>

          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                <span>Cote Décimale :</span>
                <span className="font-mono text-emerald-400 font-bold">{simOdds.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.20"
                max="5.00"
                step="0.05"
                value={simOdds}
                onChange={(e) => setSimOdds(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                <span>Probabilité Réelle estimée par l'IA :</span>
                <span className="font-mono text-emerald-400 font-bold">{simConfidence}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                step="1"
                value={simConfidence}
                onChange={(e) => setSimConfidence(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-xl bg-[#0c1a27] border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Avantage Mathématique (Edge) :{' '}
                <span className={`font-bold ${simAnalysis.isValue ? 'text-emerald-400' : 'text-red-400'}`}>
                  {simAnalysis.edgePercentage > 0 ? `+${simAnalysis.edgePercentage}%` : `${simAnalysis.edgePercentage}%`}
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {simAnalysis.isValue ? 'Pari avec Espérance Positive (+EV)' : 'Attention : Valeur insuffisante'}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-zinc-400">Mise Recommandée :</div>
              <div className="text-lg font-mono font-black text-emerald-400">
                {formatCurrency((userProfile.bankroll * simAnalysis.recommendedKellyStake) / 100)}
              </div>
              <div className="text-[10px] text-zinc-500">
                ({simAnalysis.recommendedKellyStake}% du Bankroll)
              </div>
            </div>
          </div>
        </div>

        {/* Tier Benefits & Privileges Card */}
        <div className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-950/60">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                Vos Privilèges VIP GUED-COBRA
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase font-mono">
              {userProfile.vipTier}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0d1c2a] border border-emerald-950/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Modèle Gemini 4 Argon (High Thinking)</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Raisonnement approfondi en multi-étapes pour les paris combinés et arbitrages complexes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0d1c2a] border border-emerald-950/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Signaux Élite 85%+ en Temps Réel</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Alertes instantanées sur les chutes de cotes anormales et value bets certifiés.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0d1c2a] border border-emerald-950/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Analyse Vidéo Tactique & Transcription Vocale</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Posez vos questions au micro et uploadez des extraits vidéos pour décoder les faiblesses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Bet History Ledger */}
      <div className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-950/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Historique des Pronostics Exécutés
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveHistoryFilter('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                activeHistoryFilter === 'all'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#102030] text-zinc-400 hover:text-white'
              }`}
            >
              Tous ({betHistory.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryFilter('won')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                activeHistoryFilter === 'won'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#102030] text-zinc-400 hover:text-white'
              }`}
            >
              Gagnés
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryFilter('pending')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                activeHistoryFilter === 'pending'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#102030] text-zinc-400 hover:text-white'
              }`}
            >
              En cours
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryFilter('value')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${
                activeHistoryFilter === 'value'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#102030] text-zinc-400 hover:text-white'
              }`}
            >
              Value Bets +10%
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-950/80 text-zinc-500 font-mono">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Rencontre</th>
                <th className="py-2.5 px-3">Sélection</th>
                <th className="py-2.5 px-3">Cote</th>
                <th className="py-2.5 px-3">Mise</th>
                <th className="py-2.5 px-3">Gain / Retour</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/50">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-[#0c1a27] transition-colors">
                  <td className="py-3 px-3 font-mono text-zinc-400">{item.date}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{item.match}</div>
                    <div className="text-[11px] text-zinc-500">{item.competition}</div>
                  </td>
                  <td className="py-3 px-3 text-emerald-300 font-medium">
                    {item.selection}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {item.odds.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-300">
                    {formatCurrency(item.stake)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    +{formatCurrency(item.payout)}
                  </td>
                  <td className="py-3 px-3">
                    {item.status === 'won' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        GAGNÉ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        EN COURS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
