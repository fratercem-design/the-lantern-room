/**
 * Hugging Face Inference Providers client (OpenAI-compatible router).
 *
 * This path has NO web-search grounding. Gemini's googleSearch tool has no
 * equivalent here, so every source a model returns is recalled from training
 * data, not retrieved. Live testing showed the model self-labelling 14 of 18
 * sources as "grounded" when nothing had been grounded at all, so the caller
 * MUST run `stripFalseGrounding` over the result.
 */

export const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

export interface HfCompletionResult {
  text: string;
  truncated: boolean;
  usage?: unknown;
}

export async function generateWithHuggingFace(opts: {
  token: string;
  model: string;
  systemInstruction: string;
  prompt: string;
  maxTokens: number;
  signal: AbortSignal;
}): Promise<HfCompletionResult> {
  const response = await fetch(HF_ROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: 'system', content: opts.systemInstruction },
        { role: 'user', content: opts.prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: opts.maxTokens,
      temperature: 0.7,
      // Streaming is not a nicety here. A non-streamed dossier takes 1-2
      // minutes to generate, and the HF router closes the connection with its
      // own 504 Gateway Time-out before the first byte arrives. Streaming keeps
      // data flowing so the gateway never idles out.
      stream: true
    }),
    signal: opts.signal
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const error: any = new Error(`Hugging Face router error: ${detail.slice(0, 300)}`);
    error.status = response.status;
    throw error;
  }

  if (!response.body) {
    throw new Error('Hugging Face router returned no response body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let finishReason: string | undefined;
  let usage: unknown;

  // Server-sent events: "data: {json}" lines, terminated by "data: [DONE]".
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const chunk = JSON.parse(payload);
        const choice = chunk?.choices?.[0];
        const delta = choice?.delta?.content;
        if (typeof delta === 'string') text += delta;
        if (choice?.finish_reason) finishReason = choice.finish_reason;
        if (chunk?.usage) usage = chunk.usage;
      } catch {
        // A partial frame; the next read completes it.
      }
    }
  }

  if (!text) {
    throw new Error('Received empty response from Hugging Face router.');
  }

  // A length-capped completion yields truncated, unparseable JSON. Naming it
  // is far more useful than the generic "no parseable JSON" that follows.
  return {
    text,
    truncated: finishReason === 'length',
    usage
  };
}

/**
 * Downgrades every source to "unverified" and records why.
 *
 * Only the Gemini + googleSearch path can legitimately mark a source
 * "grounded"; that state means "an actual retrieval returned this URL". A
 * model asserting it about its own recall is a false provenance claim, and
 * this app exists to make provenance trustworthy.
 */
export function stripFalseGrounding(data: any, providerLabel: string): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data.sources)) {
    data.sources.forEach((source: any) => {
      if (source && typeof source === 'object') source.verificationState = 'unverified';
    });
  }

  if (!Array.isArray(data.warnings)) data.warnings = [];
  data.warnings.unshift({
    id: 'W-NO-GROUNDING',
    severity: 'blocking',
    message:
      `Generated via ${providerLabel}, which has no web-search grounding. Every source below is ` +
      `recalled from model training data, not retrieved. Citations are unverified and must be ` +
      `checked against the real works before publication.`,
    relatedClaimIds: [],
    resolved: false
  });

  return data;
}
