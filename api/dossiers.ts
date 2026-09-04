import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { lanternDossierSchema, LanternDossier, Source } from '../shared/lanternSchema.js';
import {
  DOSSIER_JSON_CONTRACT,
  extractJsonObject,
  normalizeDossierCandidate
} from '../shared/dossierContract.js';

const SYSTEM_INSTRUCTION = `
You are the Lead Researcher and Editorial Atelier for "Cult of Psyche", an intellectual, darkly inquisitive YouTube channel and production atelier.
You turn topics, questions, and claims into rigorous, cited research dossiers.

EDITORIAL GUIDELINES:
1. Grounding & Claims: Distinguish empirical historical facts, psychological frameworks, mythic archetypes, theological doctrines, and coercion watch observations.
2. Sourcing: Every supported or contested claim MUST reference at least one source ID from the sources list. If a claim lacks verifiable evidence, mark it 'needs-source'.
3. Lenses: Provide five distinct lenses:
   - historical: grounded archaeological/papyrological/historical records with dates.
   - psychological: cognitive dissonance, alienation, non-diagnostic behavioral observations.
   - mythic: symbolic correspondences, esoteric archetypes, folklore.
   - theological: attributed to traditions (e.g. Gnostic, Christian, Apophatic) without presenting dogma as clinical fact.
   - coercion-watch: observable recruitment tactics, isolation dynamics, reality-testing erosion, and resistance countermeasures.
4. Episode Shapes: Propose three genuinely distinct architectures (Case File, Narrative Mystery, Myth vs Reality).
5. Script: Create engaging, paced script blocks with visual cues, tone markers, comedy beats, and citation IDs.
6. Production: Provide 10 scored titles (clarity, curiosity, specificity rubric), 6 thumbnail concepts with visual prompts, and a shot list.
`;

// Maximum input limits for production security
const MAX_TOPIC_LENGTH = 1000;
const MAX_PAYLOAD_BYTES = 50 * 1024; // 50 KB
// Must stay comfortably under the function's maxDuration in vercel.json (60s)
// so that our own abort produces a clean JSON 504 rather than the platform
// killing the invocation and returning its own error page.
const REQUEST_TIMEOUT_MS = 52000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method verification
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed. Use POST.'
    });
  }

  // 2. Request payload size verification (50 KB limit)
  const rawPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const payloadBytes = Buffer.byteLength(rawPayload, 'utf8');
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    return res.status(413).json({
      error: 'Request payload exceeds maximum allowed size of 50 KB.'
    });
  }

  // 3. Secret boundary check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not configured on the server. Please add your key in Vercel project settings.'
    });
  }

  // 4. Input validation & sanitization
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      error: 'Invalid request body. JSON payload expected.'
    });
  }

  const { topic, format, tone, audience } = body;
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({
      error: 'Research topic is required.'
    });
  }

  const sanitizedTopic = topic.trim();
  if (sanitizedTopic.length > MAX_TOPIC_LENGTH) {
    return res.status(400).json({
      error: `Research topic exceeds maximum allowed length of ${MAX_TOPIC_LENGTH} characters.`
    });
  }

  // 5. Invocation with timeout protection wired to SDK
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_DOSSIER_MODEL || 'gemini-2.5-flash';

    const prompt = `
Conduct an in-depth, cited research synthesis for Cult of Psyche on the topic:
"${sanitizedTopic}"

Target Format: ${format || "20-30 min Deep Dive"}
Intended Tone: ${tone || "Academic-Occult / Darkly Inquisitive"}
Audience Level: ${audience || "Familiar with esoteric & psychological concepts"}

Generate a complete LanternDossier JSON object conforming strictly to the schema below.

${DOSSIER_JSON_CONTRACT}
`;

    // NOTE: `responseMimeType: "application/json"` must NOT be set here.
    // Gemini 2.5 rejects any tool + JSON mime type combination outright
    // ("<tool> with a response mime type: 'application/json' is unsupported"),
    // and structured output alongside Search grounding is Gemini 3 only.
    // Grounding is the more valuable half, so the JSON contract is carried in
    // the prompt and enforced on the way back instead.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        abortSignal: abortController.signal,
        httpOptions: { timeout: REQUEST_TIMEOUT_MS }
      }
    });

    clearTimeout(timeoutId);

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini API.');
    }

    const rawData = extractJsonObject(responseText) as any;
    if (!rawData) {
      throw new Error('Gemini response did not contain a parseable JSON dossier.');
    }

    // 6. Reconcile Google Search Grounding Metadata & Chunks
    const candidate = response.candidates?.[0];
    const groundingMetadata = (candidate as any)?.groundingMetadata;

    if (groundingMetadata && Array.isArray(groundingMetadata.groundingChunks)) {
      if (!Array.isArray(rawData.sources)) {
        rawData.sources = [];
      }

      const existingSourceUrls = new Map<string, string>();
      rawData.sources.forEach((s: any) => {
        if (s.url) existingSourceUrls.set(s.url, s.id);
      });

      const existingIds = new Set(rawData.sources.map((s: any) => s.id));
      const groundedChunkSourceMap: string[] = [];

      groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
        const uri = chunk.web?.uri;
        if (!uri) return;

        if (existingSourceUrls.has(uri)) {
          // Upgrade existing model source to grounded state
          const existingId = existingSourceUrls.get(uri)!;
          const targetSource = rawData.sources.find((s: any) => s.id === existingId);
          if (targetSource) {
            targetSource.verificationState = "grounded";
          }
          groundedChunkSourceMap[index] = existingId;
        } else {
          // Generate collision-safe ID
          let sourceIndex = index + 1;
          let newSourceId = `SRC-GND-${String(sourceIndex).padStart(2, '0')}`;
          while (existingIds.has(newSourceId)) {
            sourceIndex++;
            newSourceId = `SRC-GND-${String(sourceIndex).padStart(2, '0')}`;
          }
          existingIds.add(newSourceId);
          existingSourceUrls.set(uri, newSourceId);
          groundedChunkSourceMap[index] = newSourceId;

          let host = "web";
          try {
            host = new URL(uri).hostname;
          } catch (_) {}

          const groundedSource: Source = {
            id: newSourceId,
            title: chunk.web.title || `Web Source (${host})`,
            sourceType: "web",
            citation: `Retrieved via Google Search Grounding: ${uri}`,
            url: uri,
            credibilityScore: 4,
            keyPoints: ["Retrieved and verified via live Google Search grounding."],
            verificationState: "grounded"
          };

          rawData.sources.push(groundedSource);
        }
      });

      // Map grounding supports to claims if available
      if (Array.isArray(groundingMetadata.groundingSupports) && Array.isArray(rawData.claims)) {
        groundingMetadata.groundingSupports.forEach((support: any) => {
          const chunkIndices = support.groundingChunkIndices || [];
          const matchedSourceIds = chunkIndices
            .map((i: number) => groundedChunkSourceMap[i])
            .filter(Boolean);

          // Short segments match almost any claim by substring, which would
          // attach grounded sources to unrelated text; require enough
          // characters for the overlap to mean something.
          const MIN_SEGMENT_MATCH_CHARS = 24;
          if (matchedSourceIds.length > 0 && support.segment?.text) {
            const segmentText = support.segment.text.toLowerCase();
            rawData.claims.forEach((claim: any) => {
              if (!claim.text) return;
              const claimText = claim.text.toLowerCase();
              const overlap = Math.min(segmentText.length, claimText.length);
              if (overlap < MIN_SEGMENT_MATCH_CHARS) return;
              if (claimText.includes(segmentText) || segmentText.includes(claimText)) {
                claim.sourceIds = Array.from(new Set([...(claim.sourceIds || []), ...matchedSourceIds]));
                if (claim.status === 'needs-source') {
                  claim.status = 'supported';
                }
              }
            });
          }
        });
      }
    }

    // 7. Deterministically repair near-miss output, then validate with the
    //    canonical Zod schema. Normalization runs after grounding so that
    //    grounded source IDs are already present.
    const normalized = normalizeDossierCandidate(rawData);
    const validatedDossier: LanternDossier = lanternDossierSchema.parse(normalized);

    return res.status(200).json(validatedDossier);
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Dossier generation error:', error);

    // Sanitize production error responses
    const isAbort = error.name === 'AbortError' || abortController.signal.aborted;
    const statusCode = isAbort ? 504 : 500;
    const userMessage = isAbort
      ? 'Request timed out while contacting Gemini research services.'
      : (error.message && error.message.includes('API key'))
        ? 'Invalid or unauthorized GEMINI_API_KEY.'
        : 'An error occurred during research synthesis. Please try again.';

    return res.status(statusCode).json({
      error: userMessage
    });
  }
}
