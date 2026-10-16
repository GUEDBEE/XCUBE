import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Filter, 
  Search, 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  Radio, 
  Activity, 
  BarChart2, 
  SlidersHorizontal,
  ChevronRight,
  Plus
} from 'lucide-react';
import { MatchItem, SportCategory, BetSelection, UserSubscriberProfile, VipTier } from './types/index.ts';
import { INITIAL_MATCHES } from './data/sportsData.ts';
import { CobraArena3D } from './components/CobraArena3D.tsx';
import { Header } from './components/Header.tsx';
import { LiveOddsTicker } from './components/LiveOddsTicker.tsx';
import { MatchCard } from './components/MatchCard.tsx';
import { MatchDetailModal } from './components/MatchDetailModal.tsx';
import { CobraAgentStudio } from './components/CobraAgentStudio.tsx';
import { SubscriberDashboard } from './components/SubscriberDashboard.tsx';
import { PosterStudio } from './components/PosterStudio.tsx';
import { BetSlipDrawer } from './components/BetSlipDrawer.tsx';
import { VoiceModal } from './components/VoiceModal.tsx';
import { formatCurrency } from './utils/predictionMath.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'matches' | 'agents' | 'dashboard' | 'posters'>('matches');
  const [selectedSport, setSelectedSport] = useState<SportCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyValueBets, setOnlyValueBets] = useState(false);
  const [onlyLive, setOnlyLive] = useState(false);

  // Matches state
  const [matches] = useState<MatchItem[]>(INITIAL_MATCHES);
  const [activeMatchModal, setActiveMatchModal] = useState<MatchItem | null>(null);

  // Bet Slip state
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [isBetSlipOpen, setIsBetSlipOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [agentInitialPrompt, setAgentInitialPrompt] = useState('');

  // Subscriber Profile
  const [userProfile, setUserProfile] = useState<UserSubscriberProfile>({
    name: 'Gued VIP Member',
    vipTier: 'black_elite',
    memberSince: 'Mars 2026',
    bankroll: 5420,
    startingBankroll: 3500,
    monthlyProfit: 1920,
    totalBets: 48,
    wonBets: 38,
    winStreak: 8,
    roiPercentage: 38.7,
  });

  // Add selection to Bet Slip
  const handleAddToSlip = (match: MatchItem, selection: string, odds: number) => {
    setBetSlip((prev) => {
      // Toggle if already exists
      const exists = prev.some((s) => s.matchId === match.id && s.selection === selection);
      if (exists) {
        return prev.filter((s) => !(s.matchId === match.id && s.selection === selection));
      }
      return [
        ...prev,
        {
          matchId: match.id,
          matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
          competition: match.competition,
          sport: match.sport,
          selection,
          odds,
          aiConfidence: match.aiPrediction.confidence,
          stake: 50,
        },
      ];
    });
    setIsBetSlipOpen(true);
  };

  const handleRemoveFromSlip = (matchId: string, selection: string) => {
    setBetSlip((prev) => prev.filter((s) => !(s.matchId === matchId && s.selection === selection)));
  };

  const isSelectionInSlip = (matchId: string, selection: string) => {
    return betSlip.some((s) => s.matchId === matchId && s.selection === selection);
  };

  const handleValidateBets = (totalStake: number, potentialWin: number) => {
    setUserProfile((prev) => ({
      ...prev,
      bankroll: prev.bankroll - totalStake,
      totalBets: prev.totalBets + 1,
    }));
  };

  // Handle Voice Question Transfer to Agent
  const handleVoiceQuestion = (text: string) => {
    setAgentInitialPrompt(text);
    setCurrentTab('agents');
  };

  // Filtered Matches
  const filteredMatches = matches.filter((m) => {
    if (selectedSport !== 'all' && m.sport !== selectedSport) return false;
    if (onlyValueBets && !m.aiPrediction.isValueBet) return false;
    if (onlyLive && !m.isLive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.homeTeam} ${m.awayTeam} ${m.competition}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#04090e] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userProfile={userProfile}
        betSlipCount={betSlip.length}
        onOpenBetSlip={() => setIsBetSlipOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Live Odds & Match Ticker */}
      <LiveOddsTicker
        matches={matches}
        onSelectMatch={(m) => {
          setActiveMatchModal(m);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* TAB 1: MATCHS & PRONOSTICS */}
        {currentTab === 'matches' && (
          <div className="space-y-8">
            {/* Hero 3D Cobra Arena */}
            <section className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                    <span>ARÈNE HOLOGRAPHIQUE COBRA 3D</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      INTERACTIF
                    </span>
                  </h1>
                  <p className="text-xs text-zinc-400">
                    Modélisation 3D temps réel du système radar GUED-COBRA. Manipulez l'orbite, changez les sports et ajustez les presets d'éclairage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('agents')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Lancer Agent IA</span>
                  </button>
                </div>
              </div>

              {/* Mounted 3D WebGL Scene */}
              <CobraArena3D
                activeSport={selectedSport}
                onSelectSport={(s) => setSelectedSport(s as SportCategory)}
              />
            </section>

            {/* Filter & Search Bar */}
            <section className="bg-[#08121c] border border-emerald-950/80 rounded-2xl p-4 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une équipe, un combat ou une compétition..."
                    className="w-full bg-[#0a1622] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-emerald-950 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOnlyLive(!onlyLive)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      onlyLive
                        ? 'bg-red-500/20 border-red-500/50 text-red-300 font-bold'
                        : 'bg-[#0e1d2c] border-emerald-950/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-red-400" />
                    <span>En Direct Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlyValueBets(!onlyValueBets)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      onlyValueBets
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-[#0e1d2c] border-emerald-950/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Value Bets Seulement</span>
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-emerald-950/60 text-xs">
                {(
                  [
                    { id: 'all', label: 'Toutes Catégories' },
                    { id: 'football', label: '⚽ Football' },
                    { id: 'basketball', label: '🏀 Basketball / NBA' },
                    { id: 'tennis', label: '🎾 Tennis ATP/WTA' },
                    { id: 'mma', label: '🥊 MMA / UFC' },
                    { id: 'esport', label: '🎮 Esport CS2' },
                    { id: 'f1', label: '🏎️ Formule 1' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedSport(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSport === cat.id
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'bg-[#0f1f2e] text-zinc-400 hover:text-white hover:bg-[#152a3f]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Matches Cards Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    PRONOSTICS OFFICIELS EN LIGNE ({filteredMatches.length})
                  </h2>
                  <span className="text-xs text-zinc-500 font-mono">
                    • Mises à jour en temps réel
                  </span>
                </div>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="bg-[#08121c] border border-dashed border-emerald-950/80 rounded-2xl p-10 text-center space-y-3">
                  <Filter className="w-10 h-10 text-emerald-900 mx-auto" />
                  <h3 className="text-white font-bold">Aucune rencontre ne correspond à vos filtres</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Essayez de réinitialiser la recherche ou de désactiver le filtre Value Bet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSport('all');
                      setSearchQuery('');
                      setOnlyValueBets(false);
                      setOnlyLive(false);
                    }}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/40 cursor-pointer"
                  >
                    Réinitialiser les Filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onOpenAnalysis={(m) => setActiveMatchModal(m)}
                      onAddToSlip={handleAddToSlip}
                      isSelectionInSlip={isSelectionInSlip}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: AGENTS IA TEMPS RÉEL */}
        {currentTab === 'agents' && (
          <CobraAgentStudio initialPrompt={agentInitialPrompt} />
        )}

        {/* TAB 3: TABLEAU DE BORD VIP */}
        {currentTab === 'dashboard' && (
          <SubscriberDashboard
            userProfile={userProfile}
            onUpdateTier={(t: VipTier) => {
              setUserProfile((prev) => ({ ...prev, vipTier: t }));
            }}
            onUpdateBankroll={(newB: number) => {
              setUserProfile((prev) => ({ ...prev, bankroll: newB }));
            }}
          />
        )}

        {/* TAB 4: STUDIO AFFICHES IA & ANALYSE VIDÉO */}
        {currentTab === 'posters' && <PosterStudio />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-950/70 bg-[#050b10] py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-400">GUED-COBRA</span>
            <span>• Algorithmes de Prédication & Modélisation Probabiliste Sportive</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Jouez avec modération (18+)</span>
            <span>Critère de Kelly certifié</span>
            <span className="text-emerald-400">Modèles Gemini 4 Argon & 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. In-depth Match Analysis Modal */}
      <MatchDetailModal
        match={activeMatchModal}
        onClose={() => setActiveMatchModal(null)}
        onAddToSlip={handleAddToSlip}
        isSelectionInSlip={isSelectionInSlip}
        bankroll={userProfile.bankroll}
      />

      {/* 2. Slide-out Bet Slip Drawer */}
      <BetSlipDrawer
        isOpen={isBetSlipOpen}
        onClose={() => setIsBetSlipOpen(false)}
        selections={betSlip}
        onRemoveSelection={handleRemoveFromSlip}
        onClearSlip={() => setBetSlip([])}
        bankroll={userProfile.bankroll}
        onValidateBets={handleValidateBets}
      />

      {/* 3. Audio Voice Recording Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendQuestion={handleVoiceQuestion}
      />
    </div>
  );
}
