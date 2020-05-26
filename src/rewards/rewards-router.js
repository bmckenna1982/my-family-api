const path = require('path')
const express = require('express')
const xss = require('xss')
const RewardsService = require('./rewards-service')
const { requireAuth } = require('../middleware/jwt-auth')

const rewardsRouter = express.Router()
const jsonParser = express.json()

const sanitizeReward = reward => ({
  ...reward,
  title: xss(reward.title),
  claimed_date: new Date(reward.claimed_date).toDateString()
})

const rewardDatePrep = reward => ({
  ...reward,
  claimed_date: new Date(reward.claimed_date).toDateString()
})

rewardsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    RewardsService.getAllRewards(req.app.get('db'), req.user.family)
      .then(rewards => {
        let preppedRewards = rewards.map(reward => rewardDatePrep(reward))
        res.json(preppedRewards)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const family = req.user.family
    const { title, points } = req.body
    const newReward = { title, points, family }
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
  .all(requireAuth, (req, res, next) => {
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
    const { title, points, claimed, claimed_date } = req.body
    const user_id = req.user.id
    const rewardToUpdate = { title, points, user_id, claimed, claimed_date }
    // console.log('rewardToUpdate', rewardToUpdate)
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