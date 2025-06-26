import { SfxManager } from '../SfxManager';

test('start and stop playback', () => {
    const ctx = {
        createGain: () => ({ connect: jest.fn(), gain: { value: 1 } }),
        createBufferSource: () => ({
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            loop: false,
            buffer: undefined as any,
            disconnect: jest.fn(),
        }),
        createAnalyser: () => ({
            fftSize: 32,
            connect: jest.fn(),
            disconnect: jest.fn(),
            getFloatTimeDomainData: (arr: Float32Array) => arr.fill(0),
        }),
        decodeAudioData: async (_: ArrayBuffer) => ({ length: 0 } as AudioBuffer),
        currentTime: 0,
    } as unknown as AudioContext;
    const mgr = new SfxManager(ctx, 1, 0.1, 100);
    mgr.connect({} as AudioNode);
    // fake buffer
    (mgr as any).buffers = [{} as AudioBuffer];
    mgr.start();
    expect((mgr as any).active).toBe(true);
    mgr.stop();
    expect((mgr as any).active).toBe(false);
});
