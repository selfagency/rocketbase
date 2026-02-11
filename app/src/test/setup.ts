// test/setup.ts
import { vi } from 'vitest';

// Mock $env/dynamic/public for browser tests
vi.mock('$env/dynamic/public', () => ({
  env: {
    PUBLIC_POCKETBASE_URL: 'http://localhost:8090',
  },
}));