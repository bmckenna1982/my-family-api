const EventsService = require('../src/events/events-service')
const knex = require('knex')
const app = require('../src/app')
const { makeEventsArray, makeMaliciousEvent } = require('./events.fixtures')

describe.only('Events endpoints', () => {
  let db
  // let testEvents = [
  //   {
  //     id: 1,
  //     title: 'event 1 title',
  //     event_date: '2020-05-11T04:00:00.000Z',
  //     start_time: '15:00',
  //     user_id: null
  //   },
  //   {
  //     id: 2,
  //     title: 'event 2 title',
  //     event_date: '2020-05-11T04:00:00.000Z',
  //     start_time: '15:00',
  //     user_id: null
  //   },
  // ]

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  before(() => db('events').truncate())
  afterEach(() => db('events').truncate())

  after(() => db.destroy())

  describe(`GET /events`, () => {
    context(`Given no events in the database`, () => {
      it(`responds with an empty array`, () => {
        return supertest(app)
          .get('/events')
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
        // return EventsService.getAllEvents(db)
        return supertest(app)
          .get('/events')
          .expect(200, testEvents)
        // .expect(200, testEvents.map(event => ({
        //   ...event,
        //   event_date: event.event_date.toLocaleString('en', { timeZone: 'UTC' })
        // })))
      })
    })
  })

  describe(`GET /events/:event_id`, () => {
    context(`Given no events in the database`, () => {
      it(`responds with 404`, () => {
        const event_id = 123456
        return supertest(app)
          .get(`/events/${event_id}`)
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
          .get(`/events/${testEvent.id}`)
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
          .get(`/events/${maliciousEvent.id}`)
          .expect(200)
          .expect(res => {
            console.log('res.body', res.body)
            expect(res.body.title).to.eql(expectedEvent.title)
          })
      })
    })
  })

  describe(`POST /events`, function () {
    it('creates an event, responding with 201 and the new event', () => {
      this.retries(3)
      const newEvent = {
        title: 'test new title',
        event_date: '2020-05-11T04:00:00.000Z',
        start_time: '15:00'
      }
      return supertest(app)
        .post('/events')
        .send(newEvent)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newEvent.title)
          expect(res.body.event_date).to.eql(newEvent.event_date)
          expect(res.body.start_time).to.eql(newEvent.start_time)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('user_id')
          expect(res.headers.location).to.eql(`/events/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/events/${postRes.body.id}`)
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
          .post('/events')
          .send(newEvent)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /events/:event_id`, () => {
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
          .delete(`/events/${eventToRemove.id}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/events`)
              .expect(expectedEvents)
          })
      })
    })

    context('Given there are no events in the database', () => {
      it(`responds with 404 event not found`, () => {
        return supertest(app)
          .delete(`/events/12345`)
          .expect(404, { error: { message: `Event doesn't exist` } })
      })
    })

  })
})