import { describe, it, expect, vi } from 'vitest';

vi.mock('@google/genai');
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

describe('provenance is server-stamped, not model-asserted', () => {
  it('does not let the model dictate generatedAt, engine, or grounded', async () => {
    // A live run returned generatedAt "2025-01-15T09:30:00Z" -- confident and
    // wrong. These three fields are facts about how the server called out.
    const { default: handler } = await import('../api/dossiers');
    const { fixtureDossier } = await import('../fixtures/lanternDossier.fixture');
    const { GoogleGenAI } = await import('@google/genai');

    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.DOSSIER_PROVIDER;

    const lying = JSON.parse(JSON.stringify(fixtureDossier));
    lying.meta.generatedAt = '2025-01-15T09:30:00Z';
    lying.meta.engine = 'Totally Real Grounded Engine';
    lying.meta.grounded = true;

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockResolvedValue({ text: JSON.stringify(lying), candidates: [] }) }
    } as any));

    const res: any = {
      statusCode: 200, headers: {},
      setHeader(k: string, v: string) { this.headers[k] = v; },
      status(c: number) { this.statusCode = c; return this; },
      json(d: any) { this.jsonData = d; return this; }
    };
    await handler({ method: 'POST', body: { topic: 'Provenance stamping' } } as any, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.meta.generatedAt).not.toBe('2025-01-15T09:30:00Z');
    expect(new Date(res.jsonData.meta.generatedAt).getTime()).toBeGreaterThan(Date.now() - 60_000);
    expect(res.jsonData.meta.engine).toContain('Gemini');
  });
});
