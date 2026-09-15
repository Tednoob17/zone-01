import type { BindParameters, BindValue } from '@db/sqlite'

/**
 * Type definition for the `sql` template tag function.
 * It allows executing SQL queries with parameter binding and retrieving results in various formats.
 */
export type Sql = <
  T extends { [k in string]: unknown } | undefined,
  P extends BindValue | BindParameters | undefined,
>(sqlArr: TemplateStringsArray, ...vars: unknown[]) => {
  get: (params?: P) => T | undefined
  all: (params?: P) => T[]
  run: (params?: P) => void
  value: (params?: P) => T[keyof T][] | undefined
}
