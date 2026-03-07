import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { Plugin, ViteDevServer } from 'vite'
/**
 * Vite development proxy that forwards API requests to a local backend.
 *
 * Behavior:
 * - Intercepts requests whose URL starts with the provided `prefix` (e.g. "/api/").
 * - Forwards the request to `http://localhost:{port}{req.url}` preserving method and headers.
 * - Streams the request body upstream for non-GET/HEAD methods.
 * - Streams the upstream response back to the client, preserving status and headers.
 * - Coalesces multiple Set-Cookie headers into a single `set-cookie` header.
 * - Aborts the upstream fetch if the client connection closes.
 *
 * This helps avoid CORS during local development by keeping frontend calls under a shared origin path.
 *
 * Requirements:
 * - Deno or Node 18+ (for global `fetch` and `Readable.toWeb`/`Readable.fromWeb`)
 *
 * @param {object} options Configuration options.
 * @param {number} options.port The target backend port (e.g., your Deno/Node API server).
 * @param {'/api/'} options.prefix URL prefix to match and proxy. Requests not starting with this prefix are ignored.
 * @returns {import('vite').Plugin} A Vite plugin that registers the proxy middleware.
 *
 * @example
 * // vite.config.ts
 * // import { defineConfig } from 'vite'
 * // import { apiProxy } from '@01edu/api-proxy'
 * //
 * // export default defineConfig({
 * //   plugins: [
 * //     apiProxy({ port: 8000, prefix: '/api/' }),
 * //   ],
 * // })
 */
export const apiProxy = (
  { port, prefix }: { port: number; prefix: '/api/' },
): Plugin => ({
  name: 'deno-proxy',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      if (!req.url!.startsWith(prefix)) return next()
      const hasBody = !(req.method === 'GET' || req.method === 'HEAD')
      const controller = new AbortController()
      res.on('close', () => controller.abort())
      fetch(`http://localhost:${port}${req.url}`, {
        method: req.method,
        signal: controller.signal,
        headers: { ...req.headers } as Record<string, string>,
        body: hasBody ? Readable.toWeb(req) : undefined,
        redirect: 'manual',
      })
        .then(async (apiRes) => {
          const headers = Object.fromEntries(apiRes.headers)
          const cookies = apiRes.headers.getSetCookie()
          cookies.length > 0 && (headers['set-cookie'] = cookies.join(','))
          res.writeHead(apiRes.status, headers)
          apiRes.body && (await pipeline(Readable.fromWeb(apiRes.body), res))
          res.end()
        })
        .catch((err) => {
          if (controller.signal.aborted) return
          console.error('Error while attempting to proxy', req.method, req.url)
          next(err)
        })
    })
  },
})
