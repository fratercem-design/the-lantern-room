import { LanternDossier } from '../shared/lanternSchema';

export type ProviderMode = 'fixture' | 'live';

export interface DossierRequest {
  topic: string;
  format?: string;
  tone?: string;
  audience?: string;
}

export interface DossierProvider {
  generateDossier(
    request: DossierRequest,
    options?: { signal?: AbortSignal }
  ): Promise<LanternDossier>;
}
