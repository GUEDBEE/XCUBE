import React, { useState } from 'react';
import { 
  X, 
  BrainCircuit, 
  Zap, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Plus, 
  Check, 
  BarChart2, 
  TrendingUp, 
  Layers,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { MatchItem } from '../types/index.ts';
import { evaluateValueBet, formatCurrency } from '../utils/predictionMath.ts';

interface MatchDetailModalProps {
  match: MatchItem | null;
  onClose: () => void;
  onAddToSlip: (match: MatchItem, selection: string, odds: number) => void;
  isSelectionInSlip: (matchId: string, selection: string) => boolean;
  bankroll: number;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
  onAddToSlip,
  isSelectionInSlip,
  bankroll,
}) => {
  if (!match) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'ai_live' | 'kelly'>('ai_live');
  const [thinkingMode, setThinkingMode] = useState<boolean>(true);
  const [agentType, setAgentType] = useState<string>('master');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [liveAiReport, setLiveAiReport] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const valueAnalysis = evaluateValueBet(
    match.aiPrediction.targetOdds,
    match.aiPrediction.aiProbability,
    bankroll
  );

  const handleGenerateLiveAnalysis = async (highThinking: boolean = thinkingMode) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match,
          agentType,
          thinkingMode: highThinking,
          speed: highThinking ? 'balanced' : 'fast',
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setLiveAiReport(data.analysis);
        setModelUsed(data.modelUsed || (highThinking ? 'gemini-4-argon' : 'gemini-3.1-flash-lite'));
      }
    } catch (err) {
      console.error('Error generating AI analysis:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#08111b] border border-emerald-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-emerald-950/80 flex items-center justify-between bg-[#0b1622]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  {match.competition}
                </span>
                {match.aiPrediction.isValueBet && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    VALUE BET +{match.aiPrediction.edge}%
                  </span>
                )}
              </div>
              <h2 id="modal-title" className="text-lg sm:text-xl font-black text-white">
                {match.homeTeam} <span className="text-zinc-500">vs</span> {match.awayTeam}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#122334] hover:bg-[#1a334c] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fermer la modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-emerald-950/60 bg-[#060c14] px-5 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ai_live')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'ai_live'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Rapport d'Analyse IA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Statistiques & xG</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kelly')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'kelly'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gestion Bankroll & Kelly</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-zinc-300">
          {/* TAB 1: AI LIVE ANALYSIS */}
          {activeTab === 'ai_live' && (
            <div className="space-y-4">
              {/* Agent Mode Controls */}
              <div className="bg-[#0b1622] p-4 rounded-xl border border-emerald-950/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">Spécialiste :</span>
                  <select
                    value={agentType}
                    onChange={(e) => setAgentType(e.target.value)}
                    className="bg-[#122334] text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-500/30 focus:outline-none cursor-pointer"
                  >
                    <option value="master">Cobra Algorithme Maître</option>
                    <option value="football">Cobra Striker (Football/xG)</option>
                    <option value="basketball">Cobra Hoop (NBA/Basket)</option>
                    <option value="tennis">Cobra Ace (ATP/WTA Tennis)</option>
                    <option value="combat">Cobra Octagon (MMA/UFC)</option>
                  </select>
                </div>

                {/* Thinking Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setThinkingMode(!thinkingMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      thinkingMode
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                        : 'bg-[#122334] border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Haute Réflexion (Gemini 4 Argon)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoadingAi}
                    onClick={() => handleGenerateLiveAnalysis(thinkingMode)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isLoadingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Calcul en cours...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Générer Diagnostic</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Report Display */}
              {liveAiReport ? (
                <div className="bg-[#0e1d2c] border border-emerald-500/40 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-950/60 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      RAPPORT VALIDÉ PAR GUED-COBRA
                    </span>
                    <span className="text-zinc-400">
                      Modèle : <span className="text-white font-semibold">{modelUsed}</span>
                    </span>
                  </div>
                  <div className="prose prose-invert prose-emerald text-sm max-w-none whitespace-pre-wrap leading-relaxed text-zinc-200">
                    {liveAiReport}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0b1622] border border-dashed border-emerald-900/50 rounded-xl p-6 text-center space-y-2">
                  <BrainCircuit className="w-8 h-8 text-emerald-400/60 mx-auto" />
                  <h4 className="text-white font-bold">Diagnostic Prédéfini Disponible</h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    {match.aiPrediction.tacticalSummary}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateLiveAnalysis(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lancer l'Agent IA en Direct</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STATS & XG */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0b1622] p-4 rounded-xl border border-emerald-950/80">
                  <div className="text-xs text-zinc-400">Confiance IA Cobra</div>
                  <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                    {match.aiPrediction.confidence}%
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Probabilité réelle calculée</div>
                </div>

                <div className="bg-[#0b1622] p-4 rounded-xl border border-emerald-950/80">
                  <div className="text-xs text-zinc-400">Edge Bookmaker</div>
                  <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                    +{match.aiPrediction.edge}%
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Valeur mathématique espérée</div>
                </div>

                <div className="bg-[#0b1622] p-4 rounded-xl border border-emerald-950/80">
                  <div className="text-xs text-zinc-400">Indice de Risque</div>
                  <div className="text-2xl font-mono font-black text-white mt-1">
                    {match.aiPrediction.riskLevel}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Stabilité statistique</div>
                </div>
              </div>

              {/* Key Stats Bullet Points */}
              <div className="bg-[#0b1622] p-4 rounded-xl border border-emerald-950/80 space-y-2">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  Indicateurs Déterminants
                </h4>
                <ul className="space-y-2 text-xs">
                  {match.aiPrediction.keyStats.map((stat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: KELLY CRITERION & BANKROLL */}
          {activeTab === 'kelly' && (
            <div className="space-y-4">
              <div className="bg-[#0b1622] p-4 rounded-xl border border-emerald-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Recommandation Critère de Kelly</h4>
                    <p className="text-xs text-zinc-400">
                      Calcul d'optimisation mathématique du capital pour parieurs d'élite.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/30">
                    Quarter-Kelly 25%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#122334] p-3 rounded-lg border border-emerald-950/60">
                    <div className="text-[11px] text-zinc-400">Mise Recommandée (%)</div>
                    <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                      {valueAnalysis.recommendedKellyStake}% du Bankroll
                    </div>
                  </div>

                  <div className="bg-[#122334] p-3 rounded-lg border border-emerald-950/60">
                    <div className="text-[11px] text-zinc-400">Mise Recommandée en € (sur {formatCurrency(bankroll)})</div>
                    <div className="text-xl font-mono font-bold text-white mt-0.5">
                      {formatCurrency((bankroll * valueAnalysis.recommendedKellyStake) / 100)}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  🛡️ <strong>Règle de fer GUED-COBRA :</strong> Ne misez jamais plus de 5% de votre bankroll sur un seul pari, même en cas de confiance extrême. La discipline bat la variance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with One-Click Add to Slip */}
        <div className="p-4 border-t border-emerald-950/80 bg-[#0b1622] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Sélection Cobra :</span>
            <span className="text-xs font-bold text-white">
              {match.aiPrediction.recommendedBet}
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40">
              Cote {match.aiPrediction.targetOdds.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onAddToSlip(match, match.aiPrediction.recommendedBet, match.aiPrediction.targetOdds);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter au Panier de Paris</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
