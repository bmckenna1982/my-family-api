const knex = require('knex')({
  client: 'pg',
  connection:
    'postgres://mrixwjaeiiehqk:71f2a439f7e8dd38a5bfa63fd7a13e3f1ef0782e0aac2b9dd6627d02ec38281a@ec2-34-206-252-187.compute-1.amazonaws.com:5432/d906h1marlgr9b'
    + '?ssl=true',
  debug: false
});

// let games = [];

const schedule = require('./src/schedule-data')

const clearSchedule = () => {
  return knex.transaction(trx =>
    trx.raw(
      `TRUNCATE 
        rsvp,
        schedule
      `
    )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE rsvp_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE schedule_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('rsvp_id_seq', 0)`),
          trx.raw(`SELECT setval('schedule_id_seq', 0)`)
        ])
      )
  )
}

// console.log('schedule', schedule)
const inserts = function () {
  const insertPromises = [];
  schedule.forEach(function (game) {
    insertPromises.push(knex('schedule')
      .insert({ summary: game.summary, location: game.location, time: new Date(game.time) })
    );
  });
  return Promise.all(insertPromises);
};

clearSchedule()
  .then(() => {
    // console.log('Table cleared')
  })
  .then(inserts)
  .then(() => {
    // console.log('inserts done')
  })
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    db.destroy()
    // console.log('error', error)
  })
