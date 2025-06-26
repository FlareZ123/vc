/**
 * Manages playback of background sound effects.
 */
export class SfxManager {
    private readonly gainNode: GainNode;
    private buffers: AudioBuffer[] = [];
    private source: AudioBufferSourceNode | null = null;
    private inputAnalyser: AnalyserNode | null = null;
    private outputAnalyser: AnalyserNode | null = null;
    private monitorTimer: number | null = null;
    private lastOutputActive = 0;
    private active = false;

    constructor(private ctx: AudioContext, gain: number, private startThreshold: number, private stopDelay: number) {
        this.gainNode = ctx.createGain();
        this.gainNode.gain.value = gain;
    }

    /** Connect SFX to destination. */
    connect(dest: AudioNode): void {
        this.gainNode.connect(dest);
    }

    /** Set output gain of the sound effect. */
    setGain(val: number): void {
        this.gainNode.gain.value = val;
    }

    /** Load wav files as AudioBuffers. */
    async loadBuffers(urls: string[]): Promise<void> {
        const bufs: AudioBuffer[] = [];
        for (const url of urls) {
            const res = await fetch(url);
            const arr = await res.arrayBuffer();
            const buf = await this.ctx.decodeAudioData(arr);
            bufs.push(buf);
        }
        this.buffers = bufs;
    }

    /**
     * Attach monitoring nodes to detect voice activity.
     * @param inputNode Node that contains real microphone audio.
     * @param outputNode Node that contains processed audio.
     */
    startMonitoring(inputNode: AudioNode, outputNode: AudioNode): void {
        this.stopMonitoring();
        this.inputAnalyser = this.ctx.createAnalyser();
        this.outputAnalyser = this.ctx.createAnalyser();
        inputNode.connect(this.inputAnalyser);
        outputNode.connect(this.outputAnalyser);
        this.lastOutputActive = this.ctx.currentTime;
        this.monitorTimer = setInterval(() => this.checkActivity(), 100) as unknown as number;
    }

    /** Stop monitoring and playback. */
    stopMonitoring(): void {
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
            this.monitorTimer = null;
        }
        if (this.inputAnalyser) this.inputAnalyser.disconnect();
        if (this.outputAnalyser) this.outputAnalyser.disconnect();
        this.inputAnalyser = null;
        this.outputAnalyser = null;
        this.stop();
    }

    private computeRms(analyser: AnalyserNode | null): number {
        if (!analyser) return 0;
        const buf = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        return Math.sqrt(sum / buf.length);
    }

    private checkActivity(): void {
        const micLevel = this.computeRms(this.inputAnalyser);
        const outLevel = this.computeRms(this.outputAnalyser);

        if (micLevel >= this.startThreshold && !this.active) {
            this.start();
        }
        if (outLevel >= this.startThreshold) {
            this.lastOutputActive = this.ctx.currentTime;
        } else if (this.active && (this.ctx.currentTime - this.lastOutputActive) * 1000 > this.stopDelay) {
            this.stop();
        }
    }

    /** Start playing the selected sound effect in a loop. */
    start(): void {
        if (this.active || this.buffers.length === 0) return;
        const buffer = this.buffers[0];
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(this.gainNode);
        src.start();
        this.source = src;
        this.active = true;
    }

    /** Stop playback if active. */
    stop(): void {
        if (this.source) {
            this.source.stop();
            this.source.disconnect();
            this.source = null;
        }
        this.active = false;
    }
}
