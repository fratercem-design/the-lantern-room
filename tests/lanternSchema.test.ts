import { describe, it, expect } from 'vitest';
import { lanternDossierSchema } from '../shared/lanternSchema';
import { fixtureDossier } from '../fixtures/lanternDossier.fixture';

describe('lanternSchema validation invariants', () => {
  it('validates pristine fixture successfully', () => {
    const parsed = lanternDossierSchema.parse(fixtureDossier);
    expect(parsed.meta.workingTitle).toBeDefined();
    expect(parsed.claims.length).toBeGreaterThan(0);
    expect(parsed.sources.length).toBeGreaterThan(0);
  });

  it('fails when a supported claim has no sources', () => {
    const invalid = JSON.parse(JSON.stringify(fixtureDossier));
    invalid.claims[0].status = 'supported';
    invalid.claims[0].sourceIds = [];

    const result = lanternDossierSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('has no sources'))).toBe(true);
    }
  });

  it('fails when a claim references a non-existent source ID', () => {
    const invalid = JSON.parse(JSON.stringify(fixtureDossier));
    invalid.claims[0].sourceIds.push('NON_EXISTENT_SRC');

    const result = lanternDossierSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('references non-existent source'))).toBe(true);
    }
  });

  it('fails when duplicate source IDs exist', () => {
    const invalid = JSON.parse(JSON.stringify(fixtureDossier));
    invalid.sources.push({ ...invalid.sources[0] });

    const result = lanternDossierSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('Duplicate source ID'))).toBe(true);
    }
  });

  it('fails when duplicate claim IDs exist', () => {
    const invalid = JSON.parse(JSON.stringify(fixtureDossier));
    invalid.claims.push({ ...invalid.claims[0] });

    const result = lanternDossierSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('Duplicate claim ID'))).toBe(true);
    }
  });

  it('fails when a warning references a non-existent claim ID', () => {
    const invalid = JSON.parse(JSON.stringify(fixtureDossier));
    invalid.warnings.push({
      id: 'WARN-TEST',
      severity: 'blocking',
      message: 'Test warning',
      relatedClaimIds: ['GHOST-CLAIM-ID'],
      resolved: false
    });

    const result = lanternDossierSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('references non-existent claim'))).toBe(true);
    }
  });
});
