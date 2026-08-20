import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../api/dossiers';

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
    delete process.env.GEMINI_API_KEY;
  });

  it('rejects GET requests with 405 Method Not Allowed', async () => {
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
});
