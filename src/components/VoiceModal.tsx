import React, { useState, useRef } from 'react';
import { Mic, MicOff, X, Loader2, Sparkles, Send, Volume2 } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuestion: (text: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSendQuestion,
}) => {
  if (!isOpen) return null;

  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setTranscribing(true);
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
              setTranscribedText(data.transcription);
            }
          } catch (e) {
            console.error('Transcription error:', e);
          } finally {
            setTranscribing(false);
          }
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
      alert("Accès microphone requis. Veuillez vérifier les permissions dans votre navigateur.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleConfirm = () => {
    if (transcribedText) {
      onSendQuestion(transcribedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-[#08121c] border border-emerald-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-modal-title"
      >
        <div className="flex items-center justify-between pb-2 border-b border-emerald-950/60">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h3 id="voice-modal-title" className="font-bold text-white text-base">
              Assistant Vocal GUED-COBRA
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Enregistrez votre question pour vos agents IA sportifs avec <strong>gemini-3.5-transcribe</strong>.
        </p>

        {/* Big Mic Button */}
        <div className="py-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer shadow-xl ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-500/30'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-black hover:scale-105'
            }`}
            aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <div className="text-xs font-mono font-semibold text-zinc-300 mt-3">
            {isRecording ? "Enregistrement en cours... Cliquez pour terminer" : "Cliquez sur le micro pour parler"}
          </div>
        </div>

        {/* Status & Output */}
        {transcribing && (
          <div className="flex items-center justify-center gap-2 text-xs text-amber-400 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Transcription neurale en cours...</span>
          </div>
        )}

        {transcribedText && (
          <div className="bg-[#0b1824] p-3 rounded-xl border border-emerald-500/40 text-left space-y-2">
            <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              Transcription Détectée :
            </div>
            <p className="text-xs text-white italic">"{transcribedText}"</p>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmettre à l'Agent IA</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
