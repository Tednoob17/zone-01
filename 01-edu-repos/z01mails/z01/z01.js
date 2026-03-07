import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { createClient } from '@01-edu/api'
import { z01Credentials } from '../config.js'

const { run } = await createClient(z01Credentials)

const rootDir = dirname(new URL(import.meta.url).pathname)

const queriesList = await readdir(join(rootDir, 'queries'))
const queriesEntries = queriesList.map(async name => {
  const query = await readFile(join(rootDir, 'queries', name), 'utf8')
  return [name.slice(0, -'.graphql'.length), variables => run(query, variables)]
})

export default Object.fromEntries(await Promise.all(queriesEntries))
