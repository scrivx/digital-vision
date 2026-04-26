// Spanish letter name → uppercase letter
const SPANISH_MAP: Record<string, string> = {
  a: 'A', be: 'B', ce: 'C', se: 'C', de: 'D', e: 'E',
  efe: 'F', fe: 'F', ge: 'G', hache: 'H', i: 'I',
  jota: 'J', ka: 'K', ele: 'L', le: 'L', eme: 'M',
  ene: 'N', ne: 'N', eñe: 'Ñ', o: 'O', pe: 'P',
  cu: 'Q', erre: 'R', re: 'R', ese: 'S', te: 'T',
  u: 'U', uve: 'V', ve: 'V', 'doble uve': 'W', 'doble u': 'W',
  equis: 'X', ics: 'X', ye: 'Y', 'i griega': 'Y',
  ceta: 'Z', zeta: 'Z', cita: 'Z', ceda: 'Z',
};

export function normalizeTranscript(transcript: string): string[] {
  const clean = transcript.trim().toLowerCase();
  const letters: string[] = [];

  // Try multi-word Spanish names first (longest match)
  let remaining = clean;
  while (remaining.length > 0) {
    let matched = false;

    // Try two-word matches first
    const twoWordMatch = remaining.match(/^(\w+ \w+)/);
    if (twoWordMatch) {
      const candidate = twoWordMatch[1];
      if (SPANISH_MAP[candidate]) {
        letters.push(SPANISH_MAP[candidate]);
        remaining = remaining.slice(candidate.length).trim();
        matched = true;
      }
    }

    if (!matched) {
      const oneWordMatch = remaining.match(/^(\w+)/);
      if (oneWordMatch) {
        const word = oneWordMatch[1];
        // Direct single letter
        if (word.length === 1 && /[a-zA-Z]/.test(word)) {
          letters.push(word.toUpperCase());
        } else if (SPANISH_MAP[word]) {
          letters.push(SPANISH_MAP[word]);
        }
        remaining = remaining.slice(word.length).trim();
        matched = true;
      }
    }

    if (!matched) {
      remaining = remaining.slice(1).trim();
    }
  }

  return letters.filter(Boolean);
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export type SpeechCallback = (letters: string[], raw: string) => void;

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isRunning = false;

  constructor(
    private onResult: SpeechCallback,
    private onError?: (err: string) => void,
    private onEnd?: () => void,
  ) {}

  start(language: 'es-ES' | 'en-US' = 'es-ES') {
    if (this.isRunning) return;
    if (!isSpeechSupported()) {
      this.onError?.('Reconocimiento de voz no soportado en este navegador.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event) => {
      let best = '';
      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i].transcript;
        if (i === 0 || event.results[0][i].confidence > event.results[0][0].confidence) {
          best = alt;
        }
      }
      const letters = normalizeTranscript(best);
      this.onResult(letters, best);
    };

    this.recognition.onerror = (event) => {
      this.isRunning = false;
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      const messages: Record<string, string> = {
        network: 'Sin conexión al servicio de voz. Usa el teclado o verifica tu internet.',
        'not-allowed': 'Permiso de micrófono denegado.',
        'audio-capture': 'No se pudo acceder al micrófono.',
        'service-not-allowed': 'Servicio de voz no disponible en este navegador.',
      };
      this.onError?.(messages[event.error] ?? `Error de voz: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isRunning = false;
      this.onEnd?.();
    };

    this.recognition.start();
    this.isRunning = true;
  }

  stop() {
    if (this.recognition && this.isRunning) {
      this.recognition.stop();
      this.isRunning = false;
    }
  }

  get active() {
    return this.isRunning;
  }
}
