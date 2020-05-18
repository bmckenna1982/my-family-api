const ListItemsService = {

  getAllListItems(knex) {
    return knex.select('*').from('listitems')
  },

  getAllListItemsByList(knex, list_id) {
    return knex.select('*').from('listitems').where({ list_id })
  },

  insertListItem(knex, newListItem) {
    return knex
      .insert(newListItem)
      .into('listitems')
      .returning('*')
      .then(rows => rows[0])
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('listitems')
      .where({ id })
      .first()
  },

  getByListId(knex, list_id) {
    return knex
      .select('*')
      .from('listitems')
      .where('list_id', list_id)
  },

  deleteListItem(knex, id) {
    return knex
      .delete()
      .from('listitems')
      .where({ id })
  },

  updateListItem(knex, id, newListItemFields) {
    return knex('listitems')
      .where({ id })
      .update(newListItemFields)
  }
}
module.exports = ListItemsService