'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface VoiceListenerProps {
  isListening: boolean;
  transcript: string;
  onStart: () => void;
  onSkip: () => void;
  error: string | null;
  supported: boolean;
  modelLoading?: boolean;
  modelProgress?: number;
}

export default function VoiceListener({ isListening, transcript, onStart, onSkip, error, supported, modelLoading, modelProgress }: VoiceListenerProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mic button */}
      <div className="relative">
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#2563EB] opacity-30 animate-pulse-ring" />
            <span className="absolute inset-0 rounded-full bg-[#2563EB] opacity-20 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
          </>
        )}
        <motion.button
          onClick={isListening ? undefined : onStart}
          disabled={!supported || isListening}
          whileHover={!isListening && supported ? { scale: 1.05 } : {}}
          whileTap={!isListening && supported ? { scale: 0.95 } : {}}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            isListening
              ? 'bg-[#2563EB] shadow-blue-500/40 animate-listening cursor-default'
              : supported
              ? 'bg-[#0F172A] hover:bg-[#1E293B] shadow-slate-900/30 cursor-pointer'
              : 'bg-[#94A3B8] cursor-not-allowed'
          }`}
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isListening ? 2.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </motion.button>
      </div>

      {/* Status text */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.p
              key="listening"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm font-semibold text-[#2563EB]"
            >
              Escuchando…
            </motion.p>
          ) : modelLoading ? (
            <motion.p
              key="model-loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-[#94A3B8]"
            >
              Cargando modelo de voz{modelProgress ? ` ${modelProgress}%` : '…'}
            </motion.p>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-[#475569]"
            >
              {supported ? 'Toca el micrófono y di la letra' : 'Voz no disponible — usa el teclado'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Transcript */}
        {transcript && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-1 text-xs text-[#94A3B8] italic"
          >
            &ldquo;{transcript}&rdquo;
          </motion.p>
        )}

        {error && (
          <p className="mt-1 text-xs text-[#EF4444]">{error}</p>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={onSkip}
        className="text-xs text-[#94A3B8] hover:text-[#475569] underline underline-offset-2 transition-colors"
      >
        No puedo leerla — omitir
      </button>
    </div>
  );
}
