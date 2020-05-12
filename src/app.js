require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const eventsRouter = require('./events/events-router')
const tasksRouter = require('./tasks/tasks-router')
const listsRouter = require('./lists/lists-router')

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
// app.get('/', (req, res) => {
//   res.send('Hello, world!')
// })

// app.get('/events', (req, res, next) => {
//   // const knexInstance = req.app.get('db')
//   EventsService.getAllEvents(req.app.get('db'))
//     .then(events => {
//       res.json(events)
//     })

//     .catch(next)
// })

// app.get('/events/:event_id', (req, res, next) => {
//   EventsService.getById(req.app.get('db'), req.params.event_id)
//     .then(event => {
//       if (!event) {
//         return res.status(404).json({
//           error: { message: `Event doesn't exist` }
//         })
//       }
//       res.json(event)
//     })
//     .catch(next)
// })

// app.post('/events', jsonParser, (req, res, next) => {
//   const { title, event_date, start_time } = req.body
//   const newEvent = { title, event_date, start_time }
//   EventsService.insertEvent(req.app.get('db'), newEvent)
//     .then(event => {
//       res.status(201).location(`/events/${event.id}`).json(event)
//     })
//     .catch(next)
// })

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