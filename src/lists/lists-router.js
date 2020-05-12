const path = require('path')
const express = require('express')
const xss = require('xss')
const ListsService = require('./lists-service')

const listsRouter = express.Router()
const jsonParser = express.json()

const sanitizeList = list => ({
  ...list,
  title: xss(list.title)
})

listsRouter
  .route('/')
  .get((req, res, next) => {
    ListsService.getAllLists(req.app.get('db'))
      .then(lists => {
        res.json(lists)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title } = req.body
    const newList = { title }
    for (const [key, value] of Object.entries(newList)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    ListsService.insertList(req.app.get('db'), newList)
      .then(list => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${list.id}`))
          .json(sanitizeList(list))
      })
      .catch(next)
  })

listsRouter
  .route('/:list_id')
  .all((req, res, next) => {
    ListsService.getById(req.app.get('db'), req.params.list_id)
      .then(list => {
        if (!list) {
          return res.status(404).json({
            error: { message: `List doesn't exist` }
          })
        }
        res.list = list //save list for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json({
      id: res.list.id,
      title: xss(res.list.title)
    })
  })
  .delete((req, res, next) => {
    ListsService.deleteList(req.app.get('db'), req.params.list_id)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title } = req.body
    const listToUpdate = { title }

    const numberOfValues = Object.values(listToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain title` }
      })
    }

    ListsService.updateList(req.app.get('db'), req.params.list_id, listToUpdate)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = listsRouter