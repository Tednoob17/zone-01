/**
 * Util to define event variable with default fallback.
 * Also define and share the expected `APP_ENV` required by our apps.
 * @module
 */

/**
 * Retrieves an environment variable by key.
 * Throws an error if the variable is not set and no fallback is provided.
 *
 * @param key - The name of the environment variable.
 * @param fallback - An optional default value to use if the variable is not set.
 * @returns The value of the environment variable.
 *
 * @example
 * ```ts
 * import { ENV } from '@01edu/api/env';
 *
 * const port = ENV('PORT', '8080');
 * ```
 */
type EnvGetter = (key: string, fallback?: string) => string
export const ENV: EnvGetter = (key, fallback) => {
  const value = Deno.env.get(key)
  if (value) return value
  if (fallback != null) return fallback
  throw Error(`${key}: field required in the env`)
}

/**
 * The possible application environments.
 */
export type AppEnvironments = 'dev' | 'prod' | 'test'

/**
 * The current application environment, determined by the `APP_ENV` environment variable.
 * Defaults to 'dev' if not set.
 *
 * @example
 * ```ts
 * import { APP_ENV } from '@01edu/api/env';
 *
 * if (APP_ENV === 'prod') {
 *   console.log('Running in production mode');
 * }
 * ```
 */
export const APP_ENV = ENV('APP_ENV', 'dev') as AppEnvironments
if (APP_ENV !== 'dev' && APP_ENV !== 'prod' && APP_ENV !== 'test') {
  throw Error(`APP_ENV: "${APP_ENV}" must be "dev", "test" or "prod"`)
}

/**
 * The git commit SHA of the current build, typically provided by a CI/CD system.
 *
 * @example
 * ```ts
 * import { CI_COMMIT_SHA } from '@01edu/api/env';
 *
 * console.log(`Build version: ${CI_COMMIT_SHA}`);
 * ```
 */
export const CI_COMMIT_SHA: string = ENV('CI_COMMIT_SHA', '')
/**
 * An authentication token for a developer tool service.
 *
 * @example
 * ```ts
 * import { DEVTOOL_REPORT_TOKEN } from '@01edu/api/env';
 *
 * const headers = {
 *   'Authorization': `Bearer ${DEVTOOL_REPORT_TOKEN}`,
 * };
 * ```
 */
export const DEVTOOL_REPORT_TOKEN: string = ENV('DEVTOOL_REPORT_TOKEN', '')
/**
 * The URL for a developer tool service.
 *
 * @example
 * ```ts
 * import { DEVTOOL_URL } from '@01edu/api/env';
 *
 * fetch(`${DEVTOOL_URL}/api/status`);
 * ```
 */
export const DEVTOOL_URL: string = ENV('DEVTOOL_URL', '')

/**
 * Internal token for dev access in production.
 *
 * @example
 * ```ts
 * import { DEVTOOL_ACCESS_TOKEN } from '@01edu/api/env';
 *
 * if (req.headers.get('Authorization') === `Bearer ${DEVTOOL_ACCESS_TOKEN}`) {
 *   // Allow access
 * }
 * ```
 */
export const DEVTOOL_ACCESS_TOKEN: string = ENV('DEVTOOL_ACCESS_TOKEN', '')

const forAppEnv =
  (env: AppEnvironments) => (key: string, fallback?: string): string => {
    const value = Deno.env.get(key)
    if (value) return value
    if (APP_ENV !== env && fallback != null) return fallback
    throw Error(`${key}: field required in the env for APP_ENV=${env}`)
  }

/**
 * PROD env getter
 *
 * Like `ENV`, but stricter: returns the environment variable if set.
 * If the variable is not set, a `fallback` is only used when the current
 * `APP_ENV` is not `'prod'`. When `APP_ENV === 'prod'` and the value is
 * missing (and no fallback is provided) an error is thrown.
 *
 * Use `PROD` when a value must be present in production but may be defaulted
 * in development or test environments.
 *
 * @example
 * ```ts
 * import { PROD } from '@01edu/api/env';
 *
 * // In production this will throw if REDIS_URL is not set.
 * const redisUrl = PROD('REDIS_URL', 'redis://localhost:6379');
 * ```
 */
export const PROD: EnvGetter = forAppEnv('prod')

/**
 *
 * The root for all relative URLs will be this BASE_URL, so it should start and end with a slash.
 * If base URL is not set, it defaults to '/', which means the app is served at the root of the domain.
 * If the current application is deployed at https://domain.com/tournament/, with <base href="/tournament/" />
 * <a href="dashboard"> will point to https://domain.com/tournament/dashboard
 *
 * @example
 * ```ts
 * import { BASE_URL } from '@01edu/api/env';
 *
 * // for this example the 'index.html' file's `<base href ="/" />` tag is dynamically replaced during the build process to adapt to the deployment environment.
 * const html = Deno.readTextFileSync(import.meta.dirname + '/dist/index.html')
   .replace(
     '<base href="/" />',
     `<base href="${BASE_URL}" />`,
   )
 * ```
 */
export const BASE_URL: string = PROD('BASE_URL', '/')
if (!BASE_URL.startsWith('/') || !BASE_URL.endsWith('/')) {
  throw Error('incorrect BASE_URL: must start and end with /')
}

/**
 * TEST env getter
 *
 * Like `ENV`, but stricter: returns the environment variable if set.
 * If the variable is not set, a `fallback` is only used when the current
 * `APP_ENV` is not `'test'`. When `APP_ENV === 'test'` and the value is
 * missing (and no fallback is provided) an error is thrown.
 *
 * Use `TEST` when a value must be present in production but may be defaulted
 * in development or test environments.
 *
 * @example
 * ```ts
 * import { TEST } from '@01edu/api/env';
 *
 * // In test env this will throw if REDIS_URL is not set.
 * const redisUrl = TEST('REDIS_URL', 'redis://localhost:6379');
 * ```
 */
export const TEST: EnvGetter = forAppEnv('test')
/**
 * DEV env getter
 *
 * Like `ENV`, but stricter: returns the environment variable if set.
 * If the variable is not set, a `fallback` is only used when the current
 * `APP_ENV` is not `'dev'`. When `APP_ENV === 'dev'` and the value is
 * missing (and no fallback is provided) an error is thrown.
 *
 * Use `DEV` when a value must be present in production but may be defaulted
 * in development or dev environments.
 *
 * @example
 * ```ts
 * import { DEV } from '@01edu/api/env';
 *
 * // In dev env this will throw if REDIS_URL is not set.
 * const redisUrl = DEV('REDIS_URL', 'redis://localhost:6379');
 * ```
 */
export const DEV: EnvGetter = forAppEnv('dev')
