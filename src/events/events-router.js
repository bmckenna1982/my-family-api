const path = require('path')
const express = require('express')
const xss = require('xss')
const EventsService = require('./events-service')
const { requireAuth } = require('../middleware/jwt-auth')

const eventsRouter = express.Router()
const jsonParser = express.json()

const sanitizeEvent = event => ({
  ...event,
  title: xss(event.title),
  event_date: new Date(event.event_date).toDateString()
})

const eventDatePrep = event => ({
  ...event,
  event_date: new Date(event.event_date).toDateString()
})

eventsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    EventsService.getAllEvents(req.app.get('db'), req.user.family)
      .then(events => {
        let preppedEvents = events.map(event => eventDatePrep(event))
        res.json(preppedEvents)
      })
      .catch(next)
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const family = req.user.id
    const { title, event_date, start_time } = req.body
    const newEvent = { title, event_date, start_time, family }
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
  .all(requireAuth)
  .get((req, res, next) => {
    EventsService.getUpcomingEvents(req.app.get('db'))
      .then(events => {
        let preppedEvents = events.map(event => eventDatePrep(event))
        console.log('events', preppedEvents)
        res.json(preppedEvents)
      })
      .catch(next)
  })

eventsRouter
  .route('/:event_id')
  .all(requireAuth, (req, res, next) => {
    EventsService.getById(req.app.get('db'), req.params.event_id)
      .then(event => {
        if (!event) {
          return res.status(404).json({
            error: { message: `Event doesn't exist` }
          })
        }
        let preppedEvent = eventDatePrep(event)
        res.event = preppedEvent //save event for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeEvent(res.event))
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