'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TEST_ROWS,
  FALLBACK_SIZES,
  generateRowLetters,
  evaluateRow,
  computeFinalResult,
  getLetterHeightPx,
  type SnellenLetter,
  type RowResult,
  type LetterResult,
} from '@/services/visionLogic';
import { WhisperService, type ModelStatus } from '@/services/whisper';
import { type SpeechCallback } from '@/services/speech';
import { loadCalibration } from '@/services/calibration';
import LetterDisplay from '@/components/test/LetterDisplay';
import VoiceListener from '@/components/test/VoiceListener';
import ProgressBar from '@/components/test/ProgressBar';
import Link from 'next/link';

type Phase = 'permission' | 'ready' | 'testing' | 'row-result' | 'done';

const LETTERS_PER_ROW = 5;
const MAX_CONSECUTIVE_FAILS = 2;

export default function TestPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('permission');
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const [rowIndex, setRowIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [currentLetters, setCurrentLetters] = useState<SnellenLetter[]>([]);
  const [letterResults, setLetterResults] = useState<{ correct: boolean | null }[]>([]);
  const [completedRows, setCompletedRows] = useState<RowResult[]>([]);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const [fontSizePx, setFontSizePx] = useState(96);
  const [consecutiveFails, setConsecutiveFails] = useState(0);

  const [lastResult, setLastResult] = useState<{ correct: boolean; letter: string } | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading');
  const [modelProgress, setModelProgress] = useState(0);

  const speechRef = useRef<WhisperService | null>(null);
  const handleSpeechResultRef = useRef<SpeechCallback | null>(null);

  const currentRow = TEST_ROWS[rowIndex];

  // Compute letter size from calibration
  useEffect(() => {
    const cal = loadCalibration();
    const denom = currentRow.denominator;
    if (cal) {
      const px = getLetterHeightPx(denom, cal.pixelsPerMM, cal.viewingDistanceMM);
      setFontSizePx(Math.round(px));
    } else {
      setFontSizePx(FALLBACK_SIZES[denom] ?? 48);
    }
  }, [rowIndex, currentRow.denominator]);

  // Generate letters for current row
  useEffect(() => {
    if (phase === 'testing') {
      const letters = generateRowLetters(LETTERS_PER_ROW);
      setCurrentLetters(letters);
      setLetterIndex(0);
      setLetterResults(Array(LETTERS_PER_ROW).fill({ correct: null }));
    }
  }, [rowIndex, phase]);

  const handleSpeechResult = useCallback(
    (letters: string[], raw: string) => {
      setIsListening(false);
      setTranscript(raw);

      const expected = currentLetters[letterIndex];
      if (!expected) return;

      const spokenLetter = letters[0]?.toUpperCase() ?? '';
      const correct = spokenLetter === expected;

      setLastResult({ correct, letter: expected });
      setLetterResults((prev) => {
        const next = [...prev];
        next[letterIndex] = { correct };
        return next;
      });

      setTimeout(() => {
        setLastResult(null);
        setTranscript('');
        if (letterIndex + 1 >= LETTERS_PER_ROW) {
          // Evaluate full row
          const fullResults: LetterResult[] = currentLetters.map((l, i) => ({
            expected: l,
            spoken: i === letterIndex ? spokenLetter : '',
            correct: i === letterIndex ? correct : ((letterResults[i]?.correct ?? false) as boolean),
          }));
          finishRow(fullResults);
        } else {
          setLetterIndex((i) => i + 1);
        }
      }, 600);
    },
    [currentLetters, letterIndex, letterResults],
  );

  const finishRow = useCallback(
    (results: LetterResult[]) => {
      const { score, passed } = evaluateRow(results);
      const rowResult: RowResult = {
        row: currentRow,
        letters: currentLetters,
        results,
        score,
        passed,
      };
      const newCompleted = [...completedRows, rowResult];
      setCompletedRows(newCompleted);

      const newFails = passed ? 0 : consecutiveFails + 1;
      setConsecutiveFails(newFails);

      if (newFails >= MAX_CONSECUTIVE_FAILS || rowIndex + 1 >= TEST_ROWS.length) {
        // Save and go to done
        const finalData = {
          rows: newCompleted,
          ...computeFinalResult(newCompleted),
          timestamp: Date.now(),
          eye: 'both' as const,
        };
        localStorage.setItem('dvt_result', JSON.stringify(finalData));
        setPhase('done');
        setTimeout(() => router.push('/results'), 1200);
      } else {
        setPhase('row-result');
        setTimeout(() => {
          setRowIndex((r) => r + 1);
          setPhase('testing');
        }, 1800);
      }
    },
    [completedRows, consecutiveFails, currentLetters, currentRow, rowIndex, router],
  );

  // Keep ref in sync so WhisperService always calls the latest handler
  useEffect(() => {
    handleSpeechResultRef.current = handleSpeechResult;
  }, [handleSpeechResult]);

  // Initialize WhisperService once — do not recreate on every render
  useEffect(() => {
    const supported = typeof MediaRecorder !== 'undefined' && typeof AudioContext !== 'undefined';
    setSpeechSupported(supported);

    speechRef.current = new WhisperService(
      (letters, raw) => handleSpeechResultRef.current?.(letters, raw),
      (err) => { setVoiceError(err); setIsListening(false); },
      () => setIsListening(false),
    );

    WhisperService.preload((status, progress) => {
      setModelStatus(status);
      if (progress !== undefined) setModelProgress(progress);
      if (status === 'ready') setSpeechSupported(true);
      if (status === 'error') setSpeechSupported(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      setPhase('ready');
    } catch {
      setVoiceError('Permiso de micrófono denegado. Puedes usar el modo teclado.');
      setHasMicPermission(false);
      setPhase('ready');
    }
  };

  const startListening = useCallback(() => {
    setVoiceError(null);
    setTranscript('');
    setIsListening(true);
    speechRef.current?.start();
  }, []);

  const skipLetter = useCallback(() => {
    speechRef.current?.stop();
    setIsListening(false);
    setTranscript('');

    const expected = currentLetters[letterIndex];
    if (!expected) return;

    setLastResult({ correct: false, letter: expected });
    setLetterResults((prev) => {
      const next = [...prev];
      next[letterIndex] = { correct: false };
      return next;
    });

    setTimeout(() => {
      setLastResult(null);
      if (letterIndex + 1 >= LETTERS_PER_ROW) {
        const fullResults: LetterResult[] = currentLetters.map((l, i) => ({
          expected: l,
          spoken: '',
          correct: i < letterIndex ? (letterResults[i]?.correct ?? false) as boolean : false,
        }));
        finishRow(fullResults);
      } else {
        setLetterIndex((i) => i + 1);
      }
    }, 500);
  }, [currentLetters, letterIndex, letterResults, finishRow]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== 'testing') return;
      const key = e.key.toUpperCase();
      if (key.length === 1 && /[A-Z]/.test(key)) {
        handleSpeechResult([key], key);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isListening) startListening();
      } else if (e.key === 'Escape') {
        skipLetter();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, isListening, handleSpeechResult, startListening, skipLetter]);

  // ─── Render phases ──────────────────────────────────────────────────────────

  if (phase === 'permission') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header step={3} />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#E2E8F0] rounded-3xl p-10 shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Permiso de micrófono</h2>
              <p className="text-[#475569] text-sm leading-relaxed mb-8">
                El test usa tu micrófono para capturar las letras que dices en voz alta. Tu audio se procesa localmente y no se envía a ningún servidor.
              </p>
              <div className="space-y-3">
                <button
                  onClick={requestMicPermission}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  Permitir micrófono
                </button>
                <button
                  onClick={() => { setPhase('ready'); }}
                  className="w-full text-sm text-[#94A3B8] hover:text-[#475569] py-2 transition-colors"
                >
                  Continuar sin micrófono (usar teclado)
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header step={3} />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center bg-white border border-[#E2E8F0] rounded-3xl p-10 shadow-sm">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="4" />
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">¿Listo para comenzar?</h2>
            <p className="text-[#475569] text-sm leading-relaxed mb-2">
              Se mostrará una letra a la vez. Di la letra en voz alta o presiónala en tu teclado.
            </p>
            {!hasMicPermission && (
              <p className="text-xs text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2 mb-6">
                Sin micrófono: escribe la letra en tu teclado o presiona Escape para omitir.
              </p>
            )}
            <div className="mb-8" />
            <button
              onClick={() => setPhase('testing')}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
            >
              Comenzar test
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">Test completado</h2>
          <p className="text-[#475569] text-sm mt-1">Calculando resultados…</p>
        </motion.div>
      </div>
    );
  }

  // Testing + row-result phase
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header step={3} />

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        {/* Progress */}
        <div className="mb-8 animate-fade-in">
          <ProgressBar currentRow={rowIndex + 1} totalRows={TEST_ROWS.length} acuity={currentRow.acuity} />
        </div>

        {/* Letter area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'row-result' ? (
              <motion.div
                key="row-result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                {completedRows[completedRows.length - 1]?.passed ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-[#059669] font-semibold">¡Bien!</p>
                    <p className="text-sm text-[#475569]">Pasando a letras más pequeñas…</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-[#DC2626] font-semibold">Difícil de leer</p>
                    <p className="text-sm text-[#475569]">Continuando el test…</p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`row-${rowIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                {/* Acuity label */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#94A3B8] tracking-widest uppercase">{currentRow.acuity}</span>
                  <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                  <span className="text-xs text-[#94A3B8]">{currentRow.description}</span>
                </div>

                {/* Letters */}
                <div className="w-full min-h-[1.5em] flex items-center justify-center" style={{ minHeight: fontSizePx * 1.6 }}>
                  {currentLetters.length > 0 && (
                    <LetterDisplay
                      letters={currentLetters}
                      currentIndex={letterIndex}
                      results={letterResults}
                      fontSizePx={fontSizePx}
                    />
                  )}
                </div>

                {/* Letter counter */}
                <div className="flex gap-2">
                  {Array.from({ length: LETTERS_PER_ROW }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        i < letterIndex
                          ? letterResults[i]?.correct
                            ? 'bg-[#10B981]'
                            : 'bg-[#EF4444]'
                          : i === letterIndex
                          ? 'bg-[#2563EB] scale-125'
                          : 'bg-[#E2E8F0]'
                      }`}
                    />
                  ))}
                </div>

                {/* Feedback flash */}
                <AnimatePresence>
                  {lastResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`px-5 py-2 rounded-full font-semibold text-sm ${
                        lastResult.correct
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}
                    >
                      {lastResult.correct ? `✓ Correcto — ${lastResult.letter}` : `✗ Incorrecto — era ${lastResult.letter}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Voice listener */}
                <VoiceListener
                  isListening={isListening}
                  transcript={transcript}
                  onStart={startListening}
                  onSkip={skipLetter}
                  error={voiceError}
                  supported={speechSupported && hasMicPermission}
                  modelLoading={modelStatus === 'loading'}
                  modelProgress={modelProgress}
                />

                {/* Keyboard hint */}
                <p className="text-xs text-[#CBD5E1]">
                  También puedes presionar la letra en tu teclado · <kbd className="bg-[#F1F5F9] border border-[#E2E8F0] px-1 py-0.5 rounded text-[10px]">Esc</kbd> para omitir
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Header({ step }: { step: number }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/calibration" className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] transition-colors text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Calibración
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">Paso {step} de 3</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i < step ? 'w-6 bg-[#2563EB]' : 'w-3 bg-[#E2E8F0]'}`} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
