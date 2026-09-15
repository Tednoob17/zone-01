# hubspot

Template repository to use the API, used in this example to send emails and synchronize the list of users.


## Stack

> This code use NodeJS, queries are in `SQL` and `GraphQL`

- `@01-edu/api` to use our graphQL API
- `@hubspot/api-client` to connect to hubspot
- `better-sqlite3` to use a local database

## Env variables

> all the environement variable are centralized in [config.js](./config.js)

- `DOMAIN` domain of the school to query
- `Z01_TOKEN` more info in how to get your read-only access token on [@01-edu/api documentation](https://www.npmjs.com/package/@01-edu/api)
- `HUBSPOT_TOKEN` an api token from hubspot

## Structure

> We used a declarative approach, queries should be written either in `.sql` and `.graphql` files.
> The matching functions will be generated so you can use them.

### `GraphQL` queries

Used directory is [`z01/queries`](./z01/queries) name of the file will be used to name the exposed function.

### `SQL` queries

Used directory is [`sqlite/queries`](./sqlite/queries) exactly like graphql queries, name of the file will be used to name the exposed function.


