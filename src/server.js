const app = require('./app')
const { PORT, DB_URL } = require('./config')
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: DB_URL
})

// const db = knex({
//   client: 'pg',
//   connection: {
//     host: '127.0.0.1',
//     user: 'bmckenna',
//     password: 'K33psq10',
//     database: 'myfamily',
//     timezone: 'UTC'
//   }
// })

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})