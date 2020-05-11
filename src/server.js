const app = require('./app')
const { PORT, DB_URL } = require('./config')
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: {
    database: DB_URL,
    timezone: 'UTC'
  }
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})