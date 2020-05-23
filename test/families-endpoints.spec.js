const knex = require('knex')
const app = require('../src/app')

const helpers = require('./test-helpers')

describe('Families endpoints', () => {
  let db


  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  after(() => db.destroy())

  const testFamilies = helpers.makeFamiliesArray()
  const testFamily = testFamilies[0]

  beforeEach('insert families', () =>
    helpers.seedFamilies(
      db,
      testFamilies,
    )
  )

  // beforeEach('insert users', () =>
  //   helpers.seedUsers(
  //     db,
  //     testUsers,
  //   )
  // )

  describe.only(`GET /api/families`, () => {
    it(`responds with 200 and all the lists`, () => {
      return supertest(app)
        .get('/api/families')
        .expect(200, testFamilies)
    })
  })

  describe(`GET /api/families/:family_id`, () => {
    it(`responds with 201 and the specific family`, () => {
      return supertest(app)
        .get(`/api/families/${testFamily.id}`)
        .expect(200, testFamily)
    })
  })

  describe(`POST /api/families`, function () {
    const newFamily = {
      family_name: 'new test'
    }
    it(`creates a new family responding with 201 and the new family`, () => {
      this.retries(3)
      // const newFamily = {
      //   family_name: 'new test'
      // }
      return supertest(app)
        .post('/api/families')
        .send(newFamily)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.family_name).to.eql(newFamily.family_name)
          expect(res.headers.location).to.eql(`/api/families/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/families/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })

    it(`responds with 400 and an error message when the 'family_name' is missing`, () => {
      return supertest(app)
        .post('/api/families')
        .send({ noName: 'missing' })
        .expect(400, {
          error: { message: `Missing 'family_name' in request body` }
        })
    })
  })
})