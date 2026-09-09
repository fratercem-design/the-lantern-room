import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { lanternDossierSchema } from '../shared/lanternSchema';
import { DOSSIER_JSON_CONTRACT } from '../shared/dossierContract';

/**
 * The dossier shape is declared twice: once in Zod (enforced on the way back)
 * and once in DOSSIER_JSON_CONTRACT (prose sent to the model). Nothing tied
 * them together, so adding a schema field silently stopped telling the model
 * about it -- surfacing later as a validation failure that looks like model
 * error.
 */

/**
 * Fields the model is deliberately NOT told to emit. Each is owned by
 * something other than the model, and every entry needs a reason:
 *
 *   engine, grounded - stamped by the server; facts about how the server
 *                      called out, which the model cannot know.
 *   pinned           - set by the user in the Lens Matrix; a UI interaction
 *                      state, not part of the research output.
 *
 * Anything else appearing here is drift, not design.
 */
const NOT_MODEL_OWNED = new Set(['engine', 'grounded', 'pinned']);

function unwrap(schema: any): any {
  let s = schema;
  for (let i = 0; i < 20; i++) {
    const t = s?._def?.typeName;
    if (t === 'ZodEffects') { s = s._def.schema; continue; }
    if (t === 'ZodOptional' || t === 'ZodNullable' || t === 'ZodDefault') { s = s._def.innerType; continue; }
    break;
  }
  return s;
}

function collect(schema: any, keys: Set<string>, enums: Set<string>): void {
  const s = unwrap(schema);
  const t = s?._def?.typeName;

  if (t === 'ZodObject') {
    for (const [key, value] of Object.entries(s.shape as Record<string, unknown>)) {
      keys.add(key);
      collect(value, keys, enums);
    }
  } else if (t === 'ZodArray') {
    collect(s._def.type, keys, enums);
  } else if (t === 'ZodEnum') {
    (s._def.values as string[]).forEach(v => enums.add(v));
  }
}

describe('contract / schema drift guard', () => {
  const keys = new Set<string>();
  const enums = new Set<string>();
  collect(lanternDossierSchema as unknown as z.ZodTypeAny, keys, enums);

  it('introspects a non-trivial shape (guard against a vacuous pass)', () => {
    expect(keys.size).toBeGreaterThan(30);
    expect(enums.size).toBeGreaterThan(10);
  });

  it('tells the model about every field the schema requires', () => {
    const missing = [...keys]
      .filter(k => !NOT_MODEL_OWNED.has(k))
      .filter(k => !DOSSIER_JSON_CONTRACT.includes(k));

    expect(missing, `schema fields absent from DOSSIER_JSON_CONTRACT: ${missing.join(', ')}`).toEqual([]);
  });

  it('tells the model about every enum value the schema accepts', () => {
    const missing = [...enums].filter(v => !DOSSIER_JSON_CONTRACT.includes(v));

    expect(missing, `schema enum values absent from DOSSIER_JSON_CONTRACT: ${missing.join(', ')}`).toEqual([]);
  });
});
