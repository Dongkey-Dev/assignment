import { ZodObject, z } from 'zod';
import { T_UUID } from '../types/uuid.type';

export type ExportedType<T, U> = {
  [K in keyof T]: T[K] extends U
    ? string
    : T[K] extends Record<string, any>
      ? ExportedType<T[K], U>
      : T[K];
};

export abstract class BaseDomain<T extends ZodObject<any>> {
  protected abstract data: z.infer<T>;
  constructor(protected zodSchema: T) {}

  private recursiveExport(
    obj: any,
    schemaShape: any,
    exportFn: (value: any) => any,
  ): any {
    return Object.keys(schemaShape).reduce((acc, key) => {
      if (!(key in obj)) return acc;
      const value = obj[key];
      let schemaValue = schemaShape[key];
      while ('unwrap' in schemaValue) schemaValue = schemaValue.unwrap();
      if (value instanceof T_UUID) {
        acc[key] = exportFn(value);
      } else if (schemaValue instanceof ZodObject) {
        acc[key] = this.recursiveExport(value, schemaValue.shape, exportFn);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  export(): z.infer<T> {
    return this.data;
  }

  exportJson(): ExportedType<z.infer<T>, T_UUID> {
    return this.recursiveExport(
      this.data,
      this.zodSchema.shape,
      (value: T_UUID) => value.exportString(),
    );
  }

  exportPersistence() {
    return this.recursiveExport(
      this.data,
      this.zodSchema.shape,
      (value: T_UUID) => value.exportBuffer(),
    );
  }

  exportJsonString(): string {
    return JSON.stringify(this.exportJson());
  }
}
