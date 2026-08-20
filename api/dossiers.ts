import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { lanternDossierSchema } from '../shared/lanternSchema';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not configured on the server. Please add your key in Vercel project settings.'
    });
  }

  try {
    const { topic, format, tone, audience } = req.body || {};
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Research topic is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_DOSSIER_MODEL || 'gemini-2.5-flash';

    const prompt = `
Conduct an in-depth, cited research synthesis for Cult of Psyche on the topic:
"${topic.trim()}"

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
        // Enable Google Search Grounding for live research citations
        tools: [{ googleSearch: {} }]
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini API.');
    }

    const rawData = JSON.parse(responseText);

    // Validate with canonical Zod schema
    const validatedDossier = lanternDossierSchema.parse(rawData);

    return res.status(200).json(validatedDossier);
  } catch (error: any) {
    console.error('Dossier generation error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during Gemini research synthesis.',
      details: error.issues || undefined
    });
  }
}
