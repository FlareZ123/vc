/**
 * Simple post-processing sound effects player.
 * It keeps playing configured SFX audio and injects it
 * into the destination node when triggered by input/output
 * volume thresholds.
 */
export type SFXPlayerConfig = {
  /** Audio context to operate on */
  context: AudioContext;
  /** Destination node for audio injection */
  destination: AudioNode;
  /** Directory containing index.json and wav files */
  directory: string;
  /** dB threshold for starting playback */
  thresholdDb: number;
  /** Gain applied when playing */
  gain: number;
};

export class SFXPlayer {
  private ctx: AudioContext;
  private destination: AudioNode;
  private directory: string;
  private thresholdDb: number;
  private gain: number;
  private gainNode: GainNode;
  private source: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  private playing = false;
  private lastActive = 0;

  constructor(config: SFXPlayerConfig) {
    this.ctx = config.context;
    this.destination = config.destination;
    this.directory = config.directory;
    this.thresholdDb = config.thresholdDb;
    this.gain = config.gain;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0;
    this.gainNode.connect(this.destination);
  }

  /**
   * Reloads wav files from directory and starts gapless looping.
   */
  public async reload(): Promise<void> {
    const res = await fetch(`${this.directory}/index.json`);
    const files = (await res.json()) as string[];
    const buffers: AudioBuffer[] = [];
    for (const file of files) {
      try {
        const r = await fetch(`${this.directory}/${file}`);
        const ab = await r.arrayBuffer();
        const b = await this.ctx.decodeAudioData(ab);
        buffers.push(b);
      } catch (e) {
        // ignore fetch errors
      }
    }
    if (buffers.length === 0) {
      return;
    }
    const ch = Math.max(...buffers.map((b) => b.numberOfChannels));
    const total = buffers.reduce((p, b) => p + b.length, 0);
    this.buffer = this.ctx.createBuffer(ch, total, this.ctx.sampleRate);
    let offset = 0;
    for (const b of buffers) {
      for (let c = 0; c < ch; c++) {
        const dest = this.buffer.getChannelData(c);
        dest.set(b.getChannelData(Math.min(c, b.numberOfChannels - 1)), offset);
      }
      offset += b.length;
    }
    if (this.source) {
      try {
        this.source.stop();
      } catch {}
    }
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start();
  }

  /**
   * Update playback gain.
   */
  public setGain(val: number): void {
    this.gain = val;
    if (this.playing) {
      this.gainNode.gain.value = val;
    }
  }

  /**
   * Update dB threshold.
   */
  public setThreshold(db: number): void {
    this.thresholdDb = db;
  }

  /**
   * Compute dB from PCM samples.
   */
  public static computeDb(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    return 20 * Math.log10(rms || 1e-4);
  }

  /**
   * Notify mic input level.
   */
  public notifyInputLevel(db: number): void {
    if (!this.buffer) return;
    if (!this.playing && db > this.thresholdDb) {
      this.playing = true;
      this.gainNode.gain.value = this.gain;
      this.lastActive = this.ctx.currentTime * 1000;
    }
  }

  /**
   * Notify processed output level. Stops playback after
   * 1300ms of silence.
   */
  public notifyOutputLevel(db: number): void {
    if (!this.playing) return;
    if (db > this.thresholdDb) {
      this.lastActive = this.ctx.currentTime * 1000;
      return;
    }
    if (this.ctx.currentTime * 1000 - this.lastActive > 1300) {
      this.playing = false;
      this.gainNode.gain.value = 0;
    }
  }
}
