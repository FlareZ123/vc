/**
 * Controller for playing background SFX.
 * Keeps a looping AudioBufferSourceNode running at all times and adjusts gain
 * based on detected speech levels.
 */
class SFXController {
    constructor(ctx) {
        this.ctx = ctx;
        this.gainNode = ctx.createGain();
        this.gainNode.gain.value = 0;
        this.source = null;
        this.buffer = null;
        this.gain = 1;
        this.thresholdDb = -40;
        this.playing = false;
        this.silenceMs = 0;
    }

    /** Connect SFX output to another AudioNode. */
    connect(node) {
        this.gainNode.connect(node);
    }

    /** Load buffers to be looped. Only the first buffer is used currently. */
    load(buffers) {
        if (buffers.length === 0) return;
        this.buffer = buffers[0];
        this.createSource();
    }

    createSource() {
        if (!this.buffer) return;
        if (this.source) {
            try {
                this.source.stop();
            } catch (_) { /* noop */ }
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

    /** Adjust gain while active. */
    setGain(val) {
        this.gain = val;
        if (this.playing) this.gainNode.gain.value = val;
    }

    /** Update trigger threshold in dB. */
    setThreshold(db) {
        this.thresholdDb = db;
    }

    /** Update input level and start playback if exceeded. */
    updateInputLevel(db) {
        if (!this.playing && db > this.thresholdDb) {
            this.playing = true;
            this.gainNode.gain.value = this.gain;
        }
    }

    /** Update output level and stop playback after prolonged silence. */
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
