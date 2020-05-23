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
  },

  hasFamilyWithName(db, family_name) {
    return db('family')
      .where({ family_name })
      .first()
      .then(family => !!family)
  },
}
module.exports = FamiliesService