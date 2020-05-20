const ListsService = {

  getAllLists(knex, family) {
    return knex.select('*').from('lists').where({ family })
  },

  insertList(knex, newList) {
    return knex
      .insert(newList)
      .into('lists')
      .returning('*')
      .then(rows => rows[0])
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('lists')
      .where({ id })
      .first()
  },

  deleteList(knex, id) {
    return knex
      .delete()
      .from('lists')
      .where({ id })
  },

  updateList(knex, id, newListFields) {
    return knex('lists')
      .where({ id })
      .update(newListFields)
  }
}
module.exports = ListsService