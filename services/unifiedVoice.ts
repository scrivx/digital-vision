import { WhisperService, type ModelStatus } from './whisper';
import {
  SpeechService,
  isSpeechSupported,
  type SpeechCallback,
} from './speech';

export type { ModelStatus };

// Unified voice service with Whisper as primary, SpeechService as fallback
export class UnifiedVoiceService {
  private whisper: WhisperService | null = null;
  private speech: SpeechService | null = null;
  private useWhisper = true;
  private isRunning = false;

  constructor(
    private onResult: SpeechCallback,
    private onError?: (err: string) => void,
    private onEnd?: () => void,
  ) {
    // Initialize Whisper service
    this.whisper = new WhisperService(
      (letters, raw) => {
        this.isRunning = false;
        this.onResult(letters, raw);
      },
      (err) => {
        console.warn('Whisper error, trying fallback:', err);
        this.tryFallback();
      },
      () => {
        this.isRunning = false;
        this.onEnd?.();
      },
    );

    // Initialize Speech service as fallback
    if (isSpeechSupported()) {
      this.speech = new SpeechService(
        (letters, raw) => {
          this.isRunning = false;
          this.onResult(letters, raw);
        },
        (err) => {
          this.isRunning = false;
          this.onError?.(err);
        },
        () => {
          this.isRunning = false;
          this.onEnd?.();
        },
      );
    }
  }

  private tryFallback() {
    if (this.speech && !this.isRunning) {
      console.log('Falling back to native SpeechRecognition');
      this.useWhisper = false;
      this.isRunning = true;
      this.speech.start();
    } else {
      this.onError?.('Ningún servicio de voz disponible.');
      this.onEnd?.();
    }
  }

  static async preload(
    onStatus: (status: ModelStatus, progress?: number) => void,
  ) {
    // Preload Whisper model
    await WhisperService.preload(onStatus);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.useWhisper = true;

    if (this.whisper) {
      this.whisper.start();
    } else {
      this.tryFallback();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.useWhisper && this.whisper) {
      this.whisper.stop();
    } else if (this.speech) {
      this.speech.stop();
    }
  }

  get active() {
    return this.isRunning;
  }

  get supportsWhisper(): boolean {
    return (
      typeof MediaRecorder !== 'undefined' &&
      typeof AudioContext !== 'undefined'
    );
  }

  get supportsNativeSpeech(): boolean {
    return isSpeechSupported();
  }
}
