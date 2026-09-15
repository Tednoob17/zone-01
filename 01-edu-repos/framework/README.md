# framework

Modular TypeScript/Deno utilities for building type‑safe web apps: HTTP routing,
typed clients, SPA URL-as-state navigation, SQLite helpers, time utilities, and
shared types.

## [`api`](./api)

Type-safe HTTP toolkit: router, server wrapper, request context, logger,
response helpers, env utilities, and validator. Compose end-to-end typed APIs
with consistent logging and errors.

### [`api/router`](./api/router.ts)

Define routes with input/output schemas, optional authorization, and automatic
responses. Produces types for clients; validates GET params/body and logs with
sensitive-key redaction.

### [`api/server`](./api/server.ts)

Wraps your router with logging, error barrier, cookie parsing, trace/span IDs,
and `RequestContext` creation. Handles OPTIONS and integrates respond.* errors.

### [`api/context`](./api/context.ts)

AsyncLocalStorage-powered `RequestContext` with
`getContext`/`newContext`/`runContext`. Carries Request, URL, cookies, trace and
span across async boundaries.

### [`api/log`](./api/log.ts)

Environment-aware logger (dev/test/prod) with pretty colors, call-chain,
batching to devtool, filtering, and context trace/span metadata. Exposes
info/warn/error/debug.

### [`api/response`](./api/response.ts)

`respond.*` helpers to build JSON Responses for every status and paired Error
classes (`ResponseError`). Adds default JSON headers and bodyless handling
(204/304, etc.).

### [`api/env`](./api/env.ts)

`ENV()` getter with fallback and required enforcement; typed `APP_ENV` guard
(dev/test/prod) with validation; `CI_COMMIT_SHA`, `DEVTOOL_REPORT_TOKEN`,
`DEVTOOL_ACCESS_TOKEN`, `DEVTOOL_URL` accessors.

### [`api/validator`](./api/validator.ts)

High-performance, schema-based validation with `OBJ`, `ARR`, `STR`, `NUM`,
`BOOL`, `LIST`, `UNION`, optional. Generates assert/report functions and infers
types via `Asserted<T>`.

## [`api-client`](./api-client)

Generates a strongly typed client from server route definitions. Provides fetch
and reactive signal() helpers with abort/dedupe and rich JSON/body error types.

## [`api-proxy`](./api-proxy)

Vite dev proxy for `/api/*` to a localhost backend. Streams requests/responses,
preserves headers/status/cookies, merges Set-Cookie, and aborts on client
disconnect—avoids CORS.

## [`db`](./db)

SQLite helpers: declare tables, auto-generate insert/update/get/exists,
foreign-key joins, tagged SQL and existence checks, singleton connection, and
test restore points.

### [`db/migration`](./db/migration.ts)

Versioned migrations via SQLite `PRAGMA user_version`. Reads a migrations
directory for files named `NNN-*.ts|js`, imports each `run(sql)` in order,
applies them, and updates `user_version`. Skips work on a clean DB, logs
progress, and surfaces errors.

### [`db/entries`](./db/entries.ts)

Event-sourcing style “entries” with a star‑schema.
`initEntries(ids, relations, types)` creates the `entryInternal` table, the
`entry` view (active rows), per‑type views (`entry_<lowercase>`), and basic
indexes. Generates per‑type `insert` functions that capture `RequestContext`
`trace`/`span` and timestamps, supports optional typed `fields` stored in
dedicated tables, soft‑archive via `archivedAt`, plus `insertListeners` for
streaming/SSE triggers.

## [`signal-router`](./signal-router)

URL-as-state SPA routing on `@preact/signals`. Typed `A` component, `navigate`,
`replaceParams`, reactive url helpers; normalizes trailing slashes and skips
external and /api links.

## [`time`](./time)

Time utilities in seconds: startTime, `now()` is a more precise `Date.now()`,
and constants `SEC`, `MIN`, `HOUR`, `DAY`, `WEEK`, `YEAR`.

## [`types`](./types)

Generic utility types: deep `Readonly`, `Expand`, `Awaitable`, `Nullish`,
`IsUnknown`, `UnionToIntersection`, and `MatchKeys`.
