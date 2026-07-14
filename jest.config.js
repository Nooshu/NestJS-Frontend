/**
 * Jest configuration for unit/integration specs (files matching *.spec.ts under src).
 *
 * Coverage / transform choices:
 * - TypeScript runs through src/test/ts-jest-istanbul-nestjs.js (not raw ts-jest)
 *   so Nest emitDecoratorMetadata design:paramtypes branches do not break the
 *   100% global coverage gate.
 * - Frontend ESM under src/frontend/js is transformed with babel-jest for Node.
 * - Modules, DTOs, configs, main.ts, and this transform helper are excluded from
 *   collectCoverageFrom (composition roots / types, not behaviour under test).
 * - Coverage thresholds are 100% statements/branches/functions/lines globally.
 * - jsdom and some CSS tooling packages are moduleNameMapper-mocked for Node.
 *
 * @see src/test/ts-jest-istanbul-nestjs.js
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.tsx?$': '<rootDir>/src/test/ts-jest-istanbul-nestjs.js',
    '^.+/src/frontend/js/.+\\.js$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.config.ts',
    '!src/**/*.types.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/test/mocks/**',
    '!src/test/setup-global-dom.ts',
    '!src/test/ts-jest-istanbul-nestjs.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'html', 'json', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/test/setup-global-dom.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^jsdom$': '<rootDir>/src/test/mocks/jsdom.ts',
    '^@csstools/css-calc$': '<rootDir>/src/test/mocks/csstools-css-calc.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config/(.*)$': '<rootDir>/src/shared/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/shared/services/$1',
    '^@middleware/(.*)$': '<rootDir>/src/shared/middleware/$1',
    '^@controllers/(.*)$': '<rootDir>/src/shared/controllers/$1',
    '^@filters/(.*)$': '<rootDir>/src/shared/filters/$1',
    '^@interceptors/(.*)$': '<rootDir>/src/shared/interceptors/$1',
    '^@guards/(.*)$': '<rootDir>/src/shared/guards/$1',
    '^@decorators/(.*)$': '<rootDir>/src/shared/decorators/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
    '^@views/(.*)$': '<rootDir>/src/views/$1',
    '^@adapters/(.*)$': '<rootDir>/src/adapters/$1',
    '^@cache/(.*)$': '<rootDir>/src/cache/$1',
    '^@logger/(.*)$': '<rootDir>/src/logger/$1',
  },
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/e2e/',
    '/tests-examples/',
    '/dist/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jsdom|parse5|@exodus|html-encoding-sniffer|whatwg-url|data-urls|abab|cssom|nwsapi|domexception|webidl-conversions|tr46|ws|form-data|fetch-blob|node-domexception)/)',
  ],
};
