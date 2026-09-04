import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { stripFalseGrounding } from '../shared/hfDossierClient';
import { normalizeDossierCandidate } from '../shared/dossierContract';
import { lanternDossierSchema } from '../shared/lanternSchema';

describe('stripFalseGrounding', () => {
  it('downgrades every self-asserted grounded source', () => {
    const out = stripFalseGrounding({
      sources: [
        { id: 'SRC-01', verificationState: 'grounded' },
        { id: 'SRC-02', verificationState: 'unverified' }
      ]
    }, 'Hugging Face (test-model)');

    expect(out.sources.every((s: any) => s.verificationState === 'unverified')).toBe(true);
  });

  it('prepends a blocking provenance warning naming the provider', () => {
    const out = stripFalseGrounding({ sources: [] }, 'Hugging Face (test-model)');
    expect(out.warnings[0].id).toBe('W-NO-GROUNDING');
    expect(out.warnings[0].severity).toBe('blocking');
    expect(out.warnings[0].message).toContain('test-model');
    expect(out.warnings[0].message).toContain('not retrieved');
  });

  it('preserves warnings the model already produced', () => {
    const out = stripFalseGrounding(
      { sources: [], warnings: [{ id: 'W-01', severity: 'advisory', message: 'x', relatedClaimIds: [], resolved: false }] },
      'Hugging Face (test-model)'
    );
    expect(out.warnings).toHaveLength(2);
    expect(out.warnings[1].id).toBe('W-01');
  });
});

// Guarded so the suite still runs on a machine without the captured sample.
const sample = 'live-raw.json';
const hasSample = fs.existsSync(sample);

describe.skipIf(!hasSample)('captured live GLM-5.3-Flash output', () => {
  it('is schema-valid and carries no false grounding after processing', () => {
    const raw = JSON.parse(fs.readFileSync(sample, 'utf8'));

    const before = raw.sources.filter((s: any) => s.verificationState === 'grounded').length;
    expect(before).toBeGreaterThan(0); // the model really did assert this

    const processed = normalizeDossierCandidate(stripFalseGrounding(raw, 'Hugging Face (zai-org/GLM-5.3-Flash)'));
    const result = lanternDossierSchema.safeParse(processed);
    expect(result.success).toBe(true);

    const d: any = result.data;
    expect(d.sources.some((s: any) => s.verificationState === 'grounded')).toBe(false);
    expect(d.warnings[0].id).toBe('W-NO-GROUNDING');
  });
});
