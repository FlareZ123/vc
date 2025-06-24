import { VoiceChangerWorkletNode } from "./VoiceChangerWorkletNode";
import { SFXPlayer } from "../utils/SFXPlayer";

global.AudioWorkletNode = class {
    port = { onmessage: (_: any) => {}, postMessage: (_: any) => {} };
    connect = jest.fn();
    constructor(_ctx: any, _name: string) {}
};

class MockContext {
    createGain = jest.fn(() => ({ gain: { value: 1 }, connect: jest.fn() }));
}

class DummyPlayer extends SFXPlayer {
    public started = false;
    public stopped = false;
    constructor() {
        // @ts-ignore
        super(new MockContext());
    }
    override start() { this.started = true; }
    override stop() { this.stopped = true; }
}

describe("VoiceChangerWorkletNode SFX", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    test("detects activity and silence", () => {
        const node = new VoiceChangerWorkletNode({} as AudioContext, { notifySendBufferingTime(){}, notifyPerformanceStats(){}, notifyException(){}});
        const player = new DummyPlayer();
        node.setSfxPlayer(player);
        (node as any).handleMessage({ data: { responseType: "inputData", inputData: new Float32Array([0.1,0.1,0.1]) }});
        expect(player.started).toBeTruthy();
        jest.advanceTimersByTime(400);
        (node as any).handleMessage({ data: { responseType: "inputData", inputData: new Float32Array([0,0,0]) }});
        expect(player.stopped).toBeTruthy();
    });
});
