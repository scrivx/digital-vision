'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CREDIT_CARD_WIDTH_MM,
  CREDIT_CARD_HEIGHT_MM,
  saveCalibration,
  estimateInitialWidth,
  pixelsPerMMFromReferenceWidth,
  clampReferenceWidth,
  DEFAULT_VIEWING_DISTANCE_MM,
} from '@/services/calibration';
import Link from 'next/link';

export default function CalibrationPage() {
  const router = useRouter();
  const [cardWidthPx, setCardWidthPx] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(320);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCardWidthPx(estimateInitialWidth());
  }, []);

  const cardHeightPx = (cardWidthPx / CREDIT_CARD_WIDTH_MM) * CREDIT_CARD_HEIGHT_MM;
  const pixelsPerMM = pixelsPerMMFromReferenceWidth(cardWidthPx);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartWidth(cardWidthPx);
    },
    [cardWidthPx],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = (e.clientX - dragStartX) * 2;
      const newWidth = clampReferenceWidth(dragStartWidth + delta, window.innerWidth);
      setCardWidthPx(Math.round(newWidth));
    },
    [isDragging, dragStartX, dragStartWidth],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardWidthPx(Number(e.target.value));
  };

  const handleConfirm = () => {
    saveCalibration({
      pixelsPerMM,
      referenceWidthPx: cardWidthPx,
      viewingDistanceMM: DEFAULT_VIEWING_DISTANCE_MM,
      calibratedAt: Date.now(),
    });
    setSaved(true);
    setTimeout(() => router.push('/test'), 600);
  };

  const minWidth = typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.15) : 150;
  const maxWidth = typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.85) : 900;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/instructions" className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Instrucciones
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Paso 2 de 3</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i <= 1 ? 'w-6 bg-[#2563EB]' : 'w-3 bg-[#E2E8F0]'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full mx-auto">
          {/* Title */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-blue-500/30 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-3">Calibración de pantalla</h1>
            <p className="text-[#475569]">
              Ajusta el rectángulo hasta que coincida exactamente con el tamaño de tu tarjeta bancaria.
            </p>
          </div>

          {/* Reference card display */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm mb-6 animate-slide-up">
            <p className="text-sm font-medium text-[#475569] text-center mb-6">
              Coloca tu tarjeta bancaria sobre la pantalla y ajusta el rectángulo hasta que coincidan
            </p>

            {/* Interactive card */}
            <div
              className="mx-auto relative select-none"
              style={{ width: cardWidthPx, height: cardHeightPx }}
            >
              <div
                className="w-full h-full rounded-xl border-2 border-[#2563EB] bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center relative overflow-hidden cursor-ew-resize"
                style={{ boxShadow: isDragging ? '0 0 0 3px rgba(37,99,235,0.3)' : '0 4px 20px rgba(37,99,235,0.15)' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* Card decoration */}
                <div className="absolute top-3 left-4 w-8 h-5 rounded bg-[#93C5FD]/60" />
                <div className="absolute bottom-3 left-4 right-4 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full bg-[#93C5FD]/40" />
                  ))}
                </div>
                <span className="text-[#2563EB] text-xs font-bold opacity-60 tracking-widest">
                  TARJETA DE REFERENCIA
                </span>

                {/* Drag handles */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-10 bg-[#2563EB] rounded-full flex items-center justify-center cursor-ew-resize shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="mt-6">
              <input
                type="range"
                min={minWidth}
                max={maxWidth}
                value={cardWidthPx}
                onChange={handleSlider}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2563EB ${((cardWidthPx - minWidth) / (maxWidth - minWidth)) * 100}%, #E2E8F0 0%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[#94A3B8] mt-1">
                <span>Más pequeño</span>
                <span>Más grande</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            {[
              { label: 'Ancho referencia', value: `${cardWidthPx}px` },
              { label: 'Tamaño real', value: `${CREDIT_CARD_WIDTH_MM}×${CREDIT_CARD_HEIGHT_MM.toFixed(0)}mm` },
              { label: 'Densidad estimada', value: `${pixelsPerMM.toFixed(2)} px/mm` },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-[#0F172A]">{s.value}</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Confirm */}
          <div className="text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={handleConfirm}
              disabled={saved}
              className={`inline-flex items-center gap-2 font-semibold text-base px-8 py-4 rounded-2xl shadow-lg transition-all duration-200 ${
                saved
                  ? 'bg-[#10B981] text-white shadow-emerald-500/30 scale-95'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {saved ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Calibración guardada
                </>
              ) : (
                <>
                  El tamaño coincide — Continuar
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-xs text-[#94A3B8] mt-3">Siguiente: test visual</p>
          </div>
        </div>
      </main>
    </div>
  );
}
