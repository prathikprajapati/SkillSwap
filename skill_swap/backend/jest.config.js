module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma)/)',
  ],

  // Run tests sequentially to avoid database state pollution
  maxWorkers: 1,

  // Increase test timeout
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  // Load test environment variables
  setupFiles: ['dotenv/config'],
  testEnvironmentOptions: {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL_TEST || 'mysql://johndoe:randompassword@localhost:3306/mydb_test',

      JWT_SECRET: 'test-jwt-secret-key-for-testing-only'
    }
  }
};
