# api-client

Tiny, type-safe HTTP API client meant to be used alongside the `@01edu/api`
router (see [`@01edu/api/router`](https://jsr.io/@01edu/api/doc/router)). It
builds a strongly-typed client from your server route definitions.

## Install

- `deno add jsr:@01edu/api-client`

## How it fits

- Define routes on the server with @01edu/api/router and export their type.
- Use that type on the client with `createClient` for end-to-end typing.

## Server (types export)

```ts
import { route } from '@01edu/api/router'
import { STR } from '@01edu/api/validator'

export const routes = {
  'GET/hello': route({
    input: { name: STR() },
    output: { message: STR() },
    fn: (_, { name }) => ({ message: `Hello, ${name}!` }),
  }),
}

export type RoutesDefinitions = typeof routes
```

## Client

```ts
import { createClient } from '@01edu/api-client'
import type { RoutesDefinitions } from '/api/routes.ts' // types-only import from your backend

const api = createClient<RoutesDefinitions>('/api')

// One-shot call
const res = await api['GET/hello'].fetch({ name: 'Ada' })

// Reactive usage
const hello = api['GET/hello'].signal()
hello.fetch({ name: 'Ada' })
hello.$.subscribe((v) => console.log(v.pending, v.data, v.error))
```
