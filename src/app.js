require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const eventsRouter = require('./events/events-router')
const tasksRouter = require('./tasks/tasks-router')
const listsRouter = require('./lists/lists-router')
const listItemsRouter = require('./listItems/listItems-router')
const usersRouter = require('./users/users-router')
const rewardsRouter = require('./rewards/rewards-router')
const authRouter = require('./auth/auth-router')
const familiesRouter = require('./families/families-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/events', eventsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/lists', listsRouter)
app.use('/api/listItems', listItemsRouter)
app.use('/api/users', usersRouter)
app.use('/api/rewards', rewardsRouter)
app.use('/api/auth', authRouter)
app.use('/api/families', familiesRouter)

app.use(function errorHandler(error, req, res, next) {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app