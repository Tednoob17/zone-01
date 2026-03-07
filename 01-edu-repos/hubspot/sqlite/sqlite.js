import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'

import sqlite3 from 'better-sqlite3'

// migration dir
const rootDir = dirname(new URL(import.meta.url).pathname)
const migDir = join(rootDir, 'migrations')

// init db and log verbose for debug
console.log('loading sqlite database')
const db = sqlite3('data.db', {
  // verbose: console.log
})

// set performances parameters
db.pragma('synchronous=NORMAL')
db.pragma('journal_mode=WAL')

// current db version
const { user_version } = db.prepare('pragma user_version').get()

// load sql files
for (const migrationName of await readdir(migDir)) {
  if (!migrationName.endsWith('.sql')) continue
  const migrationVersion = Number(migrationName.split('_')[0])
  if (migrationVersion > user_version) {
    console.log('applying migration', migrationName)
    db.exec(await readFile(join(migDir, migrationName), { encoding: 'utf8' }))
    db.pragma(`user_version=${migrationVersion}`)
  }
}

console.log('all migrations applied !')

// prepare queries
const queriesList = await readdir(join(rootDir, 'queries'))
const queriesEntries = queriesList.map(async name => {
  const sql = await readFile(join(rootDir, 'queries', name), 'utf8')
  return [name.slice(0, -'.sql'.length), db.prepare(sql)]
})

export default Object.fromEntries(await Promise.all(queriesEntries))
