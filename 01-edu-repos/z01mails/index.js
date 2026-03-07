import z01 from './z01/z01.js'
import sql from './sqlite/sqlite.js'
import email from './email/email.js'

/*
 * Load new user and save them locally to sqlite
 */

const lastCreatedAt = sql.selectLastCreatedAt.get()?.createdAt || 0
const { newUsers } = await z01.newUsers({ latest: new Date(lastCreatedAt) })

let newUserCount = 0
for (const { createdAt, login, attrs } of newUsers) {
  try {
    sql.insertUser.run(new Date(createdAt).getTime(), login, attrs.email)
    newUserCount++
  } catch (err) {
    // it is possible that some user are already registered
    // due to limited precision in JS dates vs postgres
    console.log(err.message, { login })
  }
}

console.log(newUserCount, 'new user loaded')

/*
 * Send automated emails
 */

// Send email to user with unfinished toad session
const { games } = await z01.unfishinedToad()
await email.reminder({
  subject: "Un challenge t'attend !",
  recievers: games.map(({ candidate }) => candidate.attrs.email),
})

for (const { candidate } of games) {
  sql.setUserStep.run(candidate.login, 'reminder')
}

// Send email to user that have a second chance
const { users } = await z01.secondChance({ path: '/rouen/onboarding/games' })
await email.secondChance({
  subject:
    "Le numérique va changer ta vie : une 2ème opportunité s'offre à toi!",
  recievers: users.map(user => user.attrs.email),
})

for (const { candidate } of games) {
  sql.setUserStep.run(candidate.login, 'secondchance')
}
