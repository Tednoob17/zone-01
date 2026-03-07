## Example

```ts
import type { RequestContext } from '@01edu/framework/context'
import { logger } from '@01edu/framework/log'
import { server } from '@01edu/framework/server'
import { NUM, STR } from '@01edu/framework/validator'
import { makeRouter, route } from '@01edu/framework/router'

// The session is anything you want, it's optional, defaults to undefined
type Session = {
  userId: number
}

const log = await logger({
  filters: new Set(['in', 'out']),
})

const activeSession = new Map<string, Session>()
const requireSession = (ctx: RequestContext): Session => {
  const session = activeSession.get(ctx.cookies.session)
  if (session) return session
  throw Error('user must have a session')
  // Throwing in the authorize session will return an Unauthorized response to the client
}

const routeHandler = makeRouter(log, {
  'GET/user': route({
    description: 'Return the id of the user of the current session',
    output: NUM('id of the current user'),
    input: STR('some text to print'),
    // Authorize method must return the session
    authorize: requireSession,
    fn: (ctx, name) => {
      console.log('name input:', { name }) // name is a string here
      return ctx.session.userId
    },
  }),
})

export default {
  fetch: server({ log, routeHandler }),
}
```
