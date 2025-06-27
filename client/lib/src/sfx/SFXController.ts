/**
 * Controller responsible for playing a looping sound effect (SFX).
 *
 * The SFX audio is kept playing in the background and its gain is
 * automatically adjusted based on the detected input and output levels.
 * Type information is provided via JSDoc so the file can be executed as
 * plain JavaScript while still offering IntelliSense in editors.
 */
class SFXController {
    /**
     * @param {AudioContext} ctx Web Audio context used to create nodes.
     */
    constructor(ctx) {
        /** @private @type {AudioContext} */
        this.ctx = ctx;
        /** @private @type {GainNode} */
        this.gainNode = ctx.createGain();
        this.gainNode.gain.value = 0;
        /** @private @type {AudioBufferSourceNode|null} */
        this.source = null;
        /** @private @type {AudioBuffer|null} */
        this.buffer = null;
        /** @private @type {number} */
        this.gain = 1;
        /** @private @type {number} */
        this.thresholdDb = -40;
        /** @public @type {boolean} */
        this.playing = false;
        /** @private @type {number} */
        this.silenceMs = 0;
    }

    /**
     * Connect the SFX output to another node.
     * @param {AudioNode} node destination node
     */
    connect(node) {
        this.gainNode.connect(node);
    }

    /**
     * Load the sound effect buffer.
     * Only the first buffer of the array is used currently.
     * @param {AudioBuffer[]} buffers buffers with SFX data
     */
    load(buffers) {
        if (buffers.length === 0) return;
        this.buffer = buffers[0];
        this._createSource();
    }

    /** @private */
    _createSource() {
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
    setGain(val) {
        this.gain = val;
        if (this.playing) this.gainNode.gain.value = val;
    }

    /**
     * Set the dB threshold that triggers playback.
     * @param {number} db threshold in decibels
     */
    setThreshold(db) {
        this.thresholdDb = db;
    }

    /**
     * Notify the controller of the current input level.
     * Playback starts once the threshold is exceeded.
     * @param {number} db input level in dB
     */
    updateInputLevel(db) {
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
    updateOutputLevel(db, dtMs) {
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

module.exports = { SFXController };
