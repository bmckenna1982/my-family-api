const EventsService = require('../src/events-service')
const knex = require('knex')

describe('Events service object', () => {
  let db
  let testEvents = [
    {
      id: 1,
      title: 'event 1 title',
      event_date: new Date(),
      start_time: '15:00',
      user_id: null
    },
    {
      id: 2,
      title: 'event 2 title',
      event_date: new Date(),
      start_time: '15:00',
      user_id: null
    },
  ]

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })

  before(() => db('events').truncate())
  afterEach(() => db('events').truncate())

  before(() => {
    return db
      .into('events')
      .insert(testEvents)
  })

  after(() => db.destroy())

  describe('getAllEvents()', () => {
    it(`resolves all events from 'myfamily_events' table`, () => {
      return EventsService.getAllEvents(db)
        .then(actual => {
          expect(actual).to.eql(testEvents)
        })
    })

  })

})