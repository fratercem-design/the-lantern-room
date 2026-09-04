import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../api/dossiers';
import { fixtureDossier } from '../fixtures/lanternDossier.fixture';
import { GoogleGenAI } from '@google/genai';

vi.mock('@google/genai');

function createMockReqRes(options: { method: string; body?: any }) {
  const req: any = {
    method: options.method,
    body: options.body
  };

  const res: any = {
    statusCode: 200,
    headers: {},
    setHeader(key: string, val: string) {
      this.headers[key] = val;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    }
  };

  return { req, res };
}

describe('Serverless /api/dossiers API Route', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it('rejects GET requests with 405 Method Not Allowed and sets Allow header', async () => {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res.jsonData.error).toContain('Method not allowed');
    expect(res.headers['Allow']).toBe('POST');
  });

  it('returns 500 when GEMINI_API_KEY is not configured', async () => {
    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Gnosticism' } });
    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.jsonData.error).toContain('GEMINI_API_KEY environment variable is not configured');
  });

  it('returns 400 when topic is empty or missing', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: '   ' } });
    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.error).toContain('Research topic is required');
  });

  it('returns 400 when topic exceeds maximum length', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const longTopic = 'a'.repeat(1005);
    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: longTopic } });
    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.error).toContain('exceeds maximum allowed length');
  });

  it('returns 413 Payload Too Large when request body exceeds 50 KB', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const hugePayload = {
      topic: 'Valid topic',
      format: 'x'.repeat(55 * 1024)
    };
    const { req, res } = createMockReqRes({ method: 'POST', body: hugePayload });
    await handler(req, res);

    expect(res.statusCode).toBe(413);
    expect(res.jsonData.error).toContain('Request payload exceeds maximum allowed size of 50 KB');
  });

  it('returns 504 Gateway Timeout when Gemini request aborts or times out', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    const mockGenerateContent = vi.fn().mockImplementation(() => {
      const error: any = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Gnosticism timeout test' } });
    await handler(req, res);

    expect(res.statusCode).toBe(504);
    expect(res.jsonData.error).toContain('timed out');
  });

  it('successfully parses mocked Gemini response and reconciles grounding chunks', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify(fixtureDossier),
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              {
                web: {
                  uri: 'https://example.com/gnostic-archaeology',
                  title: 'Nag Hammadi Library Overview'
                }
              }
            ],
            groundingSupports: [
              {
                groundingChunkIndices: [0],
                segment: {
                  text: 'Nag Hammadi'
                }
              }
            ]
          }
        }
      ]
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Nag Hammadi Gnosticism' } });
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.meta.projectId).toBe(fixtureDossier.meta.projectId);

    // Verify grounding chunk reconciliation
    const groundedSource = res.jsonData.sources.find((s: any) => s.url === 'https://example.com/gnostic-archaeology');
    expect(groundedSource).toBeDefined();
    expect(groundedSource.verificationState).toBe('grounded');
  });
  it('does NOT send responseMimeType alongside the googleSearch tool', async () => {
    // Regression guard. Gemini 2.5 rejects this combination outright with
    // "<tool> with a response mime type: 'application/json' is unsupported",
    // which produced a sub-second 500 on every live request in production
    // while every mocked test stayed green.
    process.env.GEMINI_API_KEY = 'test-key';

    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify(fixtureDossier),
      candidates: []
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerateContent }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Config contract' } });
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    const sentConfig = mockGenerateContent.mock.calls[0][0].config;
    expect(sentConfig.tools).toEqual([{ googleSearch: {} }]);
    expect(sentConfig.responseMimeType).toBeUndefined();
    expect(sentConfig.responseSchema).toBeUndefined();
  });

  it('transmits the JSON shape contract to the model in the prompt', async () => {
    // The prompt used to say "conforming strictly to the requested schema"
    // while never actually sending a schema.
    process.env.GEMINI_API_KEY = 'test-key';

    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify(fixtureDossier),
      candidates: []
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerateContent }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Contract transmission' } });
    await handler(req, res);

    const contents = mockGenerateContent.mock.calls[0][0].contents as string;
    expect(contents).toContain('"credibilityScore": integer 1-5');
    expect(contents).toContain('HARD CONSTRAINTS');
    expect(contents).toContain('Contract transmission');
  });

  it('recovers a dossier from a fenced, prose-wrapped model response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: ['Certainly. Here is the dossier:', '', '```json', JSON.stringify(fixtureDossier), '```', ''].join(String.fromCharCode(10)),
      candidates: []
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerateContent }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Fenced output' } });
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.meta.projectId).toBe(fixtureDossier.meta.projectId);
  });

  it('returns a sanitized 500 when the model returns no JSON at all', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: 'I was unable to complete that research request.',
      candidates: []
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerateContent }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Refusal path' } });
    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.jsonData.error).toBe('An error occurred during research synthesis. Please try again.');
  });
  it('surfaces an upstream 429 as 429, not a generic 500', async () => {
    // Depleted Gemini credits used to be indistinguishable from a code bug.
    process.env.GEMINI_API_KEY = 'test-key';

    const mockGenerateContent = vi.fn().mockImplementation(() => {
      const error: any = new Error('{"error":{"code":429,"message":"Your prepayment credits are depleted."}}');
      error.status = 429;
      return Promise.reject(error);
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerateContent }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Quota path' } });
    await handler(req, res);

    expect(res.statusCode).toBe(429);
    expect(res.jsonData.error).toContain('quota or credits');
    expect(res.jsonData.error).not.toContain('prepayment');
  });

  it('surfaces a retired-model 404 as 503 naming the override', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockGenerateContent = vi.fn().mockImplementation(() => {
      const error: any = new Error('This model models/gemini-2.5-flash is no longer available to new users.');
      error.status = 404;
      return Promise.reject(error);
    });

    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerateContent }
    } as any));

    const { req, res } = createMockReqRes({ method: 'POST', body: { topic: 'Retired model path' } });
    await handler(req, res);

    expect(res.statusCode).toBe(503);
    expect(res.jsonData.error).toContain('GEMINI_DOSSIER_MODEL');
  });
});
