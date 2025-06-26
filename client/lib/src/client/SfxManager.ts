/**
 * Manages playback of background sound effects based on real microphone and
 * processed output levels.  When microphone input rises above a configurable
 * threshold, a preloaded wav file is started and plays in a seamless loop.  The
 * playback stops once the processed audio has been silent for the specified
 * delay period.  All nodes are created from the provided {@link AudioContext} so
 * the instance can work in either the main thread or an OfflineAudioContext for
 * testing.
 */
export class SfxManager {
    private readonly gainNode: GainNode;
    /** Currently loaded audio buffers. */
    private buffers: AudioBuffer[] = [];
    /** Source node currently playing. */
    private source: AudioBufferSourceNode | null = null;
    /** Analyser monitoring microphone input. */
    private inputAnalyser: AnalyserNode | null = null;
    /** Analyser monitoring processed output. */
    private outputAnalyser: AnalyserNode | null = null;
    /** Interval timer ID for activity monitoring. */
    private monitorTimer: number | null = null;
    /** Time in seconds when output was last above threshold. */
    private lastOutputActive = 0;
    /** True while playback is active. */
    private active = false;

    constructor(
        private ctx: AudioContext,
        gain: number,
        /** Input/output RMS threshold to start/stop playback. */
        private startThreshold: number,
        /** Delay in milliseconds to wait after silence before stopping. */
        private stopDelay: number,
    ) {
        this.gainNode = ctx.createGain();
        this.gainNode.gain.value = gain;
    }

    /**
     * Connects the internal gain node to a destination.
     * @param dest - destination AudioNode
     */
    connect(dest: AudioNode): void {
        this.gainNode.connect(dest);
    }

    /**
     * Updates the output gain of the looped sound effect.
     * @param val - gain value [0..1]
     */
    setGain(val: number): void {
        this.gainNode.gain.value = val;
    }

    /**
     * Loads wav files from URLs and decodes them to {@link AudioBuffer}s.
     * Existing buffers are replaced.  Any errors during fetch or decode will
     * abort the entire operation.
     */
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
     * Attaches analyser nodes to monitor voice activity from the given input and
     * output nodes.  Existing monitors and timers are cleared.
     *
     * @param inputNode - node carrying the microphone audio
     * @param outputNode - node carrying the processed output audio
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

    /**
     * Stops analysing activity and any currently playing background sound.
     * All created nodes are disconnected.
     */
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

    /**
     * Calculates the root mean square of the signal from an analyser node.
     */
    private computeRms(analyser: AnalyserNode | null): number {
        if (!analyser) return 0;
        const buf = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        return Math.sqrt(sum / buf.length);
    }

    /**
     * Internal periodic callback that checks input/output levels and decides
     * when playback should start or stop.
     */
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

    /** Start playing the first loaded buffer in a seamless loop. */
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
