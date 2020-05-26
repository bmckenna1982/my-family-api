const PointsService = {

  getTasksPointsByUser(knex, user_id) {
    return knex
      .select('user_id')
      .from('tasks')
      .sum('points AS points')
      .where({ user_id })
      .groupBy('user_id')
      .first()
  },
  getRewardsPointsByUser(knex, user_id) {
    return knex
      .select('user_id')
      .from('rewards')
      .sum('points AS points')
      .where({ user_id })
      .groupBy('user_id')
      .first()
  },

}

module.exports = PointsService