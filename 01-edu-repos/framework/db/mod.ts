/**
 * Create and interact with SQLite database tables.
 * You define the table's columns, and it automatically generates functions to
 * insert, update, find, and run custom SQL queries on that table,
 * reducing sql boilerplate.
 * @module
 */

import { assertEquals } from '@std/assert/equals'
import {
  type BindParameters,
  type BindValue,
  Database,
  type RestBindParameters,
} from '@db/sqlite'
import type { Expand, MatchKeys, UnionToIntersection } from '@01edu/types'
import type { Sql } from '@01edu/types/db'
import { respond } from '@01edu/api/response'
import { APP_ENV, ENV } from '@01edu/api/env'

const dbPath = ENV('DATABASE_PATH', ':memory:')
/**
 * The main database connection.
 * It is a singleton instance of the `Database` class from the `@db/sqlite` module.
 *
 * @example
 * ```ts
 * import { db } from '@01edu/db';
 *
 * const result = db.query('SELECT * FROM users');
 * ```
 */
type GT = {
  ['@01edu/db']: Database | undefined
}

const sharedDb = (globalThis as unknown as GT)['@01edu/db']
export const db: Database = sharedDb ||
  ((globalThis as unknown as GT)['@01edu/db'] = new Database(dbPath))

if (!sharedDb) {
  // MEMORY -> possible corruption on crash during COMMIT
  db.exec('PRAGMA temp_store = memory')
  db.exec('PRAGMA synchronous = NORMAL ') // OFF -> possible db corruption on power outage
  db.exec("PRAGMA encoding = 'UTF-8'")
  if (APP_ENV === 'prod') {
    db.exec('PRAGMA journal_mode = WAL') // OFF -> possible db corruption on ROLLBACK
    // PRAGMA busy_timeout = 5000 -- Timeout set for killing long duration queries
    // PRAGMA wal_autocheckpoint = 0 -- only activate this if high volume
  }
}
/**
 * A mapping of database type names to their corresponding JavaScript types.
 */
export type DBTypes = {
  TEXT: string
  JSON: unknown
  BLOB: Uint8Array
  INTEGER: number
  REAL: number
}

type ColDef = {
  type: keyof DBTypes
  primary?: boolean
  optional?: boolean
  default?: () => unknown
  join?: Table
}

/**
 * Defines the structure of a database table's columns.
 *
 * @example
 * ```ts
 * import type { TableProperties } from '@01edu/db';
 *
 * const userProperties: TableProperties = {
 *   // for now, only 'INTEGER' can be primary
 *   id: { type: 'INTEGER', primary: true },
 *   name: { type: 'TEXT' },
 *   email: { type: 'TEXT', optional: true },
 * };
 * ```
 */
export type TableProperties = Record<string, ColDef>
type Table = { name: string; properties: TableProperties }
type PrimaryKeys<T> = MatchKeys<T, { primary: true }>
type OptionalKeys<T> = MatchKeys<T, { optional: true }>
type RequiredKeys<T> = Exclude<NonPrimaryKeys<T>, OptionalKeys<T>>
type NonPrimaryKeys<T> = Exclude<keyof T, PrimaryKeys<T>>
type InferInsertType<T extends Record<string, { type: keyof DBTypes }>> =
  Expand<
    & { [K in RequiredKeys<T>]: DBTypes[T[K]['type']] }
    & { [K in OptionalKeys<T>]?: DBTypes[T[K]['type']] | null }
  >

type SelectReturnType<T extends Record<string, ColDef>, K extends keyof T> = {
  [Column in K]: DBTypes[T[Column]['type']]
}

type FlattenProperties<T extends TableProperties> = Expand<
  UnionToIntersection<
    {
      [K in keyof T]: T[K] extends { join: Table }
        ? { [P in K]: T[K] } & FlattenProperties<T[K]['join']['properties']>
        : { [P in K]: T[K] }
    }[keyof T]
  >
>

/**
 * Represents a row from a database table, with type inference based on the table properties.
 *
 * @example
 * ```ts
 * import { createTable, type Row } from '@01edu/db';
 *
 * const users = createTable('users', {
 *   id: { type: 'INTEGER', primary: true },
 *   name: { type: 'TEXT' },
 * });
 *
 * type UserRow = Row<typeof users.properties>;
 * // UserRow is equivalent to: { id: number; name: string; }
 * ```
 */
export type Row<
  P extends TableProperties,
  K extends keyof FlattenProperties<P> = keyof FlattenProperties<P>,
> = Expand<SelectReturnType<FlattenProperties<P>, K>>

const isPrimary = ([_, def]: [string, ColDef]) => def.primary

/**
 * The API returned by `createTable`, providing methods to interact with a specific database table.
 */
export type TableAPI<N extends string, P extends TableProperties> = {
  /** The name of the table. */
  name: N
  /** The properties of the table's columns. */
  properties: P
  /**
   * Inserts a new row into the table.
   * @param entries - The data to insert.
   * @returns The ID of the newly inserted row.
   *
   * @example
   * ```ts
   * const newUserId = users.insert({ name: 'Alice' });
   * ```
   */
  insert: (entries: InferInsertType<P>) => number
  /**
   * Updates an existing row in the table.
   * @param entries - The data to update, including the primary key.
   * @returns The number of rows affected.
   *
   * @example
   * ```ts
   * users.update({ id: 1, name: 'Bob' });
   * ```
   */
  update: (
    entries: Expand<
      & { [K in PrimaryKeys<P>]: DBTypes[P[K]['type']] }
      & Partial<InferInsertType<P>>
    >,
  ) => number
  /**
   * Checks if a row with the given ID exists.
   * @param id - The ID to check.
   * @returns `true` if the row exists, `false` otherwise.
   *
   * @example
   * ```ts
   * if (users.exists(1)) {
   *   console.log('User 1 exists!');
   * }
   * ```
   */
  exists: (id: number) => boolean
  /**
   * Retrieves a single row by its ID.
   * @param id - The ID of the row to retrieve.
   * @returns The row data, or `undefined` if not found.
   *
   * @example
   * ```ts
   * const user = users.get(1);
   * ```
   */
  get: (id: number) => Row<P, keyof FlattenProperties<P>> | undefined
  /**
   * Retrieves a single row by its ID, throwing an error if not found.
   * @param id - The ID of the row to retrieve.
   * @returns The row data.
   * @throws {respond.NotFoundError} if the row is not found.
   *
   * @example
   * ```ts
   * try {
   *   const user = users.require(1);
   * } catch (e) {
   *   console.error(e.message); // "users not found"
   * }
   * ```
   */
  require: (id: number | undefined) => Row<P, keyof FlattenProperties<P>>
  /**
   * Asserts that a row with the given ID exists, throwing an error if not.
   * @param id - The ID to check.
   * @throws {respond.NotFoundError} if the row is not found.
   *
   * @example
   * ```ts
   * try {
   *   users.assert(1);
   *   console.log('User 1 exists.');
   * } catch (e) {
   *   console.error(e.message); // "users not found"
   * }
   * ```
   */
  assert: (id: number | undefined) => void
  /**
   * Executes a custom SQL query.
   * @param sqlArr - The SQL query as a template literal.
   * @param vars - The parameters to bind to the query.
   * @returns An object with `get` and `all` methods to retrieve the results.
   *
   * @example
   * ```ts
   * const user = users.sql`SELECT * FROM users WHERE id = ${1}`.get();
   * const allUsers = users.sql`SELECT * FROM users`.all();
   * ```
   */
  sql: <
    K extends keyof FlattenProperties<P>,
    T extends BindParameters | BindValue | undefined,
  >(sqlArr: TemplateStringsArray, ...vars: unknown[]) => {
    get: (params?: T, ...args: RestBindParameters) => Row<P, K> | undefined
    all: (params?: T, ...args: RestBindParameters) => Row<P, K>[]
  }
}

/**
 * Creates a new database table and returns an API for interacting with it.
 *
 * @param name - The name of the table.
 * @param properties - The column definitions for the table.
 * @returns A table API object.
 *
 * @example
 * ```ts
 * import { createTable } from '@01edu/db';
 *
 * const users = createTable('users', {
 *   id: { type: 'INTEGER', primary: true },
 *   name: { type: 'TEXT' },
 * });
 *
 * const newUserId = users.insert({ name: 'Alice' });
 * const user = users.get(newUserId);
 * ```
 */
export const createTable = <N extends string, P extends TableProperties>(
  name: N,
  properties: P,
): TableAPI<N, P> => {
  type FlatProps = FlattenProperties<P>
  const keys = Object.keys(properties)
    .filter((k: keyof P) => !properties[k].primary)

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${name} (${
    [
      ...Object.entries(properties).map(
        ([key, def]) =>
          `  ${key} ${def.type}${
            (def.primary && ' PRIMARY KEY AUTOINCREMENT NOT NULL') ||
            (!def.optional && ' NOT NULL') ||
            ''
          }`,
      ),
      ...Object.entries(properties)
        .filter(([_, def]) => def.join)
        .map(
          ([key, def]) =>
            `  FOREIGN KEY (${key}) REFERENCES ${def.join!.name}(${
              Object.entries(def.join!.properties).find(isPrimary)?.[0]
            })`,
        ),
    ].join(',\n')
  })`)

  const columns = db.sql<ColDef>`
    SELECT
      name,
      type,
      json(CASE WHEN pk = 1 THEN 'true' ELSE 'false' END) as "primary",
      json(CASE WHEN "notnull" = 1 THEN 'false' ELSE 'true' END) as "optional"
    FROM pragma_table_info(${name})
  `

  assertEquals(
    columns,
    Object.entries(properties).map(
      ([name, { join: _, default: __, optional, primary, type }]) => ({
        name,
        type,
        primary: Boolean(primary),
        optional: Boolean(optional),
      }),
    ),
    'Database expected schema and current schema missmatch, maybe you need a migration ?',
  )

  const insertStmt = db.prepare(`
    INSERT INTO ${name} (${keys.join(', ')})
    VALUES (${keys.map((k) => `:${k}`).join(', ')})
  `)

  const insert = (entries: InferInsertType<P>) => {
    insertStmt.run(entries)
    return db.lastInsertRowId
  }

  // Add dynamic update functionality
  const primaryKey = Object.keys(properties)
    .find((k: keyof P) => properties[k].primary)

  const updateStmt = db.prepare(`
    UPDATE ${name} SET
    ${keys.map((k) => `${k} = COALESCE(:${k}, ${k})`).join(', ')}
    WHERE ${primaryKey} = :${primaryKey}
  `)

  const update = (
    entries: Expand<
      & { [K in PrimaryKeys<P>]: DBTypes[P[K]['type']] }
      & Partial<InferInsertType<P>>
    >,
  ) => {
    // Make sure the primary key field exists in the entries
    if (!entries[primaryKey as keyof typeof entries]) {
      throw Error(`Primary key ${primaryKey} must be provided for update`)
    }
    return updateStmt.run(entries)
  }

  const existsStmt = db.prepare(`
    SELECT EXISTS (SELECT 1 FROM ${name} WHERE ${primaryKey} = ?)
  `)

  const notFound = { message: `${name} not found` }
  const exists = (id: number) => existsStmt.value(id)?.[0] === 1
  const assert = (id: number | undefined) => {
    if (id && exists(id)) return
    throw new respond.NotFoundError(notFound)
  }

  const getByIdStmt = db.prepare(
    `SELECT * FROM ${name} WHERE ${primaryKey} = ? LIMIT 1`.trim(),
  )

  const get = (id: number): Row<P, keyof FlatProps> | undefined =>
    getByIdStmt.get(id)

  const require = (id: number | undefined) => {
    const match = id && getByIdStmt.get(id)
    if (!match) throw new respond.NotFoundError(notFound)
    return match as Row<P, keyof FlatProps>
  }

  const sql = <
    K extends keyof FlatProps,
    T extends BindParameters | BindValue | undefined,
  >(sqlArr: TemplateStringsArray, ...vars: unknown[]) => {
    const query = String.raw(sqlArr, ...vars)
    const stmt = db.prepare(query)
    return {
      get: stmt.get.bind(stmt) as (
        params?: T,
        ...args: RestBindParameters
      ) => Row<P, K> | undefined,
      all: stmt.all.bind(stmt) as (
        params?: T,
        ...args: RestBindParameters
      ) => Row<P, K>[],
    }
  }

  return {
    name,
    insert,
    update,
    exists,
    get,
    require,
    assert,
    sql,
    properties,
  }
}

/**
 * A template literal tag for executing arbitrary SQL queries.
 *
 * @param sqlArr - The SQL query as a template literal.
 * @param vars - The parameters to bind to the query.
 * @returns An object with methods to retrieve results (`get`, `all`, `value`) or execute the query (`run`).
 *
 * @example
 * ```ts
 * import { sql } from '@01edu/db';
 *
 * const result = sql`SELECT * FROM users WHERE id = ${1}`.get();
 * ```
 */
export const sql: Sql = <
  T extends { [k in string]: unknown } | undefined,
  P extends BindValue | BindParameters | undefined,
>(sqlArr: TemplateStringsArray, ...vars: unknown[]) => {
  const query = String.raw(sqlArr, ...vars)
  const stmt = db.prepare(query)
  return {
    get: stmt.get.bind(stmt) as (params?: P) => T | undefined,
    all: stmt.all.bind(stmt) as (params?: P) => T[],
    run: stmt.run.bind(stmt),
    value: stmt.value.bind(stmt),
  }
}

/**
 * Creates a restore point for the database, for use in testing environments.
 * This function will throw an error if called in a production environment.
 *
 * @returns A function that, when called, restores the database to the point when `makeRestorePoint` was called.
 *
 * @example
 * ```ts
 * import { makeRestorePoint, createTable } from '@01edu/db';
 *
 * const users = createTable('users', {
 *   id: { type: 'INTEGER', primary: true },
 *   name: { type: 'TEXT' },
 * });
 *
 * const restore = makeRestorePoint();
 *
 * // ... perform some database operations
 * users.insert({ name: 'test' });
 *
 * restore(); // database is now back to its original state
 * ```
 */
export const makeRestorePoint = (): () => void => {
  if (APP_ENV === 'prod') {
    return () => {
      throw Error('attempt to reset the database in prod env')
    }
  }
  const emptyDb = new Database(':memory:')
  db.backup(emptyDb)
  return () => emptyDb.backup(db)
}

/**
 * A template literal tag for creating a SQL query that checks for the existence of something.
 *
 * @param query - The `SELECT` clause to check for.
 * @param args - The parameters to bind to the query.
 * @returns A function that takes bind parameters and returns `true` if the query returns any rows, `false` otherwise.
 *
 * @example
 * ```ts
 * import { sqlCheck, createTable } from '@01edu/db';
 *
 * const users = createTable('users', {
 *   id: { type: 'INTEGER', primary: true },
 *   name: { type: 'TEXT' },
 * });
 *
 * const userExists = sqlCheck`FROM users WHERE id = :id`;
 *
 * if (userExists({ id: 1 })) {
 *   console.log('User 1 exists!');
 * }
 * ```
 */
export const sqlCheck = <T extends BindValue | BindParameters>(
  query: TemplateStringsArray,
  ...args: unknown[]
): (params: T) => boolean => {
  const { value } = sql`SELECT EXISTS(SELECT 1 ${String.raw(query, ...args)})`
  return ((params: T) => value(params)?.[0] === 1)
}
