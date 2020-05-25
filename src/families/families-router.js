const path = require('path')
const express = require('express')
const xss = require('xss')
const FamiliesService = require('./families-service')

const familiesRouter = express.Router()
const jsonParser = express.json()

const sanitizeFamily = family => ({
  ...family,
  family_name: xss(family.family_name)
})

familiesRouter
  .route('/')
  .get((req, res, next) => {
    FamiliesService.getAllFamilies(req.app.get('db'))
      .then(families => {
        console.log('families', families)
        res.json(families)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { family_name } = req.body
    const newFamily = { family_name }
    for (const [key, value] of Object.entries(newFamily)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    FamiliesService.hasFamilyWithName(
      req.app.get('db'),
      family_name
    )
      .then(hasFamilyWithName => {
        console.log('non existant')
        if (hasFamilyWithName)
          return res.status(400).json({ error: 'family name already registered' })

        return FamiliesService.insertFamily(req.app.get('db'), newFamily)
          .then(family => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${family.id}`))
              .json(sanitizeFamily(family))
          })
          .catch(next)
      })

  })


familiesRouter
  .route('/:family_id')
  .all((req, res, next) => {
    FamiliesService.getById(req.app.get('db'), req.params.family_id)
      .then(family => {
        if (!family) {
          return res.status(404).json({
            error: { message: `Family doesn't exist` }
          })
        }
        res.family = family //save family for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeFamily(res.family))
  })
// .delete((req, res, next) => {
//   FamiliesService.deleteFamily(req.app.get('db'), req.params.family_id)
//     .then(numRowsAffected => {
//       res.status(204).end()
//     })
//     .catch(next)
// })
// .patch(jsonParser, (req, res, next) => {
//   const { title } = req.body
//   const familyToUpdate = { title }

//   const numberOfValues = Object.values(familyToUpdate).filter(Boolean).length
//   if (numberOfValues === 0) {
//     return res.status(400).json({
//       error: { message: `Request body must contain title` }
//     })
//   }

//   FamiliesService.updateFamily(req.app.get('db'), req.params.family_id, familyToUpdate)
//     .then(numRowsAffected => {
//       res.status(204).end()
//     })
//     .catch(next)
// })

module.exports = familiesRouter