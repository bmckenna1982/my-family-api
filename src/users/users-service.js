const bcrypt = require('bcryptjs')
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {

  getAllUsers(knex) {
    return knex
      // .select('*')
      .from('users AS usr')
      .select(
        'usr.first_name',
        'usr.last_name',
        'usr.family',
        'usr.email',
        knex.raw(
          `sum(tasks.points) AS points`
        ),
      )
      .leftJoin(
        'tasks',
        'usr.id',
        'tasks.user_id',
      )
      .groupBy('usr.id')
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(rows => rows[0])
  },

  getById(knex, id) {
    return knex
      .from('users AS usr')
      .select(
        'usr.first_name',
        'usr.last_name',
        'usr.family',
        'usr.email',
        knex.raw(
          `sum(tasks.points) AS points`
        ),
      )
      .leftJoin(
        'tasks',
        'usr.id',
        'tasks.user_id',
      )
      .where('usr.id', id)
      .groupBy('usr.id')
      .first()
  },

  deleteUser(knex, id) {
    return knex
      .delete()
      .from('users')
      .where({ id })
  },

  updateUser(knex, id, newUserFields) {
    return knex('users')
      .where({ id })
      .update(newUserFields)
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password may not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, number and special character'
    }
    return null
  },

  hasUserWithEmail(db, email) {
    return db('users')
      .where({ email })
      .first()
      .then(user => !!user)
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12)
  }
}
module.exports = UsersService