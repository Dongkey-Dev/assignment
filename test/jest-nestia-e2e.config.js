module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
  moduleNameMapper: {
    '^@auth(|/.*)$': '<rootDir>/apps/auth$1',
    '^@event(|/.*)$': '<rootDir>/apps/event$1',
    '^@gateway(|/.*)$': '<rootDir>/apps/gateway$1',
    '^@libs(|/.*)$': '<rootDir>/libs$1',
    '^@shared(|/.*)$': '<rootDir>/libs/shared$1',
    '^@constants(|/.*)$': '<rootDir>/libs/common/constants$1',
    '^@api(|/.*)$': '<rootDir>/api$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
