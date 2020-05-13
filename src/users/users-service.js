const UsersService = {

  getAllUsers(knex) {
    return knex.select('*').from('users')
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
      .select('*')
      .from('users')
      .where({ id })
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
  }
}
module.exports = UsersService