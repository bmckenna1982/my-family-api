const TasksService = {

  getAllTasks(knex) {
    return knex.select('*').from('tasks').orderBy('id', 'asc')
  },

  insertTask(knex, newTask) {
    return knex
      .insert(newTask)
      .into('tasks')
      .returning('*')
      .then(rows => rows[0])
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('tasks')
      .where({ id })
      .first()
  },

  deleteTask(knex, id) {
    return knex
      .delete()
      .from('tasks')
      .where({ id })
  },

  updateTask(knex, id, newTaskFields) {
    return knex('tasks')
      .where({ id })
      .update(newTaskFields)
  }
}
module.exports = TasksService