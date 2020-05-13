const RewardsService = {

  getAllRewards(knex) {
    return knex.select('*').from('rewards')
  },

  insertReward(knex, newReward) {
    return knex
      .insert(newReward)
      .into('rewards')
      .returning('*')
      .then(rows => rows[0])
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('rewards')
      .where({ id })
      .first()
  },

  deleteReward(knex, id) {
    return knex
      .delete()
      .from('rewards')
      .where({ id })
  },

  updateReward(knex, id, newRewardFields) {
    return knex('rewards')
      .where({ id })
      .update(newRewardFields)
  }
}
module.exports = RewardsService