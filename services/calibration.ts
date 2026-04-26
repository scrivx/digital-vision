export const CREDIT_CARD_WIDTH_MM = 85.6;
export const CREDIT_CARD_HEIGHT_MM = 53.98;
export const DEFAULT_VIEWING_DISTANCE_MM = 3000; // 3 meters

export interface CalibrationData {
  pixelsPerMM: number;
  referenceWidthPx: number;
  viewingDistanceMM: number;
  calibratedAt: number;
}

export const CALIBRATION_KEY = 'dvt_calibration';

export function saveCalibration(data: CalibrationData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify(data));
  }
}

export function loadCalibration(): CalibrationData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    return raw ? (JSON.parse(raw) as CalibrationData) : null;
  } catch {
    return null;
  }
}

export function pixelsPerMMFromReferenceWidth(refWidthPx: number): number {
  return refWidthPx / CREDIT_CARD_WIDTH_MM;
}

// Clamp reference width to a reasonable range
export function clampReferenceWidth(px: number, viewportWidth: number): number {
  const min = viewportWidth * 0.15;
  const max = viewportWidth * 0.85;
  return Math.max(min, Math.min(max, px));
}

// Estimate initial reference width based on window devicePixelRatio and typical screen DPI
export function estimateInitialWidth(): number {
  if (typeof window === 'undefined') return 300;
  // Typical laptop: ~96 DPI × devicePixelRatio, credit card = 85.6mm = 3.37 inches
  const estimatedDPI = 96 * (window.devicePixelRatio || 1);
  const estimatedPx = (CREDIT_CARD_WIDTH_MM / 25.4) * estimatedDPI;
  return Math.round(estimatedPx);
}
