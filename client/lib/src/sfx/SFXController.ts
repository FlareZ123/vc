/**
 * Controller responsible for playing a looping sound effect (SFX).
 *
 * The SFX audio is kept playing in the background and its gain is
 * automatically adjusted based on the detected input and output levels.
 * Type information is provided via JSDoc so the file can be executed as
 * plain JavaScript while still offering IntelliSense in editors.
 */
export class SFXController {
    /** Web Audio context used to create nodes. */
    private ctx: AudioContext;
    /** Output gain node controlling the SFX volume. */
    private gainNode: GainNode;
    /** Currently playing buffer source. */
    private source: AudioBufferSourceNode | null = null;
    /** Audio buffer used for looping playback. */
    private buffer: AudioBuffer | null = null;
    /** Gain applied when playback is active. */
    private gain = 1;
    /** Threshold in decibels that triggers playback. */
    private thresholdDb = -40;
    /** True if playback is currently audible. */
    public playing = false;
    /** Milliseconds of accumulated silence in the output. */
    private silenceMs = 0;

    /**
     * Create a new controller.
     * @param ctx WebAudio context that will own created nodes.
     */
    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.gainNode = ctx.createGain();
        this.gainNode.gain.value = 0;
    }

    /**
     * Connect the SFX output to another node.
     * @param {AudioNode} node destination node
     */
    connect(node: AudioNode): void {
        this.gainNode.connect(node);
    }

    /**
     * Load the sound effect buffer.
     * Only the first buffer of the array is used currently.
     * @param {AudioBuffer[]} buffers buffers with SFX data
     */
    load(buffers: AudioBuffer[]): void {
        if (buffers.length === 0) return;
        this.buffer = buffers[0];
        this._createSource();
    }

    /** @private */
    private _createSource(): void {
        if (!this.buffer) return;
        if (this.source) {
            try {
                this.source.stop();
            } catch (e) {
                /* ignore */
            }
            this.source.disconnect();
        }
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffer;
        src.loop = true;
        const offset = Math.random() * this.buffer.duration;
        src.connect(this.gainNode);
        src.start(0, offset);
        this.source = src;
    }

    /**
     * Set the gain to apply while playback is active.
     * @param {number} val gain value
     */
    setGain(val: number): void {
        this.gain = val;
        if (this.playing) this.gainNode.gain.value = val;
    }

    /**
     * Set the dB threshold that triggers playback.
     * @param {number} db threshold in decibels
     */
    setThreshold(db: number): void {
        this.thresholdDb = db;
    }

    /**
     * Notify the controller of the current input level.
     * Playback starts once the threshold is exceeded.
     * @param {number} db input level in dB
     */
    updateInputLevel(db: number): void {
        if (!this.playing && db > this.thresholdDb) {
            this.playing = true;
            this.gainNode.gain.value = this.gain;
        }
    }

    /**
     * Notify the controller of the current output level.
     * Playback stops after 1300ms of silence under the threshold.
     * @param {number} db output level in dB
     * @param {number} dtMs elapsed milliseconds since last update
     */
    updateOutputLevel(db: number, dtMs: number): void {
        if (!this.playing) return;
        if (db < this.thresholdDb) {
            this.silenceMs += dtMs;
            if (this.silenceMs >= 1300) {
                this.playing = false;
                this.gainNode.gain.value = 0;
                this.silenceMs = 0;
            }
        } else {
            this.silenceMs = 0;
        }
    }
}

