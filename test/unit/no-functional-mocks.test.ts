import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('production data sources', () => {
  it('does not ship the legacy mock store or localStorage persistence', () => {
    expect(existsSync(resolve('src/data/mockData.ts'))).toBe(false);
    expect(existsSync(resolve('src/store/AppContext.tsx'))).toBe(false);
    const app = readFileSync(resolve('src/App.tsx'), 'utf8');
    expect(app).not.toContain('AppProvider');
    expect(app).not.toContain('localStorage');
  });
});
