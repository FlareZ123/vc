/**
 * Simple sound effects player for client side usage.
 * Manages an {@link AudioBufferSourceNode} with looping and volume control.
 * Every loaded audio buffer will be played in a loop when {@link start} is invoked.
 */
export class SFXPlayer {
    private readonly ctx: AudioContext;
    private readonly gainNode: GainNode;
    private buffers: AudioBuffer[] = [];
    private source: AudioBufferSourceNode | null = null;

    /** Last selected buffer index. */
    private currentIndex = 0;

    /**
     * @param ctx Existing {@link AudioContext} instance.
     */
    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 1.0;
    }

    /**
     * Audio destination node for this player.
     * Connect this to an output chain.
     */
    get output(): GainNode {
        return this.gainNode;
    }

    /**
     * Loads the given WAV files into memory.
     * @param files File list from an input element.
     * @throws Error when decoding fails or no files are provided.
     */
    async loadFiles(files: FileList): Promise<void> {
        if (!files || files.length === 0) {
            throw new Error("No files provided");
        }
        this.buffers = [];
        for (const file of Array.from(files)) {
            const buf = await file.arrayBuffer();
            try {
                const decoded = await this.ctx.decodeAudioData(buf);
                this.buffers.push(decoded);
            } catch (e) {
                throw new Error(`Failed to decode ${file.name}`);
            }
        }
    }

    /**
     * Starts playback.
     * @param loopIndex Optional index of the loaded buffer to play.
     */
    start(loopIndex = 0): void {
        if (!this.buffers[loopIndex]) {
            console.warn("SFXPlayer: buffer index out of range");
            return;
        }
        this.stop();
        this.currentIndex = loopIndex;
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffers[loopIndex];
        src.loop = true;
        src.connect(this.gainNode);
        src.start();
        this.source = src;
    }

    /** Stops playback if active. */
    stop(): void {
        if (this.source) {
            try {
                this.source.stop();
            } catch (e) {
                // ignore already stopped errors
            }
            this.source.disconnect();
            this.source = null;
        }
    }

    /**
     * Sets the volume for playback.
     * @param volume Gain value from 0.0 to 1.0.
     */
    setVolume(volume: number): void {
        this.gainNode.gain.value = volume;
    }
}
