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
    ctrl.updateInputLevel(-20);
    expect(ctrl.playing).toBeTruthy();
    ctrl.updateOutputLevel(-40, 1400);
    expect(ctrl.playing).toBeFalsy();
});
