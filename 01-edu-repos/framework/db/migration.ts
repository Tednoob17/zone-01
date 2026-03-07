/**
 * Rely on sqlite PRAGMA user_version to apply migrations
 * @module
 */

import { db, sql } from './mod.ts'

const getVersionFromFile = (filename: string) => {
  const match = filename.match(/^([0-9]+)-/)
  if (!match) {
    throw Error(
      `Invalid migration filename: "${filename}". It must start with a number like "001-".`,
    )
  }
  return Number(match[1])
}

/**
 * Runs database migrations from a specified directory.
 * Migrations are applied in order based on the version number in their filename.
 * It uses the `user_version` pragma in SQLite to keep track of the current database version.
 *
 * @param migrationsPath - The path to the directory containing the migration files.
 *
 * @example
 * ```ts
 * // migrations/001-initial.ts
 * export function run(sql) {
 *   sql`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);`.run();
 * }
 *
 * // main.ts
 * import { runMigrations } from '@01edu/migration';
 *
 * await runMigrations('./migrations');
 * ```
 */
export const runMigrations = async (migrationsPath: string) => {
  console.log('🚀 Starting migration process...')

  const currentVersion = db.sql`PRAGMA user_version`?.[0]?.user_version || 0

  console.log(`🔎 Current database version: ${currentVersion}`)
  const pendingMigrations = Array.from(Deno.readDirSync(migrationsPath))
    .filter((entry) => entry.isFile && /\.(js|ts)$/.test(entry.name))
    .map((entry) => ({
      name: entry.name,
      version: getVersionFromFile(entry.name),
    }))
    .sort((a, b) => a.version - b.version)
    .filter((migration) => migration.version > currentVersion)

  const lastVersion = pendingMigrations.at(-1)?.version || 0
  if (pendingMigrations.length === 0 || lastVersion <= currentVersion) {
    console.log('✅ Your database is already up-to-date.')
    return
  }

  if (!currentVersion) {
    db.exec(`PRAGMA user_version = ${lastVersion}`)
    console.log('✅ Clean database, no need to migrate')
    return
  }

  console.log(`⏳ Applying ${pendingMigrations.length} new migration(s)...`)

  for (const migration of pendingMigrations) {
    try {
      console.log(
        `▶️ Applying version: ${migration.version}: ${migration.name}`,
      )

      const moduleUrl = `file://${migrationsPath}/${migration.name}`
      // Dynamic import is intentional - migration files are provided by consumers at runtime
      // @ts-ignore:  JSR cannot analyze runtime-determined imports
      const { run } = await import(moduleUrl)

      if (typeof run !== 'function') {
        throw Error(`Migration file does not export a 'run' function.`)
      }
      db.exec('BEGIN IMMEDIATE')
      await run(sql)
      db.exec('COMMIT')
      db.exec(`PRAGMA user_version = ${migration.version}`)
      console.log(`✅ Successfully applied version ${migration.version}`)
    } catch (err) {
      console.error(err)
      console.error(`❌ Failed to apply migration ${migration.name}:`, err)
      db.exec('ROLLBACK')
      Deno.exit(1)
    }
  }

  console.log('\n✨ Migration process completed successfully!')
}
