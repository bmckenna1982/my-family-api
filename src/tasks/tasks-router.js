const path = require('path')
const express = require('express')
const xss = require('xss')
const TasksService = require('./tasks-service')

const tasksRouter = express.Router()
const jsonParser = express.json()

const sanitizeTask = task => ({
  ...task,
  title: xss(task.title)
})

tasksRouter
  .route('/')
  .get((req, res, next) => {
    TasksService.getAllTasks(req.app.get('db'))
      .then(tasks => {
        res.json(tasks)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, points } = req.body
    const newTask = { title, points }
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
  .all((req, res, next) => {
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
    res.json({
      id: res.task.id,
      title: xss(res.task.title),
      points: res.task.points,
      complete: res.task.complete,
      completed_date: res.task.completed_date,
      user_id: res.task.user_id
    })
  })
  .delete((req, res, next) => {
    TasksService.deleteTask(req.app.get('db'), req.params.task_id)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    console.log('req.body', req.body)
    const { title, points, complete } = req.body
    const taskToUpdate = { title, points, complete }
    console.log('taskToUpdate', taskToUpdate)
    const numberOfValues = Object.values(taskToUpdate).filter(value => value !== null).length
    console.log('numberOfValues', numberOfValues)
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either title, complete or points` }
      })
    }

    TasksService.updateTask(req.app.get('db'), req.params.task_id, taskToUpdate)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = tasksRouter