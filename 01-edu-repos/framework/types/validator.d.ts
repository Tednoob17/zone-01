export type ValidatorFailure<T extends Def> = {
  type: T['type']
  path: (string | number)[]
  value: unknown
}

type Validator<T extends Def> = (
  value: unknown,
  path?: (string | number)[],
) => ValidatorFailure<T>[]

type DefArray<T extends Def> = {
  type: 'array'
  of: Def
  report: Validator<T>
  optional?: boolean
  description?: string
  assert: (value: unknown) => ReturnType<T['assert']>[]
}

type DefList<T extends readonly (string | number)[]> = {
  type: 'list'
  of: T
  report: Validator<DefList<T>>
  optional?: boolean
  description?: string
  assert: (value: unknown) => T[number]
}

type DefUnion<T extends readonly Def[]> = {
  type: 'union'
  of: T
  report: Validator<DefUnion<T>>
  optional?: boolean
  description?: string
  assert: (value: unknown) => ReturnType<T[number]['assert']>
}

type DefObject<T extends Record<string, Def>> = {
  type: 'object'
  properties: { [K in keyof T]: T[K] }
  report: Validator<T[keyof T]>
  optional?: boolean
  description?: string
  assert: (value: unknown) => { [K in keyof T]: ReturnType<T[K]['assert']> }
}

type DefString = {
  type: 'string'
  assert: AssertType<string>
  report: Validator<DefString>
  optional?: boolean
  description?: string
}

type DefNumber = {
  type: 'number'
  assert: AssertType<number>
  report: Validator<DefNumber>
  optional?: boolean
  description?: string
}

type DefBoolean = {
  type: 'boolean'
  assert: AssertType<boolean>
  report: Validator<DefBoolean>
  optional?: boolean
  description?: string
}

/**
 * The base type for all validator definitions.
 */
export type DefBase =
  | DefString
  | DefNumber
  | DefBoolean
  // deno-lint-ignore no-explicit-any
  | DefList<any>
  // deno-lint-ignore no-explicit-any
  | DefArray<any>
  // deno-lint-ignore no-explicit-any
  | DefUnion<any>
  // deno-lint-ignore no-explicit-any
  | DefObject<Record<string, any>>

export type OptionalAssert<T extends Def['assert']> = (
  value: unknown,
) => ReturnType<T> | undefined | null

export type Optional<T extends Def> = T & {
  assert: OptionalAssert<T['assert']>
}

type AssertType<T> = (value: unknown) => T

/**
 * A validator definition, which can be a base type, an array, an object, or a union.
 */
export type Def<T = unknown> = T extends DefBase ? DefArray<T>
  : T extends Record<string, DefBase> ? DefObject<T>
  : DefBase

/**
 * Infers the asserted type from a validator definition.
 *
 * @template T - The validator definition.
 * @example
 * ```ts
 * import { OBJ, STR, NUM, type Asserted } from './validator.ts';
 *
 * const User = OBJ({
 *   id: NUM(),
 *   name: STR(),
 * });
 *
 * type UserType = Asserted<typeof User>;
 * // { id: number; name: string; }
 * ```
 */
export type Asserted<T> = [T] extends [Def] ? ReturnType<T['assert']> : void
