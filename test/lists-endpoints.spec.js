const knex = require('knex')
const app = require('../src/app')
const { makeListsArray, makeMaliciousList } = require('./lists.fixtures')
const { makeListItemsArray, makeMaliciousListItem } = require('./listItems.fixtures')
const helpers = require('./test-helpers')

describe('Lists endpoints', () => {
  let db

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  // before(() => db('lists').truncate())
  before('cleanup', () => helpers.cleanTables(db))
  // afterEach(() => db('lists').truncate())
  afterEach('cleanup', () => helpers.cleanTables(db))

  after(() => db.destroy())

  describe(`GET /api/lists`, () => {
    context(`Given no lists in the database`, () => {
      it(`responds with an empty array`, () => {
        return supertest(app)
          .get('/api/lists')
          .expect(200, [])
      })
    })

    context(`Given there are lists in the database`, () => {
      const testLists = makeListsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testLists)
      })

      it(`responds with 200 and all the lists`, () => {
        return supertest(app)
          .get('/api/lists')
          .expect(200, testLists)
      })
    })
  })

  describe(`GET /api/lists/:list_id`, () => {
    context(`Given no lists in the database`, () => {
      it(`responds with 404`, () => {
        const list_id = 123456
        return supertest(app)
          .get(`/api/lists/${list_id}`)
          .expect(404, { error: { message: `List doesn't exist` } })
      })
    })

    context(`Given there are lists in the database`, () => {
      const testLists = makeListsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testLists)
      })

      it(`responds with 200 and the specific list`, () => {
        const testList = testLists[0]
        return supertest(app)
          .get(`/api/lists/${testList.id}`)
          .expect(200, testList)
      })
    })

    context(`Given an XSS attack list`, () => {
      // const testUsers = makeUsersArray()
      const { maliciousList, expectedList } = makeMaliciousList()

      beforeEach('insert malicious list', () => {
        return db
          .into('lists')
          .insert(maliciousList)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/lists/${maliciousList.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedList.title)
          })
      })
    })
  })

  describe(`GET /api/lists/:list_id/listItems`, () => {
    context(`Given no lists in the database`, () => {
      it(`responds with 404`, () => {
        const list_id = 123456
        return supertest(app)
          .get(`/api/lists/${list_id}/listItems`)
          .expect(404, { error: { message: `List doesn't exist` } })
      })
    })

    context(`Given there are lists in the database`, () => {
      const testLists = makeListsArray()
      const testListItems = makeListItemsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testLists)
      })

      beforeEach(() => {
        return db
          .into('listitems')
          .insert(testListItems)
      })

      it(`responds with 200 and the list items`, () => {
        const testList = testLists[0]
        return supertest(app)
          .get(`/api/lists/${testList.id}/listItems`)
          .expect(200, testListItems)
      })
    })

    // context(`Given an XSS attack list`, () => {
    //   // const testUsers = makeUsersArray()
    //   const { maliciousListItem, expectedListItem } = makeMaliciousListItem()
    //   const testLists = makeListsArray()
    //   const testList = testLists[0]
    //   const testListItems = makeListItemsArray()

    //   beforeEach(() => {
    //     return db
    //       .into('lists')
    //       .insert(testLists)
    //   })

    //   beforeEach('insert malicious list item', () => {
    //     return db
    //       .into('listitems')
    //       .insert(maliciousListItem)
    //   })

    //   it.only('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get(`/api/lists/${testList.id}/listItems`)
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body.title).to.eql(expectedListItem.title)
    //       })
    //   })
    // })
  })

  describe(`POST /api/lists`, function () {
    it('creates an list, responding with 201 and the new list', () => {
      this.retries(3)
      const newList = {
        title: 'test new title',
      }
      return supertest(app)
        .post('/api/lists')
        .send(newList)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newList.title)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/lists/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/lists/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })

    const requiredFields = ['title']

    requiredFields.forEach(field => {
      const newList = {
        title: 'test new title',
      }


      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newList[field]

        return supertest(app)
          .post('/api/lists')
          .send(newList)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /api/lists/:list_id`, () => {
    context('Given there are lists in database', () => {
      const testLists = makeListsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testLists)
      })

      it(`responds with 204 and removes the list from the database`, () => {
        const listToRemove = testLists[0]
        const expectedLists = testLists.filter(list => list.id !== listToRemove.id)
        return supertest(app)
          .delete(`/api/lists/${listToRemove.id}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/lists`)
              .expect(expectedLists)
          })
      })
    })

    context('Given there are no lists in the database', () => {
      it(`responds with 404 list not found`, () => {
        return supertest(app)
          .delete(`/api/lists/12345`)
          .expect(404, { error: { message: `List doesn't exist` } })
      })
    })

  })

  describe(`PATCH /api/lists/:list_id`, () => {
    context('Given the list is in the database', () => {
      const testLists = makeListsArray()

      beforeEach(() => {
        return db
          .into('lists')
          .insert(testLists)
      })

      it(`responds with a 204 and updates the list`, () => {
        const listToUpdate = testLists[0]
        const updatedList = {
          title: 'updated title',
        }
        const expectedList = {
          ...listToUpdate,
          ...updatedList
        }
        return supertest(app)
          .patch(`/api/lists/${listToUpdate.id}`)
          .send(updatedList)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/lists/${listToUpdate.id}`)
              .expect(expectedList)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const listToUpdate = testLists[0]
        return supertest(app)
          .patch(`/api/lists/${listToUpdate.id}`)
          .send({ unMatchedField: 'test' })
          .expect(400, {
            error: { message: `Request body must contain title` }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const listToUpdate = testLists[0]
        const updatedList = {
          title: 'updated list title',
        }
        const expectedList = {
          ...listToUpdate,
          ...updatedList
        }

        return supertest(app)
          .patch(`/api/lists/${listToUpdate.id}`)
          .send({
            ...updatedList,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/lists/${listToUpdate.id}`)
              .expect(expectedList)
          )
      })
    })


    context('Given there list is not in the database', () => {
      it(`responds with a 404`, () => {
        return supertest(app)
          .patch(`/api/lists/12345`)
          .expect(404, { error: { message: `List doesn't exist` } })
      })
    })
  })
})