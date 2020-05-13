function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE        
        events,                
        lists,
        listItems,
        users,
        tasks,
        rewards
      `
    )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE events_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE lists_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE listItems_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE tasks_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE rewards_id_seq minvalue 0 START WITH 1`),
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

module.exports = {
  cleanTables
}