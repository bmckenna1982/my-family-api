const express = require('express')
const xss = require('xss')
const PointsService = require('./points-service')
const { requireAuth } = require('../middleware/jwt-auth')

const pointsRouter = express.Router()

pointsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    PointsService.getTasksPointsByUser(req.app.get('db'), req.user.id)
      .then(data => {
        PointsService.getRewardsPointsByUser(req.app.get('db'), req.user.id)
          .then(rewardPoints => {
            data.points = data.points - rewardPoints.points
            res.json(data)
          })
      })
      .catch(next)
  })

module.exports = pointsRouter
