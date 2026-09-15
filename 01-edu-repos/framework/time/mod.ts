/**
 * Shared functions to manage time in seconds instead of milliseconds
 * @module
 */

/**
 * The timestamp (in seconds) when the current process started.
 *
 * @example
 * ```ts
 * import { startTime } from './time.ts';
 *
 * console.log(`Process started at: ${new Date(startTime * 1000)}`);
 * ```
 */
export const startTime = performance.timeOrigin / 1000
let lastTime = startTime
/**
 * Return the current timestamp in seconds since the epoch.
 * Uses the performance API for high precision timing.
 * Ensured to be unique per process.
 *
 * @example
 * ```ts
 * import { now } from './time.ts';
 *
 * const timestamp = now();
 * console.log(timestamp);
 * ```
 */
export const now = (): number => {
  const time = startTime + performance.now() / 1000
  if (time === lastTime) return now()
  lastTime = time
  return time
}

/** One second in seconds.
 *
 * @example
 * ```ts
 * import { SEC } from './time.ts';
 *
 * const tenSeconds = 10 * SEC;
 * ```
 */
export const SEC = 1
/** One minute in seconds.
 *
 * @example
 * ```ts
 * import { MIN } from './time.ts';
 *
 * const fiveMinutes = 5 * MIN;
 * ```
 */
export const MIN = 60
/** One hour in seconds.
 *
 * @example
 * ```ts
 * import { HOUR } from './time.ts';
 *
 * const twoHours = 2 * HOUR;
 * ```
 */
export const HOUR = 60 * MIN
/** One day in seconds.
 *
 * @example
 * ```ts
 * import { DAY } from './time.ts';
 *
 * const threeDays = 3 * DAY;
 * ```
 */
export const DAY = 24 * HOUR
/** One week in seconds.
 *
 * @example
 * ```ts
 * import { WEEK } from './time.ts';
 *
 * const twoWeeks = 2 * WEEK;
 * ```
 */
export const WEEK = 7 * DAY
/** One year in seconds (accounting for leap years).
 *
 * @example
 * ```ts
 * import { YEAR } from './time.ts';
 *
 * const fiveYears = 5 * YEAR;
 * ```
 */
export const YEAR = 365.2422 * DAY
