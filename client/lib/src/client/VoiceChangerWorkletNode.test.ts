// Provide a minimal AudioWorkletNode so the module can be imported in Node
(global as any).AudioWorkletNode = class {} as any;

import { VoiceChangerWorkletNode } from './VoiceChangerWorkletNode';

describe('VoiceChangerWorkletNode.calculateTotalPing', () => {
  it('computes latency independent of clock skew', () => {
    const sentAt = 1000;
    const serverSend = 1300; // network1 100 + processing 200
    const serverPing = 100; // network1
    jest.spyOn(Date, 'now').mockReturnValue(sentAt + 450); // round trip 450
    const ping = VoiceChangerWorkletNode.calculateTotalPing(sentAt, serverSend, serverPing);
    expect(ping).toBeCloseTo(250);
    (Date.now as jest.Mock).mockRestore();
  });
});

