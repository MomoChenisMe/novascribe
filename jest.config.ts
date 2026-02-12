import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  displayName: 'novascribe',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/src/lib/__tests__/.*\\.verify\\.ts$',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@?unified|@?unist.*|@?vfile.*|@?remark.*|@?rehype.*|@?mdast.*|@?hast.*|@?micromark.*|decode-named-character-reference|character-entities|@shikijs)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/layout.tsx',
    '!src/**/loading.tsx',
    '!src/**/not-found.tsx',
    '!src/**/error.tsx',
    '!src/generated/**',
    '!src/app/api/**',
  ],
};

export default createJestConfig(config);
