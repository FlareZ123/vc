// @ts-nocheck
const { SfxManager } = require("./SfxManager");

class FakeGainNode {
    gain = { value: 1 };
    connect() {}
    disconnect() {}
}

class FakeAnalyserNode {
    fftSize = 32;
    connect() {}
    disconnect() {}
    getFloatTimeDomainData(buf) {
        buf.fill(0);
    }
}

class FakeBufferSourceNode {
    loop = false;
    buffer = null;
    connect() {}
    disconnect() {}
    start() {}
    stop() {}
}

class FakeAudioContext {
    currentTime = 0;
    createGain() {
        return new FakeGainNode();
    }
    createAnalyser() {
        return new FakeAnalyserNode();
    }
    createBufferSource() {
        return new FakeBufferSourceNode();
    }
    decodeAudioData() {
        return Promise.resolve({});
    }
}

describe("SfxManager", () => {
    test("loadBuffers stores audio buffers", async () => {
        const ctx = new FakeAudioContext();
        global.fetch = jest.fn().mockResolvedValue({
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
        });

        const mgr = new SfxManager(ctx, 0.5, 0.1, 1000);
        await mgr.loadBuffers(["a", "b"]);

        expect(mgr["buffers"].length).toBe(2);
    });

    test("start/stop monitoring", () => {
        const ctx = new FakeAudioContext();
        const mgr = new SfxManager(ctx, 0.5, 0.1, 1000);

        mgr.startMonitoring({ connect() {} }, { connect() {} });
        expect(mgr["monitorTimer"]).not.toBeNull();

        mgr.stopMonitoring();
        expect(mgr["monitorTimer"]).toBeNull();
    });
});

