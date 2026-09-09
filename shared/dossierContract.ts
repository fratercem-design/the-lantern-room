/**
 * The JSON shape contract that is actually transmitted to the model.
 *
 * Google Search grounding cannot be combined with `responseMimeType:
 * "application/json"` on Gemini 2.5 (the API rejects it with
 * "<tool> with a response mime type: 'application/json' is unsupported"),
 * and structured output alongside grounding is Gemini 3 only. So the schema
 * cannot be enforced by the SDK -- it has to be stated in the prompt and
 * enforced on the way back in.
 */
export const DOSSIER_JSON_CONTRACT = `
Return ONE JSON object and nothing else. No prose, no markdown fences.

{
  "meta": {
    "projectId": string,
    "workingTitle": string,
    "logline": string,
    "generatedAt": string (ISO 8601),
    "targetFormat": string,
    "tone": string,
    "researchTopic": string (the exact requested topic; the server overwrites this value)
  },
  "sources": [ {
    "id": string (e.g. "SRC-01", unique),
    "title": string,
    "sourceType": "pdf" | "video" | "audio" | "web" | "primary_text" | "image",
    "citation": string,
    "url": string (a full valid URL, or omit the field entirely),
    "credibilityScore": integer 1-5,
    "keyPoints": [string],
    "verificationState": "fixture" | "unverified" | "grounded"
  } ],
  "claims": [ {
    "id": string (e.g. "CLM-01", unique),
    "text": string,
    "status": "supported" | "contested" | "interpretive" | "needs-source",
    "sourceIds": [string],
    "confidenceNote": string,
    "reviewed": boolean
  } ],
  "lenses": [ {
    "type": "historical" | "psychological" | "mythic" | "theological" | "coercion-watch",
    "title": string,
    "body": string,
    "keyPoints": [string]
  } ],
  "shapes": [ {
    "id": string,
    "title": string,
    "archetype": "narrative_mystery" | "case_file" | "myth_vs_reality",
    "coldOpen": string,
    "centralQuestion": string,
    "escalation": string,
    "reversal": string,
    "emotionalBeat": string,
    "takeaway": string,
    "closingImage": string,
    "estimatedRuntimeMinutes": number
  } ],
  "script": [ {
    "id": string,
    "section": string,
    "narration": string,
    "visualCue": string,
    "tone": string,
    "sourceIds": [string],
    "isComedyBeat": boolean
  } ],
  "production": {
    "titles": [string] (exactly 10),
    "thumbnails": [ { "id": string, "concept": string, "visualPrompt": string, "textOverlay": string, "composition": string } ] (exactly 6),
    "shotList": [ { "timecode": string, "visualIntent": string, "assetType": string, "fallback": string } ],
    "shortsCutdowns": [ { "id": string, "hook": string, "adaptedCopy": string, "cta": string } ],
    "description": string,
    "chapters": [ { "timestamp": string, "title": string } ]
  },
  "warnings": [ {
    "id": string,
    "severity": "blocking" | "advisory",
    "message": string,
    "relatedClaimIds": [string],
    "resolved": boolean
  } ]
}

HARD CONSTRAINTS (violations make the dossier unusable):
- Every value in a claim's "sourceIds" MUST be the "id" of a source you listed in "sources".
- A claim with status "supported" or "contested" MUST have at least one entry in "sourceIds".
  If you cannot cite it, use status "needs-source" and an empty "sourceIds".
- Every id in a warning's "relatedClaimIds" MUST be the "id" of a claim you listed.
- Source ids must be unique. Claim ids must be unique.
- "lenses" must contain all five distinct types exactly once.
- "shapes" must contain the three distinct archetypes.
- Omit "url" entirely rather than emitting a placeholder or a non-URL string.
`;

/**
 * Pulls the JSON object out of a model response that may be wrapped in prose
 * or markdown fences. Returns null when nothing parseable is present.
 */
export function extractJsonObject(raw: string): unknown | null {
  const text = raw.trim();

  const candidates: string[] = [text];

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // try the next candidate
    }
  }

  return null;
}

/**
 * Deterministically repairs the near-miss output the model tends to produce,
 * so that a dossier that is substantively fine is not thrown away over a
 * dangling reference. This only ever *weakens* claims -- it downgrades
 * uncitable claims and drops references to things that do not exist. It never
 * invents a source or promotes a claim.
 */
export function normalizeDossierCandidate(input: any): any {
  if (!input || typeof input !== 'object') return input;
  const data = input;

  if (!Array.isArray(data.sources)) data.sources = [];
  if (!Array.isArray(data.claims)) data.claims = [];
  if (!Array.isArray(data.warnings)) data.warnings = [];

  // Drop sources with a duplicate id; keep the first occurrence.
  const seenSourceIds = new Set<string>();
  data.sources = data.sources.filter((source: any) => {
    if (!source || typeof source.id !== 'string') return false;
    if (seenSourceIds.has(source.id)) return false;
    seenSourceIds.add(source.id);
    return true;
  });

  // A malformed url fails `z.string().url()` and takes the whole dossier with
  // it; the field is optional, so drop it instead.
  data.sources.forEach((source: any) => {
    if (typeof source.url !== 'string') {
      delete source.url;
      return;
    }
    try {
      new URL(source.url);
    } catch {
      delete source.url;
    }
  });

  const seenClaimIds = new Set<string>();
  data.claims = data.claims.filter((claim: any) => {
    if (!claim || typeof claim.id !== 'string') return false;
    if (seenClaimIds.has(claim.id)) return false;
    seenClaimIds.add(claim.id);
    return true;
  });

  data.claims.forEach((claim: any) => {
    const ids = Array.isArray(claim.sourceIds) ? claim.sourceIds : [];
    // Drop references to sources that were never listed.
    claim.sourceIds = Array.from(new Set(ids.filter((id: any) => seenSourceIds.has(id))));

    // An uncitable claim is downgraded rather than dropped: the editorial
    // rules already call for exactly this.
    if ((claim.status === 'supported' || claim.status === 'contested') && claim.sourceIds.length === 0) {
      claim.status = 'needs-source';
    }
  });

  data.warnings.forEach((warning: any) => {
    const ids = Array.isArray(warning.relatedClaimIds) ? warning.relatedClaimIds : [];
    warning.relatedClaimIds = ids.filter((id: any) => seenClaimIds.has(id));
  });

  if (Array.isArray(data.script)) {
    data.script.forEach((block: any) => {
      const ids = Array.isArray(block?.sourceIds) ? block.sourceIds : [];
      block.sourceIds = ids.filter((id: any) => seenSourceIds.has(id));
    });
  }

  return data;
}
