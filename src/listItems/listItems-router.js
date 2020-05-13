const path = require('path')
const express = require('express')
const xss = require('xss')
const ListItemsService = require('./listItems-service')

const listItemsRouter = express.Router()
const jsonParser = express.json()

const sanitizeListItem = listItem => ({
  ...listItem,
  title: xss(listItem.title)
})

listItemsRouter
  .route('/')
  .get((req, res, next) => {
    ListItemsService.getAllListItems(req.app.get('db'))
      .then(listItems => {
        res.json(listItems)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, list_id } = req.body
    const newListItem = { title, list_id }
    for (let [key, value] of Object.entries(newListItem)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    ListItemsService.insertListItem(req.app.get('db'), newListItem)
      .then(listItem => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${listItem.id}`))
          .json(sanitizeListItem(listItem))
      })
      .catch(next)
  })


listItemsRouter
  .route('/:listItem_id')
  .all((req, res, next) => {
    ListItemsService.getById(req.app.get('db'), req.params.listItem_id)
      .then(listItem => {
        if (!listItem) {
          return res.status(404).json({
            error: { message: `ListItem doesn't exist` }
          })
        }
        res.listItem = listItem //save listItem for use in next middleware
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeListItem(res.listItem))
  })
  .delete((req, res, next) => {
    ListItemsService.deleteListItem(req.app.get('db'), req.params.listItem_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, list_id } = req.body
    const listItemToUpdate = { title, list_id }

    const numberOfValues = Object.values(listItemToUpdate).filter(Boolean).length
    console.log('numberOfValues', numberOfValues)
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either title or list_id` }
      })
    }

    ListItemsService.updateListItem(req.app.get('db'), req.params.listItem_id, listItemToUpdate)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = listItemsRouter