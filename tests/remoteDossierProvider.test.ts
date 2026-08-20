import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemoteDossierProvider } from '../services/remoteDossierProvider';
import { fixtureDossier } from '../fixtures/lanternDossier.fixture';

describe('RemoteDossierProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully fetches and validates dossier from /api/dossiers', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fixtureDossier
    });

    const provider = new RemoteDossierProvider();
    const result = await provider.generateDossier({ topic: 'Gnosticism' });

    expect(global.fetch).toHaveBeenCalledWith('/api/dossiers', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ topic: 'Gnosticism' })
    }));
    expect(result.meta.projectId).toBe(fixtureDossier.meta.projectId);
  });

  it('throws typed error on server response failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'GEMINI_API_KEY missing' })
    });

    const provider = new RemoteDossierProvider();
    await expect(provider.generateDossier({ topic: 'Gnosticism' })).rejects.toThrow('GEMINI_API_KEY missing');
  });
});
