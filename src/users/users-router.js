const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')

const usersRouter = express.Router()
const jsonParser = express.json()

const sanitizeUser = user => ({
  ...user,
  first_name: xss(user.first_name),
  last_name: xss(user.last_name),
  email: xss(user.email),
  family: xss(user.family),
})

usersRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    UsersService.getAllUsers(req.app.get('db'), req.user.family)
      .then(users => {
        res.json(users)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { first_name, last_name, email, password, family } = req.body
    const newUser = { first_name, last_name, email, password, family }

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    const passwordError = UsersService.validatePassword(password)
    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithEmail => {
        if (hasUserWithEmail)
          return res.status(400).json({ error: 'email already registered' })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              email,
              password: hashedPassword,
              first_name,
              last_name,
              family,
            }

            return UsersService.insertUser(req.app.get('db'), newUser)
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(sanitizeUser(user))
              })
              .catch(next)
          })
      })
  })

usersRouter
  .route('/:user_id/tasks')
  .get(requireAuth, (req, res, next) => {
    UsersService.getTasks(req.app.get('db'), req.params.user_id)
      .then(tasks =>
        res.json(tasks)
      )
      .catch(next)
  })

usersRouter
  .route('/:user_id')
  .all(requireAuth, (req, res, next) => {
    UsersService.getById(req.app.get('db'), req.params.user_id)
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user //save user for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeUser(res.user))
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(req.app.get('db'), req.params.user_id)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { first_name, last_name, email, password, family } = req.body
    const userToUpdate = { first_name, last_name, email, password, family }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either first_name, last_name, email, password or family` }
      })
    }

    UsersService.updateUser(req.app.get('db'), req.params.user_id, userToUpdate)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = usersRouter
