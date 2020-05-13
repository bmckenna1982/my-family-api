const knex = require('knex')
const app = require('../src/app')
const { makeListItemsArray, makeMaliciousListItem } = require('./listItems.fixtures')
const { makeListsArray } = require('./lists.fixtures')
const helpers = require('./test-helpers')

describe('ListItems endpoints', () => {
  let db

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  // before(() => db('lists').truncate())
  before('cleanup', () => helpers.cleanTables(db))
  // afterEach(() => db('lists').truncate())
  afterEach('cleanup', () => helpers.cleanTables(db))

  after(() => db.destroy())

  describe(`GET /api/listItems`, () => {
    context(`Given no listItems in the database`, () => {
      it(`responds with an empty array`, () => {
        return supertest(app)
          .get('/api/listItems')
          .expect(200, [])
      })
    })

    context(`Given there are listItems in the database`, () => {
      const testListItems = makeListItemsArray()
      const testListArray = makeListsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testListArray[0])
      })

      beforeEach(() => {
        return db
          .into('listitems')
          .insert(testListItems)
      })

      it(`responds with 200 and all the listItems`, () => {
        return supertest(app)
          .get('/api/listItems')
          .expect(200, testListItems)
      })
    })
  })

  describe(`GET /api/listItems/:listItem_id`, () => {
    context(`Given no listItems in the database`, () => {
      it(`responds with 404`, () => {
        const listItem_id = 123456
        return supertest(app)
          .get(`/api/listItems/${listItem_id}`)
          .expect(404, { error: { message: `ListItem doesn't exist` } })
      })
    })

    context(`Given there are listItems in the database`, () => {
      const testListItems = makeListItemsArray()
      const testListArray = makeListsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testListArray[0])
      })

      beforeEach(() => {
        return db
          .into('listitems')
          .insert(testListItems)
      })

      it(`responds with 200 and the specific listItem`, () => {
        const testListItem = testListItems[0]
        return supertest(app)
          .get(`/api/listItems/${testListItem.id}`)
          .expect(200, testListItem)
      })
    })

    context(`Given an XSS attack listItem`, () => {
      // const testUsers = makeUsersArray()
      const { maliciousListItem, expectedListItem } = makeMaliciousListItem()
      const testListArray = makeListsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testListArray[0])
      })
      beforeEach('insert malicious listItem', () => {
        return db
          .into('listitems')
          .insert(maliciousListItem)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/listItems/${maliciousListItem.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedListItem.title)
          })
      })
    })
  })

  describe(`POST /api/listItems`, function () {
    const testListArray = makeListsArray()

    beforeEach(() => {
      return db
        .into('lists')
        .insert(testListArray[0])
    })

    it('creates an listItem, responding with 201 and the new listItem', () => {
      this.retries(3)

      const newListItem = {
        title: 'test new title',
        list_id: 1
      }
      return supertest(app)
        .post('/api/listItems')
        .send(newListItem)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newListItem.title)
          expect(res.body.list_id).to.eql(newListItem.list_id)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('checked')
          expect(res.headers.location).to.eql(`/api/listItems/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/listItems/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })

    const requiredFields = ['title', 'list_id']

    requiredFields.forEach(field => {
      const newListItem = {
        title: 'test new title',
        list_id: 1
      }


      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newListItem[field]

        return supertest(app)
          .post('/api/listItems')
          .send(newListItem)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /api/listItems/:listItem_id`, () => {
    context('Given there are listItems in database', () => {
      const testListItems = makeListItemsArray()

      beforeEach(() => {
        return db
          .into('listitems')
          .insert(testListItems)
      })

      it(`responds with 204 and removes the listItem from the database`, () => {
        const listItemToRemove = testListItems[0]
        const expectedListItems = testListItems.filter(listItem => listItem.id !== listItemToRemove.id)
        return supertest(app)
          .delete(`/api/listItems/${listItemToRemove.id}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/listItems`)
              .expect(expectedListItems)
          })
      })
    })

    context('Given there are no listItems in the database', () => {
      it(`responds with 404 listItem not found`, () => {
        return supertest(app)
          .delete(`/api/listItems/12345`)
          .expect(404, { error: { message: `ListItem doesn't exist` } })
      })
    })

  })

  describe(`PATCH /api/listItems/:listItem_id`, () => {
    context('Given the listItem is in the database', () => {
      const testListItems = makeListItemsArray()

      beforeEach(() => {
        return db
          .into('listitems')
          .insert(testListItems)
      })

      it(`responds with a 204 and updates the listItem`, () => {
        const listItemToUpdate = testListItems[0]
        const updatedListItem = {
          title: 'updated title',
          list_id: 1
        }
        const expectedListItem = {
          ...listItemToUpdate,
          ...updatedListItem
        }
        return supertest(app)
          .patch(`/api/listItems/${listItemToUpdate.id}`)
          .send(updatedListItem)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/listItems/${listItemToUpdate.id}`)
              .expect(expectedListItem)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const listItemToUpdate = testListItems[0]
        return supertest(app)
          .patch(`/api/listItems/${listItemToUpdate.id}`)
          .send({ unMatchedField: 'test' })
          .expect(400, {
            error: { message: `Request body must contain either title or list_id` }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const listItemToUpdate = testListItems[0]
        const updatedListItem = {
          title: 'updated listItem title',
          list_id: 1
        }
        const expectedListItem = {
          ...listItemToUpdate,
          ...updatedListItem
        }

        return supertest(app)
          .patch(`/api/listItems/${listItemToUpdate.id}`)
          .send({
            ...updatedListItem,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/listItems/${listItemToUpdate.id}`)
              .expect(expectedListItem)
          )
      })
    })


    context('Given there listItem is not in the database', () => {
      it(`responds with a 404`, () => {
        return supertest(app)
          .patch(`/api/listItems/12345`)
          .expect(404, { error: { message: `ListItem doesn't exist` } })
      })
    })
  })
})