import sql from './sqlite/sqlite.js'
import hubspot from './hubspot.js'
import { getNewSteps, getNewUsers } from './sync.js'

const newUsers = await getNewUsers(500, true)
console.log(newUsers.length, 'new user found')

// insert the user in the database

// add to hubspot ?
for (const user of newUsers) {
  // hubspot.crm. ...??
}

const newSteps = await getNewSteps()
console.log(newSteps.length, 'step changes')

// update the user status in hubspot
for (const step of newSteps)  {
  // hubspot.crm. ...??
}
