import { NUM, OBJ, STR } from './validator.ts'
import { route } from './router.ts'
import { now, startTime } from '@01edu/time'
import { CI_COMMIT_SHA } from './env.ts'

/**
 * Creates a health check route that returns the application's status, uptime, version, and instance ID.
 *
 * @example
 * ```ts
 * import { makeRouter, route } from '@01edu/router';
 * import { createHealthRoute } from '@01edu/api/health';
 *
 * const routes = {
 *   'GET/api/health': createHealthRoute(),
 * };
 *
 * const router = makeRouter(routes,{});
 * ```
 *
 * @returns A route handler for the health check endpoint.
 */
export const createHealthRoute = () => {
  return route({
    output: OBJ({
      status: STR(),
      timestamp: STR(),
      uptime: NUM(),
      version: STR(),
      instanceId: STR(),
    }),
    fn: () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: now() - startTime,
        version: CI_COMMIT_SHA || 'unknown',
        instanceId: startTime.toString(),
      }
    },
  })
}
