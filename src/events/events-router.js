const express = require('express')
const EventsService = require('./events-service')

const eventsRouter = express.Router()
const jsonParser = express.json()

eventsRouter
  .route('/')
  .get((req, res, next) => {
    EventsService.getAllEvents(req.app.get('db'))
      .then(events => {
        res.json(events)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, event_date, start_time } = req.body
    const newEvent = { title, event_date, start_time }
    for (const [key, value] of Object.entries(newEvent)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    
    EventsService.insertEvent(req.app.get('db'), newEvent)
      .then(event => {
        res.status(201).location(`/events/${event.id}`).json(event)
      })
      .catch(next)
  })
  

eventsRouter
  .route('/:event_id')
  .get((req, res, next) => {
    EventsService.getById(req.app.get('db'), req.params.event_id)
      .then(event => {
        if (!event) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` }
          })
        }
        res.json(event)
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    EventsService.deleteEvent(req.app.get('db'), req.params.event_id)
      .then(() => {
        res.status(204).end
      })
      .catch(next)
  })

module.exports = eventsRouter