const FamiliesService = {

  getAllFamilies(knex) {
    return knex.select('*').from('family')
  },

  insertFamily(knex, newFamily) {
    return knex
      .insert(newFamily)
      .into('family')
      .returning('*')
      .then(rows => rows[0])
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('family')
      .where({ id })
      .first()
  }
}
module.exports = FamiliesService