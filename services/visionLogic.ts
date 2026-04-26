export const SNELLEN_LETTERS = ['F', 'P', 'T', 'O', 'Z', 'L', 'D', 'E', 'C', 'N'] as const;
export type SnellenLetter = (typeof SNELLEN_LETTERS)[number];

export interface TestRow {
  id: number;
  acuity: string;
  denominator: number;
  label: string;
  description: string;
}

export interface LetterResult {
  expected: SnellenLetter;
  spoken: string;
  correct: boolean;
}

export interface RowResult {
  row: TestRow;
  letters: SnellenLetter[];
  results: LetterResult[];
  score: number; // 0-1
  passed: boolean;
}

export interface TestResult {
  rows: RowResult[];
  finalAcuity: string;
  finalDenominator: number;
  level: 'excellent' | 'good' | 'moderate' | 'low' | 'very-low';
  levelLabel: string;
  recommendations: string[];
  timestamp: number;
  eye: 'both' | 'left' | 'right';
}

export const TEST_ROWS: TestRow[] = [
  { id: 1, acuity: '20/200', denominator: 200, label: 'Nivel 1', description: 'Muy baja' },
  { id: 2, acuity: '20/100', denominator: 100, label: 'Nivel 2', description: 'Baja' },
  { id: 3, acuity: '20/70',  denominator: 70,  label: 'Nivel 3', description: 'Moderada-baja' },
  { id: 4, acuity: '20/50',  denominator: 50,  label: 'Nivel 4', description: 'Moderada' },
  { id: 5, acuity: '20/40',  denominator: 40,  label: 'Nivel 5', description: 'Aceptable' },
  { id: 6, acuity: '20/30',  denominator: 30,  label: 'Nivel 6', description: 'Buena' },
  { id: 7, acuity: '20/25',  denominator: 25,  label: 'Nivel 7', description: 'Muy buena' },
  { id: 8, acuity: '20/20',  denominator: 20,  label: 'Nivel 8', description: 'Normal' },
  { id: 9, acuity: '20/15',  denominator: 15,  label: 'Nivel 9', description: 'Excelente' },
];

// Letter height in pixels given screen PPI and viewing distance
// Uses the standard: letter height = 2 × distance × tan(denominator/4 arc-minutes)
export function getLetterHeightPx(denominator: number, pixelsPerMM: number, viewingDistanceMM = 3000): number {
  const arcMinutes = denominator / 4;
  const heightMM = 2 * viewingDistanceMM * Math.tan((arcMinutes * Math.PI) / (60 * 180));
  return heightMM * pixelsPerMM;
}

// Fallback sizes (px) when calibration is not available — calibrated for ~60cm typical laptop distance
export const FALLBACK_SIZES: Record<number, number> = {
  200: 192,
  100: 96,
  70:  67,
  50:  48,
  40:  38,
  30:  29,
  25:  24,
  20:  19,
  15:  14,
};

export function generateRowLetters(count = 5): SnellenLetter[] {
  const letters: SnellenLetter[] = [];
  let last: SnellenLetter | null = null;
  while (letters.length < count) {
    const candidate = SNELLEN_LETTERS[Math.floor(Math.random() * SNELLEN_LETTERS.length)];
    if (candidate !== last) {
      letters.push(candidate);
      last = candidate;
    }
  }
  return letters;
}

export function evaluateRow(results: LetterResult[]): { score: number; passed: boolean } {
  const correct = results.filter((r) => r.correct).length;
  const score = correct / results.length;
  return { score, passed: score >= 0.6 }; // 3/5 minimum
}

export function computeFinalResult(rows: RowResult[]): Pick<TestResult, 'finalAcuity' | 'finalDenominator' | 'level' | 'levelLabel' | 'recommendations'> {
  const lastPassed = [...rows].reverse().find((r) => r.passed);
  const denominator = lastPassed?.row.denominator ?? 200;
  const acuity = lastPassed?.row.acuity ?? '20/200';

  let level: TestResult['level'];
  let levelLabel: string;
  let recommendations: string[];

  if (denominator <= 20) {
    level = 'excellent';
    levelLabel = 'Excelente';
    recommendations = ['Tu visión está en un nivel excelente.', 'Mantén revisiones anuales de rutina con tu oftalmólogo.'];
  } else if (denominator <= 30) {
    level = 'good';
    levelLabel = 'Buena';
    recommendations = ['Tu visión es buena.', 'Considera una revisión oftalmológica de rutina.'];
  } else if (denominator <= 50) {
    level = 'moderate';
    levelLabel = 'Moderada';
    recommendations = ['Es posible que necesites corrección visual.', 'Consulta a un profesional para una evaluación completa.'];
  } else if (denominator <= 100) {
    level = 'low';
    levelLabel = 'Reducida';
    recommendations = ['Tu agudeza visual parece reducida en esta prueba.', 'Acude a un oftalmólogo para una evaluación clínica completa.', 'No pospongas la consulta si tienes dificultades visuales.'];
  } else {
    level = 'very-low';
    levelLabel = 'Muy reducida';
    recommendations = ['Esta prueba detectó dificultad visual significativa.', 'Acude a un oftalmólogo a la brevedad posible.', 'Recuerda: esta herramienta no es un diagnóstico médico.'];
  }

  return { finalAcuity: acuity, finalDenominator: denominator, level, levelLabel, recommendations };
}
