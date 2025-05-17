export interface IAsyncLoadable {
  loaded: boolean;
  waitUntilLoad(): Promise<'OK'>;
}

export interface IUpdatable<T> {
  update(data: Partial<T>): void;
}

export interface IFile {
  setData(data: any): void;
  getData(): File;

  setPath(path: string): void;
  getPath(): string;
}

export interface IExportable<T> {
  export(): T;
  exportJson(): any;
  exportJsonString(): string;
}

export interface IListable<T> {
  find(key: any): T;
  add(data: T): this;
  remove(key: any): this;
  extends(data: T[]): this;
  orderBy(key: any): this;
  getData(): T[];
}

export interface ICandleExportable<T> {
  exportCandle(periodMinute: number, startTime: number): T[];
}
