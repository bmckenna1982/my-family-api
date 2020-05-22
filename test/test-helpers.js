
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedFamilies(db, families) {
  // const families = makeFamiliesArray()
  // let family = {
  //   id: 1,
  //   family_name: 'test'
  // }
  return db.into('family').insert(families)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('family_id_seq', ?)`,
        [families[families.length - 1].id],
      )
    )
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE        
        events,                
        lists,
        listItems,
        users,
        family,
        tasks,
        rewards
      `
    )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE family_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE events_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE lists_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE listItems_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE tasks_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE rewards_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('family_id_seq', 0)`),
          trx.raw(`SELECT setval('events_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
          trx.raw(`SELECT setval('lists_id_seq', 0)`),
          trx.raw(`SELECT setval('listItems_id_seq', 0)`),
          trx.raw(`SELECT setval('tasks_id_seq', 0)`),
          trx.raw(`SELECT setval('rewards_id_seq', 0)`)
        ])
      )
      .catch()

  )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function makeFamiliesArray() {
  return [
    {
      id: 1,
      family_name: 'Test 1 Family',
    },
    {
      id: 2,
      family_name: 'Test 2 Family',
    },
  ]
}

module.exports = {
  cleanTables,
  seedUsers,
  makeAuthHeader,
  seedFamilies,
  makeFamiliesArray
}