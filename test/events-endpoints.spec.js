const knex = require('knex')
const app = require('../src/app')
const { makeEventsArray, makeMaliciousEvent } = require('./events.fixtures')
const { makeUsersArray } = require('./users.fixtures')
const helpers = require('./test-helpers')

describe('Events endpoints', () => {
  let db

  const testUsers = makeUsersArray()
  const testUser = testUsers[0]
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  after('disconnect from db', () => db.destroy())

  beforeEach('insert users', () =>
    helpers.seedFamily(db)
  )

  beforeEach('insert users', () =>
    helpers.seedUsers(
      db,
      testUsers,
    )
  )

  describe(`GET /api/events`, () => {

    context(`Given no events in the database`, () => {
      it(`responds with an empty array`, () => {
        return supertest(app)
          .get('/api/events')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })

    context(`Given there are events in the database`, () => {
      const testEvents = makeEventsArray()

      beforeEach(() => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it(`responds with 200 and all the events`, () => {
        return supertest(app)
          .get('/api/events')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testEvents)
      })
    })
  })

  describe(`GET /api/events/upcoming`, () => {
    context(`Given no events in the database`, () => {
      it(`responds with an empty array`, () => {
        return supertest(app)
          .get('/api/events/upcoming')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })

    context(`Given there are events in the database`, () => {
      const testEvents = makeEventsArray()

      beforeEach(() => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it(`responds with 200 and next 3 events`, () => {
        const expectedEvents = testEvents.slice(0, 3)

        return supertest(app)
          .get('/api/events/upcoming')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedEvents)
      })
    })
  })

  describe(`GET /api/events/:event_id`, () => {
    context(`Given no events in the database`, () => {
      it(`responds with 404`, () => {
        const event_id = 123456
        return supertest(app)
          .get(`/api/events/${event_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: `Event doesn't exist` } })
      })
    })

    context(`Given there are events in the database`, () => {
      const testEvents = makeEventsArray()

      beforeEach(() => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it(`responds with 200 and the specific event`, () => {
        const testEvent = testEvents[0]
        return supertest(app)
          .get(`/api/events/${testEvent.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testEvent)
      })
    })

    context(`Given an XSS attack event`, () => {
      // const testUsers = makeUsersArray()
      const { maliciousEvent, expectedEvent } = makeMaliciousEvent()

      beforeEach('insert malicious event', () => {
        return db
          .into('events')
          .insert(maliciousEvent)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/events/${maliciousEvent.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedEvent.title)
          })
      })
    })
  })

  describe(`POST /api/events`, function () {
    it.skip('creates an event, responding with 201 and the new event', () => {
      this.retries(3)
      const newEvent = {
        title: 'test new title',
        event_date: new Date(),
        start_time: '15:00'
      }
      // console.log('testUser', helpers.makeAuthHeader(testUser))
      return supertest(app)
        .post('/api/events')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newEvent)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newEvent.title)
          expect(res.body.event_date).to.eql(newEvent.event_date.toDateString())
          expect(res.body.start_time).to.eql(newEvent.start_time)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('user_id')
          expect(res.headers.location).to.eql(`/api/events/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/events/${postRes.body.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(postRes.body)
        )
    })

    const requiredFields = ['title', 'event_date', 'start_time']

    requiredFields.forEach(field => {
      const newEvent = {
        title: 'test new title',
        event_date: '2020-05-11T04:00:00.000Z',
        start_time: '15:00'
      }


      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newEvent[field]

        return supertest(app)
          .post('/api/events')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newEvent)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /api/events/:event_id`, () => {
    context('Given there are events in database', () => {
      const testEvents = makeEventsArray()

      beforeEach(() => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it(`responds with 204 and removes the event from the database`, () => {
        const eventToRemove = testEvents[0]
        const expectedEvents = testEvents.filter(event => event.id !== eventToRemove.id)
        return supertest(app)
          .delete(`/api/events/${eventToRemove.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/events`)
              .expect(expectedEvents)
          })
      })
    })

    context('Given there are no events in the database', () => {
      it(`responds with 404 event not found`, () => {
        return supertest(app)
          .delete(`/api/events/12345`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: `Event doesn't exist` } })
      })
    })

  })

  describe.skip(`PATCH /api/events/:event_id`, () => {
    context('Given the event is in the database', () => {
      const testEvents = makeEventsArray()

      beforeEach(() => {
        return db
          .into('events')
          .insert(testEvents)
      })

      it(`responds with a 204 and updates the event`, () => {
        const eventToUpdate = testEvents[0]
        const updatedEvent = {
          title: 'updated title',
          event_date: new Date(new Date()).toDateString(),
          start_time: '17:00'
        }
        const expectedEvent = {
          ...eventToUpdate,
          ...updatedEvent
        }
        return supertest(app)
          .patch(`/api/events/${eventToUpdate.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(updatedEvent)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/events/${eventToUpdate.id}`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedEvent)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const eventToUpdate = testEvents[0]
        return supertest(app)
          .patch(`/api/events/${eventToUpdate.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ unMatchedField: 'test' })
          .expect(400, {
            error: { message: `Request body must contain either title or points` }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const eventToUpdate = testEvents[0]
        const updatedEvent = {
          title: 'updated event title',
          event_date: new Date(new Date()).toDateString(),
          start_time: '17:00'
        }
        const expectedEvent = {
          ...eventToUpdate,
          ...updatedEvent
        }

        return supertest(app)
          .patch(`/api/events/${eventToUpdate.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({
            ...updatedEvent,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/events/${eventToUpdate.id}`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedEvent)
          )
      })
    })


    context('Given there event is not in the database', () => {
      it(`responds with a 404`, () => {
        return supertest(app)
          .patch(`/api/events/12345`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: `Event doesn't exist` } })
      })
    })
  })
})