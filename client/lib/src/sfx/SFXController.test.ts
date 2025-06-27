const { SFXController } = require('./SFXController');

class DummyAudioContext {
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    createBufferSource() { return { buffer: null, loop: false, connect() {}, start() {}, stop() {}, disconnect() {} }; }
}
class DummyBuffer { constructor(){ this.duration = 1; } }

test('sfx controller start and stop logic', () => {
    const ctx = new DummyAudioContext();
    const ctrl = new SFXController(ctx);
    ctrl.connect({ connect() {} });
    ctrl.load([new DummyBuffer()]);
    ctrl.setGain(0.5);
    ctrl.setThreshold(-30);
    // below threshold should not start playback
    ctrl.updateInputLevel(-40);
    expect(ctrl.playing).toBeFalsy();

    // above threshold should start playback
    ctrl.updateInputLevel(-20);
    expect(ctrl.playing).toBeTruthy();

    // silence shorter than limit should not stop
    ctrl.updateOutputLevel(-40, 1000);
    expect(ctrl.playing).toBeTruthy();

    // prolonged silence stops playback
    ctrl.updateOutputLevel(-40, 400);
    expect(ctrl.playing).toBeFalsy();
});
