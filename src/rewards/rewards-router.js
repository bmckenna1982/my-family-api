const path = require('path')
const express = require('express')
const xss = require('xss')
const RewardsService = require('./rewards-service')

const rewardsRouter = express.Router()
const jsonParser = express.json()

const sanitizeReward = reward => ({
  ...reward,
  title: xss(reward.title)
})

rewardsRouter
  .route('/')
  .get((req, res, next) => {
    RewardsService.getAllRewards(req.app.get('db'))
      .then(rewards => {
        res.json(rewards)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, points } = req.body
    const newReward = { title, points }
    for (const [key, value] of Object.entries(newReward)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    RewardsService.insertReward(req.app.get('db'), newReward)
      .then(reward => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${reward.id}`))
          .json(sanitizeReward(reward))
      })
      .catch(next)
  })

rewardsRouter
  .route('/:reward_id')
  .all((req, res, next) => {
    RewardsService.getById(req.app.get('db'), req.params.reward_id)
      .then(reward => {
        if (!reward) {
          return res.status(404).json({
            error: { message: `Reward doesn't exist` }
          })
        }
        res.reward = reward //save reward for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeReward(res.reward))
  })
  .delete((req, res, next) => {
    RewardsService.deleteReward(req.app.get('db'), req.params.reward_id)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, points } = req.body
    const rewardToUpdate = { title, points }

    const numberOfValues = Object.values(rewardToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either title or points` }
      })
    }

    RewardsService.updateReward(req.app.get('db'), req.params.reward_id, rewardToUpdate)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = rewardsRouter