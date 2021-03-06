const path = require('path')
const express = require('express')
const xss = require('xss')
const TasksService = require('./tasks-service')
const { requireAuth } = require('../middleware/jwt-auth')

const tasksRouter = express.Router()
const jsonParser = express.json()

const sanitizeTask = task => ({
  ...task,
  title: xss(task.title)
})

tasksRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    TasksService.getAllTasksByFamily(req.app.get('db'), req.user.family)
      .then(tasks => {
        res.json(tasks)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, points } = req.body
    const family = req.user.family
    const newTask = { title, points, family }
    for (const [key, value] of Object.entries(newTask)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    TasksService.insertTask(req.app.get('db'), newTask)
      .then(task => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${task.id}`))
          .json(sanitizeTask(task))
      })
      .catch(next)
  })

tasksRouter
  .route('/:task_id')
  .all(requireAuth, (req, res, next) => {
    TasksService.getById(req.app.get('db'), req.params.task_id)
      .then(task => {
        if (!task) {
          return res.status(404).json({
            error: { message: `Task doesn't exist` }
          })
        }
        res.task = task //save task for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeTask(res.task))
  })
  .delete((req, res, next) => {
    TasksService.deleteTask(req.app.get('db'), req.params.task_id)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, points, complete, completed_date } = req.body
    const user_id = (!req.body.user_id)
      ? req.user.id
      : req.body.user_id

    const taskToUpdate = { title, points, complete, completed_date }
    taskToUpdate.user_id = user_id
    const numberOfValues = Object.values(taskToUpdate).filter(value => value != null).length

    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either title or points` }
      })
    }

    TasksService.updateTask(req.app.get('db'), req.params.task_id, taskToUpdate)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = tasksRouter