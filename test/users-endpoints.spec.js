const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray, makeMaliciousUser } = require('./users.fixtures')
const helpers = require('./test-helpers')

describe.skip(`Users endpoints`, () => {
  let db

  const testUsers = makeUsersArray()
  const testUser = testUsers[0]

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })


  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  after(() => db.destroy())

  beforeEach('insert users', () =>
    helpers.seedFamily(db)
  )

  beforeEach('insert users', () =>
    helpers.seedUsers(
      db,
      testUsers,
    )
  )

  describe(`GET /api/users`, () => {
    context.skip(`Given no users in the database`, () => {
      it(`responds with an empty array`, () => {
        return supertest(app)
          .get('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })

    context(`Given there are users in the database`, () => {
      it(`responds with 200 and all the users`, () => {
        return supertest(app)
          .get('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testUsers)
      })
    })
  })

  describe(`GET /api/users/:user_id`, () => {
    context.skip(`Given no users in the database`, () => {
      it(`responds with 404`, () => {
        const user_id = 123456
        return supertest(app)
          .get(`/api/users/${user_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

    context(`Given there are users in the database`, () => {
      it(`responds with 200 and the specific user`, () => {
        return supertest(app)
          .get(`/api/users/${testUser.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testUser)
      })
    })

    context(`Given an XSS attack user`, () => {
      // const testUsers = makeUsersArray()
      const { maliciousUser, expectedUser } = makeMaliciousUser()

      beforeEach('insert malicious user', () => {
        return db
          .into('users')
          .insert(maliciousUser)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedUser.title)
          })
      })
    })
  })

  describe(`POST /api/users`, function () {
    it('creates an user, responding with 201 and the new user', () => {
      this.retries(3)
      const newUser = {
        first_name: 'new first name',
        last_name: 'new last name',
        email: 'new@email.com',
        password: 'newPassword',
        family: 1
      }
      return supertest(app)
        .post('/api/users')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.first_name).to.eql(newUser.first_name)
          expect(res.body.last_name).to.eql(newUser.last_name)
          expect(res.body.email).to.eql(newUser.email)
          expect(res.body.password).to.eql(newUser.password)
          expect(res.body.family).to.eql(newUser.family)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('points')
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/users/${postRes.body.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(postRes.body)
        )
    })

    const requiredFields = ['first_name', 'last_name', 'email', 'password', 'family']

    requiredFields.forEach(field => {
      const newUser = {
        first_name: 'new first name',
        last_name: 'new last name',
        email: 'new@email.com',
        password: 'newPassword',
        family: 'newFamily'
      }


      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field]

        return supertest(app)
          .post('/api/users')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /api/users/:user_id`, () => {
    context('Given there are users in database', () => {

      it(`responds with 204 and removes the user from the database`, () => {
        const userToRemove = testUsers[0]
        const expectedUsers = testUsers.filter(user => user.id !== userToRemove.id)
        return supertest(app)
          .delete(`/api/users/${userToRemove.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/users`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedUsers)
          })
      })
    })

    context.skip('Given there are no users in the database', () => {
      it(`responds with 404 user not found`, () => {
        return supertest(app)
          .delete(`/api/users/12345`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

  })

  describe(`PATCH /api/users/:user_id`, () => {
    context('Given the user is in the database', () => {

      it(`responds with a 204 and updates the user`, () => {
        const userToUpdate = testUsers[0]
        const updatedUser = {
          first_name: 'updated first name',
          last_name: 'updated last name',
          email: 'updated@email.com',
          password: 'updatedPassword',
          family: 'updatedFamily'
        }
        const expectedUser = {
          ...userToUpdate,
          ...updatedUser
        }
        return supertest(app)
          .patch(`/api/users/${userToUpdate.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(updatedUser)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${userToUpdate.id}`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedUser)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const userToUpdate = testUsers[0]
        return supertest(app)
          .patch(`/api/users/${userToUpdate.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ unMatchedField: 'test' })
          .expect(400, {
            error: { message: `Request body must contain either first_name, last_name, email, password or family` }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const userToUpdate = testUsers[0]
        const updatedUser = {
          first_name: 'updated first name',
          last_name: 'updated last name',
          email: 'updated@email.com',
          password: 'updatedPassword',
          family: 'updatedFamily'
        }
        const expectedUser = {
          ...userToUpdate,
          ...updatedUser
        }

        return supertest(app)
          .patch(`/api/users/${userToUpdate.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({
            ...updatedUser,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${userToUpdate.id}`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedUser)
          )
      })
    })


    context('Given there user is not in the database', () => {
      it(`responds with a 404`, () => {
        return supertest(app)
          .patch(`/api/users/12345`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })
  })


})