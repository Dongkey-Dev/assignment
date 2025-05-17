export type WithResult<T> = { result: string; data: T };

export function createWithResult<T>(input: T): WithResult<T> {
  return {
    result: 'success',
    data: input,
  };
}

export function createWithResultError<T>(error: T): WithResult<T> {
  return {
    result: 'fail',
    data: error,
  };
}
