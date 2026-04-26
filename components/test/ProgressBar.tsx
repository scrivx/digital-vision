'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentRow: number;
  totalRows: number;
  acuity: string;
}

export default function ProgressBar({ currentRow, totalRows, acuity }: ProgressBarProps) {
  const progress = ((currentRow - 1) / totalRows) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#475569]">
          Fila {currentRow} de {totalRows}
        </span>
        <span className="text-xs font-semibold text-[#2563EB]">{acuity}</span>
      </div>
      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
