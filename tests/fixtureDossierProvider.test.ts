import { describe, it, expect } from 'vitest';
import { FixtureDossierProvider } from '../services/fixtureDossierProvider';

describe('FixtureDossierProvider', () => {
  it('generates a valid dossier adhering to canonical schema', async () => {
    const provider = new FixtureDossierProvider(10);
    const dossier = await provider.generateDossier({ topic: 'Gnostic simulation theories' });
    
    expect(dossier.meta.projectId).toBeDefined();
    expect(dossier.meta.logline).toContain('Gnostic simulation theories');
    expect(dossier.claims.length).toBeGreaterThan(0);
    expect(dossier.sources.every(s => s.verificationState === 'fixture')).toBe(true);
  });

  it('supports cancellation via AbortSignal', async () => {
    const provider = new FixtureDossierProvider(500);
    const controller = new AbortController();

    const promise = provider.generateDossier({ topic: 'Test' }, { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow();
  });
});
