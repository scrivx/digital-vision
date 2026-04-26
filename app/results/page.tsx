'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { TestResult } from '@/services/visionLogic';
import Link from 'next/link';

const levelConfig: Record<
  TestResult['level'],
  { color: string; bg: string; ring: string; icon: React.ReactNode; gradient: string }
> = {
  excellent: {
    color: 'text-[#059669]',
    bg: 'bg-[#ECFDF5]',
    ring: 'ring-[#6EE7B7]',
    gradient: 'from-[#ECFDF5] to-[#D1FAE5]',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  good: {
    color: 'text-[#2563EB]',
    bg: 'bg-[#EFF6FF]',
    ring: 'ring-[#93C5FD]',
    gradient: 'from-[#EFF6FF] to-[#DBEAFE]',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  moderate: {
    color: 'text-[#D97706]',
    bg: 'bg-[#FFFBEB]',
    ring: 'ring-[#FCD34D]',
    gradient: 'from-[#FFFBEB] to-[#FEF3C7]',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  low: {
    color: 'text-[#EA580C]',
    bg: 'bg-[#FFF7ED]',
    ring: 'ring-[#FD8A4B]',
    gradient: 'from-[#FFF7ED] to-[#FFEDD5]',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  'very-low': {
    color: 'text-[#DC2626]',
    bg: 'bg-[#FEF2F2]',
    ring: 'ring-[#FCA5A5]',
    gradient: 'from-[#FEF2F2] to-[#FEE2E2]',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
};

function AcuityMeter({ denominator }: { denominator: number }) {
  const max = 200;
  const min = 15;
  // Invert: lower denominator = better vision (higher on bar)
  const percent = Math.max(0, Math.min(100, ((max - denominator) / (max - min)) * 100));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-40 w-3 bg-[#E2E8F0] rounded-full overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-[#2563EB] to-[#3B82F6]"
          initial={{ height: 0 }}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-[#94A3B8] font-medium">Agudeza</span>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dvt_result');
      if (raw) {
        setResult(JSON.parse(raw) as TestResult);
      } else {
        router.replace('/');
      }
    } catch {
      router.replace('/');
    }
    setLoading(false);
  }, [router]);

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
      </div>
    );
  }

  const cfg = levelConfig[result.level];
  const passedRows = result.rows.filter((r) => r.passed);
  const totalCorrect = result.rows.reduce((s, r) => s + r.results.filter((l) => l.correct).length, 0);
  const totalLetters = result.rows.reduce((s, r) => s + r.results.length, 0);
  const accuracy = totalLetters > 0 ? Math.round((totalCorrect / totalLetters) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="4" />
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
              </svg>
            </div>
            <span className="font-bold text-[#0F172A] text-sm">Digital Vision Test</span>
          </Link>
          <span className="text-xs text-[#94A3B8]">
            {new Date(result.timestamp).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Hero result card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${cfg.gradient} border ${cfg.ring.replace('ring', 'border')} rounded-3xl p-8 mb-6 text-center relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-current transform translate-x-16 -translate-y-16" />
          </div>

          <div className="relative z-10">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${cfg.bg} ${cfg.color} ring-4 ${cfg.ring} mx-auto mb-4`}>
              {cfg.icon}
            </div>

            <div className="flex items-center justify-center gap-6 mb-4">
              <AcuityMeter denominator={result.finalDenominator} />
              <div>
                <p className="text-sm text-[#475569] font-medium mb-1">Agudeza visual estimada</p>
                <p className="text-6xl font-black text-[#0F172A] tracking-tight leading-none mb-2">
                  {result.finalAcuity}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
                  {result.levelLabel}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
              Resultado estimado — no equivale a un diagnóstico clínico
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: 'Filas superadas', value: `${passedRows.length}/${result.rows.length}` },
            { label: 'Letras correctas', value: `${totalCorrect}/${totalLetters}` },
            { label: 'Precisión', value: `${accuracy}%` },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-[#0F172A]">{s.value}</div>
              <div className="text-xs text-[#94A3B8] mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm"
          >
            <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Recomendaciones
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                  <svg className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  {rec}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Row breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm"
          >
            <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zm-3.75 3c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 019 19.875v-8.25z" />
              </svg>
              Detalle por fila
            </h3>
            <div className="space-y-2">
              {result.rows.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#94A3B8] w-12 flex-shrink-0">{row.row.acuity}</span>
                  <div className="flex-1 flex gap-1">
                    {row.results.map((r, j) => (
                      <div
                        key={j}
                        className={`flex-1 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white ${r.correct ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                        title={r.expected}
                      >
                        {r.expected}
                      </div>
                    ))}
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${row.passed ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                    {row.passed ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 mb-8"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-[#78350F] leading-relaxed">
              <strong>Aviso legal:</strong> Este resultado es una <strong>estimación</strong> basada en condiciones no controladas (distancia, calibración, iluminación). No reemplaza la evaluación de un oftalmólogo certificado. Si tienes dudas sobre tu visión, consulta a un profesional de la salud visual.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/test"
            className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => localStorage.removeItem('dvt_result')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Repetir test
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
