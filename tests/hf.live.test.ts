import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DOSSIER_JSON_CONTRACT, extractJsonObject, normalizeDossierCandidate } from '../shared/dossierContract';
import { generateWithHuggingFace, stripFalseGrounding } from '../shared/hfDossierClient';
import { lanternDossierSchema } from '../shared/lanternSchema';

const SYSTEM_INSTRUCTION = `
You are the Lead Researcher and Editorial Atelier for "Cult of Psyche", an intellectual, darkly inquisitive YouTube channel and production atelier.
You turn topics, questions, and claims into rigorous, cited research dossiers.
Every supported or contested claim MUST reference at least one source ID from the sources list.
Provide five distinct lenses, three distinct episode shapes, 10 scored titles, and 6 thumbnail concepts.
`;

describe('LIVE Hugging Face dossier generation', () => {
  it('streams a dossier that passes the canonical Zod schema', async () => {
    const token = fs.readFileSync(path.join(os.homedir(), '.cache/huggingface/token'), 'utf8').trim();
    const model = process.env.HF_DOSSIER_MODEL || 'zai-org/GLM-5.3-Flash';
    const topic = process.env.LANTERN_TOPIC || 'The Cathars and the Albigensian Crusade';

    const prompt = `
Conduct an in-depth, cited research synthesis for Cult of Psyche on the topic:
"${topic}"

Target Format: 20-30 min Deep Dive
Intended Tone: Academic-Occult / Darkly Inquisitive
Audience Level: Familiar with esoteric & psychological concepts

Generate a complete LanternDossier JSON object conforming strictly to the schema below.

${DOSSIER_JSON_CONTRACT}
`;

    const started = Date.now();
    const result = await generateWithHuggingFace({
      token,
      model,
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt,
      maxTokens: 32000,
      signal: AbortSignal.timeout(280000)
    });
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);

    console.log(`\n[live] STREAMED model=${model} elapsed=${elapsed}s chars=${result.text.length} truncated=${result.truncated}`);
    expect(result.truncated).toBe(false);

    fs.writeFileSync(process.env.LANTERN_OUT || 'live-raw.json', result.text);

    const raw = extractJsonObject(result.text);
    expect(raw, 'extractJsonObject returned null').not.toBeNull();

    const processed = normalizeDossierCandidate(stripFalseGrounding(raw, `Hugging Face (${model})`));
    const parsed = lanternDossierSchema.safeParse(processed);

    if (!parsed.success) {
      console.log('[live] ZOD FAILURES:');
      parsed.error.issues.slice(0, 25).forEach(i => console.log(`  ${i.path.join('.')} :: ${i.message}`));
    } else {
      const d: any = parsed.data;
      console.log(`[live] VALID. sources=${d.sources.length} claims=${d.claims.length} lenses=${d.lenses.length} shapes=${d.shapes.length} script=${d.script.length} titles=${d.production.titles.length} thumbs=${d.production.thumbnails.length}`);
      console.log(`[live] warning[0]=${d.warnings[0]?.id} grounded_sources=${d.sources.filter((s: any) => s.verificationState === 'grounded').length}`);
    }
    expect(parsed.success).toBe(true);
  }, 300000);
});
