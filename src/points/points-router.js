const path = require('path')
const express = require('express')
const xss = require('xss')
const PointsService = require('./points-service')
const { requireAuth } = require('../middleware/jwt-auth')

const pointsRouter = express.Router()
const jsonParser = express.json()

const sanitizePoint = point => ({
  ...point,
  first_name: xss(point.first_name),
  last_name: xss(point.last_name),
  email: xss(point.email),
  family: xss(point.family),
})

pointsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    console.log('req.user.id', req.user.id)
    PointsService.getTasksPointsByUser(req.app.get('db'), req.user.id)
      .then(data => {
        PointsService.getRewardsPointsByUser(req.app.get('db'), req.user.id)
          .then(rewardPoints => {
            console.log('rewardPoints', rewardPoints)
            data.points = data.points - rewardPoints.points
            console.log('data', data)
            res.json(data)
          })
      })
      .catch(next)
  })

module.exports = pointsRouter
