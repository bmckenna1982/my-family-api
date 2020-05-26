const express = require('express');
const authRouter = express.Router();
const jsonParser = express.json();
const AuthService = require('./auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

authRouter
  .post('/login', jsonParser, (req, res, next) => {
    const { email, password } = req.body
    const loginUser = { email, password }

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    AuthService.getUserWithEmail(req.app.get('db'), loginUser.email)
      .then(dbUser => {
        if (!dbUser)
          return res.status(400).json({
            error: 'Incorrect email or password'
          })
        return AuthService.comparePasswords(
          loginUser.password,
          dbUser.password
        ).then(compareMatch => {
          if (!compareMatch)
            return res.status(400).json({
              error: 'Incorrect email or password'
            })
          const sub = dbUser.email
          const payload = { user_id: dbUser.id }
          // console.log('sub2', sub)
          // console.log('payload2', payload)
          res.send({
            authToken: AuthService.createJwt(sub, payload),
            sessionId: dbUser.id
          })
        })
      })
      .catch(next)
  })

authRouter.post('/refresh', requireAuth, (req, res) => {
  const sub = req.user.email
  const payload = { user_id: req.user.id }
  // console.log('sub', sub)
  // console.log('payload', payload)
  res.send({
    authToken: AuthService.createJwt(sub, payload),
    sessionId: req.user.id
  })
})

module.exports = authRouter