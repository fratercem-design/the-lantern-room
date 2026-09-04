import { defineConfig } from 'vitest/config';

// Live tests hit the real Hugging Face router, cost inference credits, and need
// a local HF token, so they are excluded from the default suite. Opt in with
// LANTERN_LIVE=1 (see the test:live script).
export default defineConfig({
  test: {
    exclude: process.env.LANTERN_LIVE
      ? ['**/node_modules/**', '**/dist/**']
      : ['**/node_modules/**', '**/dist/**', '**/*.live.test.ts']
  }
});
