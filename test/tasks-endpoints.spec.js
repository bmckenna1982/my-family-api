const knex = require('knex')
const app = require('../src/app')
const { makeTasksArray, makeMaliciousTask } = require('./tasks.fixtures')

describe('Tasks endpoints', () => {
  let db

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before(() => db('tasks').truncate())
  afterEach(() => db('tasks').truncate())

  after(() => db.destroy())

  describe(`GET /api/tasks`, () => {
    context(`Given no tasks in the database`, () => {
      it('responds with an empty array', () => {
        return supertest(app)
          .get('/api/tasks')
          .expect(200, [])
      })
    })

    context(`Given there are tasks in the database`, () => {
      const testTasks = makeTasksArray()

      beforeEach(() => {
        return db
          .into('tasks')
          .insert(testTasks)
      })

      it(`responds with 200 and all the tasks`, () => {
        return supertest(app)
          .get('/api/tasks')
          .expect(200, testTasks)
      })
    })
  })

  describe(`GET /api/tasks/:task_id`, () => {
    context(`Given no tasks in the database`, () => {
      it('responds with 404', () => {
        const task_id = 123456
        return supertest(app)
          .get(`/api/tasks/${task_id}`)
          .expect(404, { error: { message: `Task doesn't exist` } })
      })
    })

    context(`Given there are tasks in the database`, () => {
      const testTasks = makeTasksArray()

      beforeEach(() => {
        return db
          .into('tasks')
          .insert(testTasks)
      })

      it(`responds with 200 and the specific task`, () => {
        const testTask = testTasks[0]
        return supertest(app)
          .get(`/api/tasks/${testTask.id}`)
          .expect(200, testTask)
      })
    })

    context(`Given an XSS attack task`, () => {
      // const testUsers = makeUsersArray()
      const { maliciousTask, expectedTask } = makeMaliciousTask()

      beforeEach('insert malicious task', () => {
        return db
          .into('tasks')
          .insert(maliciousTask)
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/tasks/${maliciousTask.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedTask.title)
          })
      })
    })
  })

  describe(`POST /api/tasks`, function () {
    it('creates a task, responding with 201 and then new task', () => {
      this.retries(3)
      const newTask = {
        title: 'test new title',
        points: 50
      }
      return supertest(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newTask.title)
          expect(res.body.points).to.eql(newTask.points)
          expect(res.body.complete).to.eql(false)
          expect(res.body.completed_date).to.eql(null)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('user_id')
          expect(res.headers.location).to.eql(`/api/tasks/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/tasks/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })

    const requiredFields = ['title', 'points', 'complete']

    requiredFields.forEach(field => {
      const newTask = {
        title: 'test new title',
        points: 50
      }


      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newTask[field]

        return supertest(app)
          .post('/api/tasks')
          .send(newTask)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })


  describe(`DELETE /api/tasks/:task_id`, () => {
    context('Given there are tasks in database', () => {
      const testTasks = makeTasksArray()

      beforeEach(() => {
        return db
          .into('tasks')
          .insert(testTasks)
      })

      it(`responds with 204 and removes the task from the database`, () => {
        const taskToRemove = testTasks[0]
        const expectedTasks = testTasks.filter(task => task.id !== taskToRemove.id)
        return supertest(app)
          .delete(`/api/tasks/${taskToRemove.id}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/tasks`)
              .expect(expectedTasks)
          })
      })
    })

    context('Given there are no tasks in the database', () => {
      it(`responds with 404 task not found`, () => {
        return supertest(app)
          .delete(`/api/tasks/12345`)
          .expect(404, { error: { message: `Task doesn't exist` } })
      })
    })
  })

  describe(`PATCH /api/tasks/:task_id`, () => {
    context('Given the task is in the database', () => {
      const testTasks = makeTasksArray()

      beforeEach(() => {
        return db
          .into('tasks')
          .insert(testTasks)
      })

      it(`responds with a 204 and updates the task`, () => {
        const taskToUpdate = testTasks[0]
        const updatedTask = {
          title: 'updated title',
          points: 500
        }
        const expectedTask = {
          ...taskToUpdate,
          ...updatedTask
        }
        return supertest(app)
          .patch(`/api/tasks/${taskToUpdate.id}`)
          .send(updatedTask)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/tasks/${taskToUpdate.id}`)
              .expect(expectedTask)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const taskToUpdate = testTasks[0]
        return supertest(app)
          .patch(`/api/tasks/${taskToUpdate.id}`)
          .send({ unMatchedField: 'test' })
          .expect(400, {
            error: { message: `Request body must contain either title or points` }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const taskToUpdate = testTasks[0]
        const updatedTask = {
          title: 'updated task title',
          complete: true
        }
        const expectedTask = {
          ...taskToUpdate,
          ...updatedTask
        }

        return supertest(app)
          .patch(`/api/tasks/${taskToUpdate.id}`)
          .send({
            ...updatedTask,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/tasks/${taskToUpdate.id}`)
              .expect(expectedTask)
          )
      })
    })
  })
})