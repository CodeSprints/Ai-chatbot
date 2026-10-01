// Records mic audio into a self-contained WAV (16-bit PCM mono @16kHz)
// so the transcription endpoint always gets a complete decodable file.

export class WavRecorder {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private chunks: Float32Array[] = [];
  private sampleRate = 44100;

  async start() {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new AC();
    this.sampleRate = this.ctx.sampleRate;
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0);
      this.chunks.push(new Float32Array(data));
    };
    this.source.connect(this.processor);
    this.processor.connect(this.ctx.destination);
  }

  async stop(): Promise<Blob> {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.processor?.disconnect();
    this.source?.disconnect();
    const rate = this.sampleRate;
    const chunks = this.chunks;
    await this.ctx?.close();
    this.ctx = null;
    this.stream = null;
    this.processor = null;
    this.source = null;

    // Concatenate
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Float32Array(total);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }

    // Downsample to 16k
    const targetRate = 16000;
    const downsampled = downsample(merged, rate, targetRate);
    return encodeWav(downsampled, targetRate);
  }
}

function downsample(input: Float32Array, from: number, to: number): Float32Array {
  if (to >= from) return input;
  const ratio = from / to;
  const newLen = Math.round(input.length / ratio);
  const out = new Float32Array(newLen);
  let pos = 0;
  for (let i = 0; i < newLen; i++) {
    const nextPos = Math.round((i + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (let j = pos; j < nextPos && j < input.length; j++) {
      sum += input[j];
      count++;
    }
    out[i] = count > 0 ? sum / count : 0;
    pos = nextPos;
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}