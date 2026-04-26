import { normalizeTranscript, type SpeechCallback } from './speech';

export type ModelStatus = 'loading' | 'ready' | 'error';

// Singleton: loaded once, reused across all instances
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelinePromise: Promise<any> | null = null;

async function loadPipeline(onProgress?: (p: number) => void) {
  if (!pipelinePromise) {
    // Dynamic import keeps it out of the SSR bundle
    const { pipeline, env } = await import('@xenova/transformers');
    env.allowLocalModels = false;
    pipelinePromise = pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        progress_callback: (data: { progress?: number }) => {
          if (data.progress !== undefined) onProgress?.(Math.round(data.progress));
        },
      },
    );
  }
  return pipelinePromise;
}

export class WhisperService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;
  private silenceInterval: ReturnType<typeof setInterval> | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  constructor(
    private onResult: SpeechCallback,
    private onError?: (err: string) => void,
    private onEnd?: () => void,
  ) {}

  static async preload(onStatus: (status: ModelStatus, progress?: number) => void) {
    onStatus('loading', 0);
    try {
      await loadPipeline((p) => onStatus('loading', p));
      onStatus('ready');
    } catch {
      onStatus('error');
    }
  }

  async start() {
    if (this.isRecording) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.onError?.('No se pudo acceder al micrófono.');
      this.onEnd?.();
      return;
    }

    this.audioChunks = [];
    this.isRecording = true;

    // Silence detection
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : undefined;
    this.mediaRecorder = new MediaRecorder(
      this.stream,
      mimeType ? { mimeType } : undefined,
    );
    this.mediaRecorder.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    });
    this.mediaRecorder.addEventListener('stop', () => this.processAudio());
    this.mediaRecorder.start(100);

    // Auto-stop on silence
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    let silenceMs = 0;
    let hasSpeech = false;
    this.silenceInterval = setInterval(() => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(freqData);
      const vol = freqData.reduce((a, b) => a + b, 0) / freqData.length;
      if (vol > 5) {
        hasSpeech = true;
        silenceMs = 0;
      } else {
        silenceMs += 100;
        if (hasSpeech && silenceMs >= 800) this.stopRecording();
      }
    }, 100);

    // Max 6s
    this.maxTimer = setTimeout(() => this.stopRecording(), 6000);
  }

  private stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    if (this.maxTimer) clearTimeout(this.maxTimer);
    if (this.silenceInterval) clearInterval(this.silenceInterval);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.audioCtx?.close();
    if (this.mediaRecorder?.state === 'recording') this.mediaRecorder.stop();
  }

  stop() {
    this.stopRecording();
  }

  private async processAudio() {
    if (!this.audioChunks.length) {
      this.onEnd?.();
      return;
    }
    try {
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      const ctx = new AudioContext({ sampleRate: 16000 });
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      await ctx.close();
      const float32 = decoded.getChannelData(0);

      const pipe = await loadPipeline();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: { text: string } = await pipe(float32, {
        language: 'spanish',
        task: 'transcribe',
      });
      const letters = normalizeTranscript(result.text);
      this.onResult(letters, result.text);
    } catch {
      this.onError?.('Error al transcribir el audio.');
    } finally {
      this.onEnd?.();
    }
  }

  get active() {
    return this.isRecording;
  }
}
