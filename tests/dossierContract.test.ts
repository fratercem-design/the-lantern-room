import { describe, it, expect } from 'vitest';
import { extractJsonObject, normalizeDossierCandidate } from '../shared/dossierContract';
import { lanternDossierSchema } from '../shared/lanternSchema';
import { fixtureDossier } from '../fixtures/lanternDossier.fixture';

describe('extractJsonObject', () => {
  it('parses a bare JSON object', () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses JSON wrapped in a markdown fence', () => {
    expect(extractJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('parses JSON surrounded by model prose', () => {
    const raw = 'Here is the dossier you asked for:\n{"a":1}\nLet me know if you need changes.';
    expect(extractJsonObject(raw)).toEqual({ a: 1 });
  });

  it('returns null when there is no JSON object', () => {
    expect(extractJsonObject('I was unable to complete that request.')).toBeNull();
  });

  it('returns null for a bare JSON array', () => {
    expect(extractJsonObject('[1,2,3]')).toBeNull();
  });
});

describe('normalizeDossierCandidate', () => {
  it('downgrades a supported claim that cites nothing', () => {
    const out = normalizeDossierCandidate({
      sources: [],
      claims: [{ id: 'CLM-01', text: 't', status: 'supported', sourceIds: [], confidenceNote: 'n' }]
    });
    expect(out.claims[0].status).toBe('needs-source');
  });

  it('drops claim references to sources that do not exist', () => {
    const out = normalizeDossierCandidate({
      sources: [{ id: 'SRC-01' }],
      claims: [{ id: 'CLM-01', text: 't', status: 'supported', sourceIds: ['SRC-01', 'SRC-99'], confidenceNote: 'n' }]
    });
    expect(out.claims[0].sourceIds).toEqual(['SRC-01']);
    expect(out.claims[0].status).toBe('supported');
  });

  it('drops a malformed url rather than failing validation', () => {
    const out = normalizeDossierCandidate({
      sources: [{ id: 'SRC-01', url: 'not a url' }, { id: 'SRC-02', url: 'https://ok.example/x' }]
    });
    expect(out.sources[0].url).toBeUndefined();
    expect(out.sources[1].url).toBe('https://ok.example/x');
  });

  it('drops duplicate source and claim ids', () => {
    const out = normalizeDossierCandidate({
      sources: [{ id: 'SRC-01' }, { id: 'SRC-01' }],
      claims: [{ id: 'CLM-01', sourceIds: [] }, { id: 'CLM-01', sourceIds: [] }]
    });
    expect(out.sources).toHaveLength(1);
    expect(out.claims).toHaveLength(1);
  });

  it('drops warning references to claims that do not exist', () => {
    const out = normalizeDossierCandidate({
      sources: [],
      claims: [{ id: 'CLM-01', sourceIds: [] }],
      warnings: [{ id: 'W-01', relatedClaimIds: ['CLM-01', 'CLM-404'] }]
    });
    expect(out.warnings[0].relatedClaimIds).toEqual(['CLM-01']);
  });

  it('turns a dossier that Zod rejects into one it accepts', () => {
    const broken = JSON.parse(JSON.stringify(fixtureDossier));
    broken.claims[0].sourceIds = ['SRC-DOES-NOT-EXIST'];
    expect(lanternDossierSchema.safeParse(broken).success).toBe(false);

    const repaired = normalizeDossierCandidate(broken);
    const result = lanternDossierSchema.safeParse(repaired);
    expect(result.success).toBe(true);
  });

  it('leaves a already-valid dossier valid', () => {
    const out = normalizeDossierCandidate(JSON.parse(JSON.stringify(fixtureDossier)));
    expect(lanternDossierSchema.safeParse(out).success).toBe(true);
  });
});
