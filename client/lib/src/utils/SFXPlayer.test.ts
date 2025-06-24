import { SFXPlayer } from "./SFXPlayer";

class MockBufferSource {
    buffer: AudioBuffer | null = null;
    loop = false;
    connect = jest.fn();
    start = jest.fn();
    stop = jest.fn();
    disconnect = jest.fn();
}

class MockGain {
    gain = { value: 1 };
    connect = jest.fn();
}

class MockContext {
    createBufferSource = jest.fn(() => new MockBufferSource());
    createGain = jest.fn(() => new MockGain());
    decodeAudioData = jest.fn(async (_: ArrayBuffer) => ({} as AudioBuffer));
}

describe("SFXPlayer", () => {
    test("loadFiles failure", async () => {
        const ctx = new MockContext();
        ctx.decodeAudioData = jest.fn(() => Promise.reject(new Error("fail")));
        const player = new SFXPlayer(ctx as unknown as AudioContext);
        await expect(player.loadFiles({ length: 1, 0: new File([""], "a.wav") } as FileList)).rejects.toThrow();
    });

    test("start/stop and volume", async () => {
        const ctx = new MockContext();
        const player = new SFXPlayer(ctx as unknown as AudioContext);
        const file = new File(["\0\0"], "b.wav");
        await player.loadFiles({ length: 1, 0: file } as FileList);
        player.setVolume(0.5);
        expect((player as any).gainNode.gain.value).toBe(0.5);
        player.start();
        expect(ctx.createBufferSource).toBeCalled();
        player.stop();
        const src = (player as any).source as MockBufferSource | null;
        expect(src?.stop).toBeDefined();
    });
});
