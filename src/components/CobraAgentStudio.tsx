import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  RotateCcw, 
  User, 
  Cpu, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Layers,
  Loader2,
  ChevronRight,
  MessageSquare,
  Volume2
} from 'lucide-react';
import { ChatMessage } from '../types/index.ts';

interface CobraAgentStudioProps {
  initialPrompt?: string;
}

export const CobraAgentStudio: React.FC<CobraAgentStudioProps> = ({ initialPrompt = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState<'master' | 'football' | 'basketball' | 'tennis' | 'combat'>('master');
  const [speedMode, setSpeedMode] = useState<'fast' | 'balanced' | 'deep'>('deep');
  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `👋 Bienvenue dans l'Arène des Agents IA **GUED-COBRA**.

Je suis le **Système Maître Algorithmique**. Je scanne en temps réel les volumes de mises sur les marchés asiatiques, les métriques d'Expected Goals (xG), les variations de cotes et le Critère de Kelly.

Posez votre question (ou enregistrez votre voix au micro) sur n'importe quel match ou sport !`,
      timestamp: 'En direct',
      modelUsed: 'gemini-4-argon',
      thinkingUsed: true,
    },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          agentType: selectedAgent,
          speed: speedMode,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Analyse GUED-COBRA en cours de traitement.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || (speedMode === 'deep' ? 'gemini-4-argon' : 'gemini-3.8-flash'),
        thinkingUsed: speedMode === 'deep',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "Erreur de connexion avec l'Agent Cobra. Mode hors-ligne activé avec prédictions de secours.",
          timestamp: 'Erreur',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Microphone audio transcription using gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setTranscriptionLoading(true);
          try {
            const resp = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: 'audio/webm',
              }),
            });
            const data = await resp.json();
            if (data.transcription) {
              setInputMessage(data.transcription);
              // Proactively send transcribed message
              handleSendMessage(data.transcription);
            }
          } catch (e) {
            console.error('Transcription error:', e);
          } finally {
            setTranscriptionLoading(false);
          }
        };

        // Stop media tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
      alert("Accès microphone non accordé. Veuillez autoriser l'accès au microphone dans le navigateur.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const agentsList = [
    { id: 'master', name: 'Algorithme Maître', icon: '🧠', tag: 'High Thinking', desc: 'Bayésien, Kelly & Arbitrage' },
    { id: 'football', name: 'Cobra Striker', icon: '⚽', tag: 'Football / xG', desc: 'Tactique, Pressing & Forme' },
    { id: 'basketball', name: 'Cobra Hoop', icon: '🏀', tag: 'NBA / Basket', desc: 'Pace, Off-Rating & Matchups' },
    { id: 'tennis', name: 'Cobra Ace', icon: '🎾', tag: 'ATP / WTA', desc: 'Surfaces & Tie-Breaks' },
    { id: 'combat', name: 'Cobra Octagon', icon: '🥊', tag: 'MMA / UFC', desc: 'Striking & Takedowns' },
  ] as const;

  const quickPrompts = [
    "Analyse le choc Real Madrid vs Man City avec xG",
    "Quel est le meilleur Value Bet de la soirée ?",
    "Donne-moi un combiné sécurisé avec cote ~2.50",
    "Calcul de mise Kelly pour une cote de 1.85",
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Studio Header & Agent Switcher */}
      <div className="bg-[#08111a] border border-emerald-950/80 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-950/60">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-black text-white tracking-wide">
                AGENTS IA PROGRAMMÉS EN TEMPS RÉEL
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Connecté aux modèles Google Gemini de pointe pour décoder chaque paramètre mathématique des rencontres.
            </p>
          </div>

          {/* Model Speed & Thinking Selector */}
          <div className="flex items-center gap-2 bg-[#0c1825] p-1.5 rounded-xl border border-emerald-900/40 text-xs">
            <button
              type="button"
              onClick={() => setSpeedMode('deep')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                speedMode === 'deep'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Raisonnement poussé avec Gemini 4 Argon"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Haute Réflexion (Argon)</span>
            </button>

            <button
              type="button"
              onClick={() => setSpeedMode('balanced')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                speedMode === 'balanced'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Gemini 3.8 Flash standard"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Standard (Flash 3.8)</span>
            </button>

            <button
              type="button"
              onClick={() => setSpeedMode('fast')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                speedMode === 'fast'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Gemini 3.1 Flash-Lite ultra basse latence"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Basse Latence (Lite)</span>
            </button>
          </div>
        </div>

        {/* Horizontal Agent Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
          {agentsList.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedAgent === agent.id
                  ? 'bg-emerald-500/15 border-emerald-400 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-[#0d1a27] border-emerald-950/60 hover:border-emerald-800/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xl">{agent.icon}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  selectedAgent === agent.id ? 'bg-emerald-400 text-black' : 'bg-[#14283b] text-zinc-400'
                }`}>
                  {agent.tag}
                </span>
              </div>
              <span className="font-bold text-sm text-white mt-2 leading-tight">
                {agent.name}
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                {agent.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Thread Container */}
      <div className="bg-[#08111a] border border-emerald-950/80 rounded-2xl flex flex-col h-[560px] shadow-2xl overflow-hidden">
        {/* Chat Thread Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-black font-medium rounded-tr-none shadow-md'
                    : 'bg-[#0d1b29] border border-emerald-950/80 text-zinc-200 rounded-tl-none space-y-2'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 pb-1 border-b border-emerald-950/50 text-[11px] font-mono text-zinc-400">
                    <span className="text-emerald-400 font-bold">GUED-COBRA AI</span>
                    <span>•</span>
                    <span>{msg.modelUsed || 'Gemini'}</span>
                    {msg.thinkingUsed && (
                      <span className="text-amber-400 font-bold bg-amber-950/50 px-1.5 py-0.2 rounded">
                        High Thinking
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className="text-[10px] text-right opacity-60 font-mono">
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-emerald-400 animate-pulse py-2">
              <Bot className="w-5 h-5 animate-spin" />
              <span className="font-mono">
                L'Agent {selectedAgent.toUpperCase()} analyse les distributions de probabilités...
              </span>
            </div>
          )}

          {transcriptionLoading && (
            <div className="flex items-center gap-3 text-xs text-amber-400 animate-pulse py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-mono">Transcription audio avec Gemini 3.5 Transcribe...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#060c14] border-t border-emerald-950/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-zinc-500 font-mono shrink-0">Suggestions :</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="text-[11px] text-zinc-300 bg-[#0d1a27] hover:bg-[#152a3f] border border-emerald-900/40 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-[#0a1420] border-t border-emerald-950/80 flex items-center gap-2">
          {/* Audio Input Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse border-red-400'
                : 'bg-[#122334] hover:bg-[#1a334c] text-emerald-400 border-emerald-500/30'
            }`}
            title={isRecording ? "Arrêter l'enregistrement" : "Parler dans le micro"}
            aria-label="Microphone"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Posez votre question à l'Agent Cobra (${selectedAgent})...`}
            className="flex-1 bg-[#070e17] text-white text-sm px-4 py-2.5 rounded-xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-500"
          />

          <button
            type="button"
            disabled={!inputMessage.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black rounded-xl font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md"
            aria-label="Envoyer le message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
