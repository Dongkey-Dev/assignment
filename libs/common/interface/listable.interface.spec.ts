import { z } from 'zod';
import { BaseDomain } from '../util/base-domain';
import { IListable } from './common.interface';

describe('IListable', () => {
  let testData;
  let testClass: MockList;
  beforeEach(() => {
    testData = {
      datas: [{ test1: 'test1' }],
      test2: 'test2',
    };

    testClass = new MockList(testData as z.input<typeof testListSchema>);
  });
  it('should create an instance', () => {
    expect(testClass).toBeDefined();
  });
});

class MockTest extends BaseDomain<typeof testZodSchema> {
  constructor(protected data: z.input<typeof testZodSchema>) {
    super(testZodSchema);
    this.data = this.zodSchema.parse(data);
  }
}

class MockList
  extends BaseDomain<typeof testListSchema>
  implements IListable<MockTest>
{
  constructor(protected data: z.input<typeof testListSchema>) {
    super(testListSchema);
    this.data = this.zodSchema.parse(data);
  }
  getData(): MockTest[] {
    throw new Error('Method not implemented.');
  }
  find(key: any): MockTest {
    throw new Error('Method not implemented.');
  }
  add(data: MockTest): this {
    throw new Error('Method not implemented.');
  }
  remove(key: any): this {
    throw new Error('Method not implemented.');
  }
  extends(data: MockTest[]): this {
    throw new Error('Method not implemented.');
  }
  orderBy(key: any): this {
    throw new Error('Method not implemented.');
  }
}

const testZodSchema = z.object({
  test1: z.string(),
});

const testListSchema = z.object({
  datas: z.array(testZodSchema),
  test2: z.string(),
});
