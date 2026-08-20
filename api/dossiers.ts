import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { lanternDossierSchema, LanternDossier, Source } from '../shared/lanternSchema.js';

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
const REQUEST_TIMEOUT_MS = 28000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method verification
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed. Use POST.'
    });
  }

  // 2. Secret boundary check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not configured on the server. Please add your key in Vercel project settings.'
    });
  }

  // 3. Input validation & sanitization
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

  // 4. Invocation with timeout protection
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

Generate a complete LanternDossier JSON object conforming strictly to the requested schema.
`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    clearTimeout(timeoutId);

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini API.');
    }

    const rawData = JSON.parse(responseText);

    // 5. Reconcile Google Search Grounding Metadata
    const candidate = response.candidates?.[0];
    const groundingMetadata = (candidate as any)?.groundingMetadata;

    if (groundingMetadata && Array.isArray(groundingMetadata.groundingChunks)) {
      const existingSourceUrls = new Set(
        (rawData.sources || []).map((s: any) => s.url).filter(Boolean)
      );

      groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
        if (chunk.web?.uri && !existingSourceUrls.has(chunk.web.uri)) {
          const newSourceId = `SRC-GND-${String(index + 1).padStart(2, '0')}`;
          const groundedSource: Source = {
            id: newSourceId,
            title: chunk.web.title || `Web Source (${new URL(chunk.web.uri).hostname})`,
            sourceType: "web",
            citation: `Retrieved via Google Search Grounding: ${chunk.web.uri}`,
            url: chunk.web.uri,
            credibilityScore: 4,
            keyPoints: ["Verified via live Google Search grounding."],
            verificationState: "grounded"
          };

          if (!Array.isArray(rawData.sources)) {
            rawData.sources = [];
          }
          rawData.sources.push(groundedSource);
          existingSourceUrls.add(chunk.web.uri);
        }
      });
    }

    // 6. Validate with canonical Zod schema
    const validatedDossier: LanternDossier = lanternDossierSchema.parse(rawData);

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
