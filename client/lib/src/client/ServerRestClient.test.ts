import { ServerRestClient } from './ServerRestClient';

describe('ServerRestClient.getSfxFiles', () => {
    test('returns file list', async () => {
        const client = new ServerRestClient('http://localhost');
        global.fetch = jest.fn().mockResolvedValue({
            json: async () => ({ files: ['a.wav', 'b.wav'] })
        }) as any;
        const files = await client.getSfxFiles('');
        expect(files).toEqual(['a.wav', 'b.wav']);
    });
});
