import { DossierProvider, DossierRequest } from './dossierProvider';
import { LanternDossier, lanternDossierSchema } from '../shared/lanternSchema';
import { fixtureDossier } from '../fixtures/lanternDossier.fixture';

export class FixtureDossierProvider implements DossierProvider {
  private delayMs: number;

  constructor(delayMs: number = 1000) {
    this.delayMs = delayMs;
  }

  async generateDossier(
    request: DossierRequest,
    options?: { signal?: AbortSignal }
  ): Promise<LanternDossier> {
    // Simulated asynchronous latency with AbortSignal support
    await new Promise<void>((resolve, reject) => {
      if (options?.signal?.aborted) {
        return reject(new DOMException('Generation cancelled by user', 'AbortError'));
      }

      const timeout = setTimeout(() => {
        resolve();
      }, this.delayMs);

      options?.signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Generation cancelled by user', 'AbortError'));
      });
    });

    // Deep clone the fixture to prevent shared mutation
    const cloned = JSON.parse(JSON.stringify(fixtureDossier)) as LanternDossier;

    // Safely incorporate prompt topic into metadata
    if (request.topic && request.topic.trim()) {
      cloned.meta.logline = `A curated dialectical investigation into: "${request.topic.trim()}".`;
    }
    cloned.meta.generatedAt = new Date().toISOString();

    // Enforce canonical Zod validation at provider boundary
    return lanternDossierSchema.parse(cloned);
  }
}
