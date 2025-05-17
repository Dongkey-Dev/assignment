import { z } from 'zod';
import { BaseDomain } from '../util/base-domain';
import { IUpdatable } from './common.interface';
import { T_UUID, uuidSchema } from '../types/uuid.type';

const testZodSchema = z.object({
  test1: z.string(),
  test2: z.string(),
  test3: uuidSchema.optional(),
  test4: z
    .object({
      test5: uuidSchema,
    })
    .optional()
    .nullable(),
});

class MockTest
  extends BaseDomain<typeof testZodSchema>
  implements IUpdatable<z.infer<typeof testZodSchema>>
{
  constructor(protected data: z.input<typeof testZodSchema>) {
    super(testZodSchema);
  }
  update(data: Partial<z.infer<typeof testZodSchema>>): void {
    this.data = { ...this.data, ...data };
  }
}

describe('IUpdatable', () => {
  let testData;
  let testClass: MockTest;
  const inputUUID = new T_UUID();
  beforeEach(() => {
    testData = { test1: 'test1', test2: 'test2' };

    testClass = new MockTest(testData as z.input<typeof testZodSchema>);
  });
  it('should create an instance', () => {
    expect(testClass).toBeDefined();
  });

  it('should update data', () => {
    expect(testClass.exportJson()).toEqual(testData);

    testClass.update({ test1: 'test3' });
    expect(testClass.exportJson()).toEqual({
      test1: 'test3',
      test2: 'test2',
    });

    testClass.update({ test1: 'test4', test2: 'test5' });
    expect(testClass.exportJson()).toEqual({
      test1: 'test4',
      test2: 'test5',
    });
  });

  it('should update data with nested object', () => {
    testClass.update({
      test1: 'test6',
      test2: 'test7',
      test4: {
        test5: new T_UUID('test8'),
      },
    });
    expect(testClass.exportJson()).toEqual({
      test1: 'test6',
      test2: 'test7',
      test4: {
        test5: new T_UUID('test8').exportString(),
      },
    });
  });

  it('should export T_UUID to string', () => {
    testClass.update({
      test1: 'test6',
      test2: 'test7',
      test3: inputUUID,
    });
    expect(testClass.exportJson()).toEqual({
      test1: 'test6',
      test2: 'test7',
      test3: inputUUID.exportString(),
    });
  });

  it('should export nested T_UUID object to string object', () => {
    testClass.update({
      test1: 'test6',
      test2: 'test7',
      test4: {
        test5: inputUUID,
      },
    });
    expect(testClass.exportJson()).toEqual({
      test1: 'test6',
      test2: 'test7',
      test4: {
        test5: inputUUID.exportString(),
      },
    });
  });
});
