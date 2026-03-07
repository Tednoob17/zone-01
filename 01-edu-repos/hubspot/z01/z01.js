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


const API = async (path, opts) => {
  const res = await fetch(`https://${z01Credentials.domain}/api/${path}`)
  if (res.status === 204) return
  return res.json()
}

export const getCampuses = async () => {
  const { campuses } = await API('object')
  return Promise.all(campuses.map(c => API(`object/${c.name}`)))
}

export default {
  API,
  getCampuses,
  ...Object.fromEntries(await Promise.all(queriesEntries))
}

