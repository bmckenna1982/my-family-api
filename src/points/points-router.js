const express = require('express')
const PointsService = require('./points-service')
const { requireAuth } = require('../middleware/jwt-auth')

const pointsRouter = express.Router()

pointsRouter
  .route('/')
  .all(requireAuth, (req, res, next) => {
    PointsService.getTasksPointsByUser(req.app.get('db'), req.user.id)
      .then(data => {
        res.task_points = data ? data.points : 0
        next()
      })
  })
  .get((req, res, next) => {
    PointsService.getRewardsPointsByUser(req.app.get('db'), req.user.id)
      .then(rewardPoints => {
        const points = rewardPoints
          ? res.task_points - rewardPoints.points
          : res.task_points
        res.json(points)
      })
      .catch(next)
  })


module.exports = pointsRouter
