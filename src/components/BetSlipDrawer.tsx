import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Receipt, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BetSelection } from '../types/index.ts';
import { calculateParlayOdds, formatCurrency } from '../utils/predictionMath.ts';

interface BetSlipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selections: BetSelection[];
  onRemoveSelection: (matchId: string, selection: string) => void;
  onClearSlip: () => void;
  bankroll: number;
  onValidateBets: (totalStake: number, potentialWin: number) => void;
}

export const BetSlipDrawer: React.FC<BetSlipDrawerProps> = ({
  isOpen,
  onClose,
  selections,
  onRemoveSelection,
  onClearSlip,
  bankroll,
  onValidateBets,
}) => {
  if (!isOpen) return null;

  const [betType, setBetType] = useState<'single' | 'combined'>('combined');
  const [stake, setStake] = useState<number>(50);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const oddsList = selections.map((s) => s.odds);
  const parlay = calculateParlayOdds(oddsList);

  const totalOdds = betType === 'combined' ? parlay.totalOdds : oddsList.reduce((a, b) => a + b, 0) / (oddsList.length || 1);
  const potentialWin = stake * totalOdds;

  const handleValidate = () => {
    if (selections.length === 0 || stake <= 0) return;

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff87', '#10b981', '#facc15', '#38bdf8'],
    });

    setIsSuccess(true);
    onValidateBets(stake, potentialWin);

    setTimeout(() => {
      setIsSuccess(false);
      onClearSlip();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#09121b] border-l border-emerald-500/40 h-full flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="slip-title"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-emerald-950/80 bg-[#0c1824] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 id="slip-title" className="text-sm font-bold text-white flex items-center gap-2">
                <span>Panier de Paris Cobra</span>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  {selections.length}
                </span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                Optimisation en direct par IA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selections.length > 0 && (
              <button
                type="button"
                onClick={onClearSlip}
                className="p-1.5 text-zinc-400 hover:text-red-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Vider le panier"
                aria-label="Vider le panier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#142637] hover:bg-[#1a334a] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Combiné vs Simple Switcher */}
        {selections.length > 1 && (
          <div className="p-3 bg-[#060c14] border-b border-emerald-950/60 flex gap-2">
            <button
              type="button"
              onClick={() => setBetType('combined')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                betType === 'combined'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#0f1f2e] text-zinc-400'
              }`}
            >
              Combiné ({parlay.totalOdds.toFixed(2)})
            </button>
            <button
              type="button"
              onClick={() => setBetType('single')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                betType === 'single'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#0f1f2e] text-zinc-400'
              }`}
            >
              Paris Simples
            </button>
          </div>
        )}

        {/* Selections List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {selections.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-500">
              <Receipt className="w-12 h-12 text-emerald-900/60" />
              <p className="text-sm font-semibold text-zinc-400">
                Votre panier de paris est vide
              </p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Sélectionnez des cotes ou cliquez sur les recommandations des agents IA pour composer votre coupon.
              </p>
            </div>
          ) : (
            selections.map((sel, idx) => (
              <div
                key={`${sel.matchId}-${idx}`}
                className="bg-[#0c1825] border border-emerald-950/80 hover:border-emerald-500/30 rounded-xl p-3 space-y-2 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">
                      {sel.competition}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {sel.matchTitle}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSelection(sel.matchId, sel.selection)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    aria-label={`Supprimer ${sel.selection}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-emerald-950/40 text-xs">
                  <span className="font-semibold text-emerald-300">
                    {sel.selection}
                  </span>
                  <span className="font-mono font-bold text-white bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {sel.odds.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stake & Payout Controls */}
        {selections.length > 0 && (
          <div className="p-4 bg-[#0a1521] border-t border-emerald-950/80 space-y-4">
            {/* Quick Stake Buttons */}
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                <span>Mise Totale (€) :</span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Bankroll : {formatCurrency(bankroll)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max={bankroll}
                  value={stake}
                  onChange={(e) => setStake(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="flex-1 bg-[#060c14] text-white text-sm font-mono font-bold px-3 py-2 rounded-xl border border-emerald-900/60 focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => setStake((prev) => prev + 20)}
                  className="px-2.5 py-2 rounded-lg bg-[#142637] hover:bg-[#1a334a] text-xs font-mono font-bold text-emerald-300 cursor-pointer"
                >
                  +20€
                </button>
                <button
                  type="button"
                  onClick={() => setStake((prev) => prev + 50)}
                  className="px-2.5 py-2 rounded-lg bg-[#142637] hover:bg-[#1a334a] text-xs font-mono font-bold text-emerald-300 cursor-pointer"
                >
                  +50€
                </button>
                <button
                  type="button"
                  onClick={() => setStake(Math.min(bankroll, Math.round(bankroll * 0.03)))}
                  className="px-2.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 cursor-pointer"
                  title="Mise Kelly 3% conseillée"
                >
                  Kelly 3%
                </button>
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="space-y-1.5 pt-2 border-t border-emerald-950/60 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Cote Totale Multiplicateur :</span>
                <span className="font-mono font-bold text-white">{totalOdds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="font-semibold">Gains Potentiels Nets :</span>
                <span className="font-mono text-base font-black text-emerald-400">
                  {formatCurrency(potentialWin)}
                </span>
              </div>
            </div>

            {/* Validation Button */}
            <button
              type="button"
              disabled={isSuccess || stake > bankroll}
              onClick={handleValidate}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>PARI VALIDÉ AVEC SUCCÈS !</span>
                </>
              ) : stake > bankroll ? (
                <span>Bankroll insuffisante</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Valider le Pari GUED-COBRA</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
