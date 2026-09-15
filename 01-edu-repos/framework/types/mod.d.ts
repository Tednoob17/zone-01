/**
 * A collection of generic utility types for advanced type manipulation.
 * @module
 */

/**
 * Recursively makes all properties of type `T` read-only.
 *
 * Unlike the standard `Readonly<T>`, this utility traverses deeply into nested objects.
 * Functions are excluded from the recursive step to preserve their signatures.
 *
 * @template T - The type to make recursively read-only.
 * @example
 * ```ts
 * interface User {
 *   profile: {
 *     name: string;
 *   }
 * }
 * ```
 *
 * // Standard Readonly: user.profile is readonly, but user.profile.name is mutable.
 * // This Readonly: user.profile.name is also readonly.
 * type ImmutableUser = Readonly<User>;
 */
export type Readonly<T> = {
  readonly [P in keyof T]:
    // deno-lint-ignore ban-types
    T[P] extends Function ? T[P]
      : T[P] extends object ? Readonly<T[P]>
      : T[P]
}

/**
 * Forces TypeScript to compute the final shape of a type.
 *
 * This is primarily a development utility (often called `Prettify`).
 * It helps in IDEs (like VS Code) by displaying the full object structure
 * instead of type aliases or intersections (e.g., shows `{ a: string; b: number }`
 * instead of `A & B`).
 *
 * @template T - The type to expand.
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * Represents a value that can be either the value itself or a `Promise` that resolves to it.
 *
 * Useful for defining function parameters or return types that handle both synchronous
 * and asynchronous operations.
 *
 * @template T - The underlying type.
 */
export type Awaitable<T> = Promise<T> | T

/**
 * Represents a value that is considered "empty" or "missing".
 * Includes `null`, `undefined`, and `void`.
 */
export type Nullish = null | undefined | void

/**
 * Conditional type that checks if `T` is explicitly `unknown`.
 *
 * Returns `true` if `T` is `unknown`, otherwise `false`.
 *
 * @template T - The type to check.
 * @example
 * ```ts
 * type A = IsUnknown<unknown>; // true
 * type B = IsUnknown<any>;     // false (usually)
 * type C = IsUnknown<string>;  // false
 * ```
 */
export type IsUnknown<T> = unknown extends T
  ? ([T] extends [unknown] ? true : false)
  : false

/**
 * Converts a Union type to an Intersection type.
 *
 * This utilizes contravariance in function arguments to merge types.
 *
 * @template U - The union type (e.g., `A | B`).
 * @returns The intersection type (e.g., `A & B`).
 * @example
 * ```ts
 * type Union = { a: string } | { b: number };
 * type Intersection = UnionToIntersection<Union>; // { a: string } & { b: number }
 * ```
 */
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void ? I
  : never

/**
 * Extracts the keys from type `T` whose values match the type `E`.
 *
 * @template T - The object type to inspect.
 * @template E - The type condition to match against values.
 * @returns A union of keys from `T`.
 * @example
 * ```ts
 * interface Item {
 *   id: number;
 *   name: string;
 *   tags: string[];
 *   active: boolean;
 * }
 *
 * // Returns "name" | "tags"
 * type StringKeys = MatchKeys<Item, string | string[]>;
 * ```
 */
export type MatchKeys<T, E> = {
  [K in keyof T]: T[K] extends E ? K : never
}[keyof T]
