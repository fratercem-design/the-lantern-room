import { DossierProvider, DossierRequest } from './dossierProvider';
import { LanternDossier, lanternDossierSchema } from '../shared/lanternSchema';

export class RemoteDossierProvider implements DossierProvider {
  async generateDossier(
    request: DossierRequest,
    options?: { signal?: AbortSignal }
  ): Promise<LanternDossier> {
    const response = await fetch('/api/dossiers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: options?.signal
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return lanternDossierSchema.parse(data);
  }
}
