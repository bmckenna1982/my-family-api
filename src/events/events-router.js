const path = require('path')
const express = require('express')
const xss = require('xss')
const EventsService = require('./events-service')

const eventsRouter = express.Router()
const jsonParser = express.json()

const sanitizeEvent = event => ({
  ...event,
  title: xss(event.title)
})

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
    console.log('req.body', req.body)
    const { title, event_date, start_time } = req.body
    const newEvent = { title, event_date, start_time }
    for (let [key, value] of Object.entries(newEvent)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    EventsService.insertEvent(req.app.get('db'), newEvent)
      .then(event => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${event.id}`))
          .json(sanitizeEvent(event))
      })
      .catch(next)
  })

eventsRouter
  .route('/upcoming')
  .get((req, res, next) => {
    EventsService.getUpcomingEvents(req.app.get('db'))
      .then(events => {
        res.json(events)
      })
      .catch(next)
  })

eventsRouter
  .route('/:event_id')
  .all((req, res, next) => {
    EventsService.getById(req.app.get('db'), req.params.event_id)
      .then(event => {
        if (!event) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` }
          })
        }
        res.event = event //save event for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json({
      id: res.event.id,
      title: xss(res.event.title),
      event_date: res.event.event_date,
      start_time: res.event.start_time,
      user_id: res.event.user_id
    })
  })
  .delete((req, res, next) => {
    EventsService.deleteEvent(req.app.get('db'), req.params.event_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, event_date, start_time } = req.body
    const eventToUpdate = { title, event_date, start_time }

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length
    console.log('numberOfValues', numberOfValues)
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either title or points` }
      })
    }

    EventsService.updateEvent(req.app.get('db'), req.params.event_id, eventToUpdate)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })



module.exports = eventsRouter