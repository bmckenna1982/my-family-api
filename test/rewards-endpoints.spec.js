const knex = require('knex')
const app = require('../src/app')
const { makeRewardsArray, makeMaliciousReward } = require('./rewards.fixtures')

describe('Rewards endpoints', () => {
  let db

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before(() => db('rewards').truncate())
  afterEach(() => db('rewards').truncate())

  after(() => db.destroy())

  describe(`GET /api/rewards`, () => {
    context(`Given no rewards in the database`, () => {
      it('responds with an empty array', () => {
        return supertest(app)
          .get('/api/rewards')
          .expect(200, [])
      })
    })

    context(`Given there are rewards in the database`, () => {
      const testRewards = makeRewardsArray()

      beforeEach(() => {
        return db
          .into('rewards')
          .insert(testRewards)
      })

      it(`responds with 200 and all the rewards`, () => {
        return supertest(app)
          .get('/api/rewards')
          .expect(200, testRewards)
      })
    })
  })

  describe(`GET /api/rewards/:reward_id`, () => {
    context(`Given no rewards in the database`, () => {
      it('responds with 404', () => {
        const reward_id = 123456
        return supertest(app)
          .get(`/api/rewards/${reward_id}`)
          .expect(404, { error: { message: `Reward doesn't exist` } })
      })
    })

    context(`Given there are rewards in the database`, () => {
      const testRewards = makeRewardsArray()

      beforeEach(() => {
        return db
          .into('rewards')
          .insert(testRewards)
      })

      it(`responds with 200 and the specific reward`, () => {
        const testReward = testRewards[0]
        return supertest(app)
          .get(`/api/rewards/${testReward.id}`)
          .expect(200, testReward)
      })
    })

    context(`Given an XSS attack reward`, () => {
      // const testUsers = makeUsersArray()
      const { maliciousReward, expectedReward } = makeMaliciousReward()

      beforeEach('insert malicious reward', () => {
        return db
          .into('rewards')
          .insert(maliciousReward)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/rewards/${maliciousReward.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedReward.title)
          })
      })
    })
  })

  describe(`POST /api/rewards`, function () {
    it('creates a reward, responding with 201 and then new reward', () => {
      this.retries(3)
      const newReward = {
        title: 'test new title',
        points: 50
      }
      return supertest(app)
        .post('/api/rewards')
        .send(newReward)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newReward.title)
          expect(res.body.points).to.eql(newReward.points)
          expect(res.body.claimed).to.eql(false)
          expect(res.body.claimed_date).to.eql(null)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('user_id')
          expect(res.headers.location).to.eql(`/api/rewards/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/rewards/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })

    const requiredFields = ['title', 'points']

    requiredFields.forEach(field => {
      const newReward = {
        title: 'test new title',
        points: 50
      }


      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newReward[field]

        return supertest(app)
          .post('/api/rewards')
          .send(newReward)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /api/rewards/:reward_id`, () => {
    context('Given there are rewards in database', () => {
      const testRewards = makeRewardsArray()

      beforeEach(() => {
        return db
          .into('rewards')
          .insert(testRewards)
      })

      it(`responds with 204 and removes the reward from the database`, () => {
        const rewardToRemove = testRewards[0]
        const expectedRewards = testRewards.filter(reward => reward.id !== rewardToRemove.id)
        return supertest(app)
          .delete(`/api/rewards/${rewardToRemove.id}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/rewards`)
              .expect(expectedRewards)
          })
      })
    })

    context('Given there are no rewards in the database', () => {
      it(`responds with 404 reward not found`, () => {
        return supertest(app)
          .delete(`/api/rewards/12345`)
          .expect(404, { error: { message: `Reward doesn't exist` } })
      })
    })
  })

  describe(`PATCH /api/rewards/:reward_id`, () => {
    context('Given the reward is in the database', () => {
      const testRewards = makeRewardsArray()

      beforeEach(() => {
        return db
          .into('rewards')
          .insert(testRewards)
      })

      it(`responds with a 204 and updates the reward`, () => {
        const rewardToUpdate = testRewards[0]
        const updatedReward = {
          title: 'updated title',
          points: 500
        }
        const expectedReward = {
          ...rewardToUpdate,
          ...updatedReward
        }
        return supertest(app)
          .patch(`/api/rewards/${rewardToUpdate.id}`)
          .send(updatedReward)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/rewards/${rewardToUpdate.id}`)
              .expect(expectedReward)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const rewardToUpdate = testRewards[0]
        return supertest(app)
          .patch(`/api/rewards/${rewardToUpdate.id}`)
          .send({ unMatchedField: 'test' })
          .expect(400, {
            error: { message: `Request body must contain either title or points` }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const rewardToUpdate = testRewards[0]
        const updatedReward = {
          title: 'updated reward title',
          points: 500
        }
        const expectedReward = {
          ...rewardToUpdate,
          ...updatedReward
        }

        return supertest(app)
          .patch(`/api/rewards/${rewardToUpdate.id}`)
          .send({
            ...updatedReward,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/rewards/${rewardToUpdate.id}`)
              .expect(expectedReward)
          )
      })
    })
  })

})