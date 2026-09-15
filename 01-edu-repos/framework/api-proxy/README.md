# Vite API Proxy

A tiny Vite dev plugin that proxies API requests (e.g. `/api/*`) to a local
backend, streaming requests/responses and preserving headers, status, and
cookies. Useful to avoid CORS during local development.

> (We had issues with the built-in proxy from vite)
