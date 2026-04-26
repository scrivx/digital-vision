'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SnellenLetter } from '@/services/visionLogic';

interface LetterDisplayProps {
  letters: SnellenLetter[];
  currentIndex: number;
  results: { correct: boolean | null }[];
  fontSizePx: number;
}

export default function LetterDisplay({ letters, currentIndex, results, fontSizePx }: LetterDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-[0.2em] w-full">
      <AnimatePresence mode="wait">
        {letters.map((letter, i) => {
          const result = results[i];
          const isCurrent = i === currentIndex;
          const isDone = i < currentIndex;

          let letterColor = '#0F172A';
          let bgClass = '';

          if (isDone && result) {
            letterColor = result.correct === true ? '#059669' : '#DC2626';
            bgClass = result.correct === true ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]';
          } else if (isCurrent) {
            bgClass = 'bg-[#EFF6FF]';
          }

          return (
            <motion.span
              key={`${letter}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
              className={`snellen-letter inline-flex items-center justify-center rounded-lg transition-all ${bgClass} ${isCurrent ? 'ring-2 ring-[#2563EB] ring-offset-2' : ''}`}
              style={{
                fontSize: fontSizePx,
                color: letterColor,
                width: fontSizePx * 1.2,
                height: fontSizePx * 1.4,
              }}
            >
              {letter}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
