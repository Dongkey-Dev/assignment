import { ZodNullable, ZodOptional, ZodString, z } from 'zod';

const testSchema = z.string().optional().nullable();

describe('zodSchema Type Test', () => {
  it('should return a valid schema', () => {
    expect(testSchema).toBeDefined();
  });

  it('should return a nullable type', () => {
    expect(testSchema instanceof ZodNullable).toBeTruthy();
  });

  it('should return a optional type', () => {
    expect(testSchema.unwrap() instanceof ZodOptional).toBeTruthy();
  });

  it('should return a string type', () => {
    expect(testSchema.unwrap().unwrap() instanceof ZodString).toBeTruthy();
  });
});
