const EventsService = {

  getAllEvents(knex) {
    return knex.select('*').from('events')
  },

  insertEvent(knex, newEvent) {
    return knex
      .insert(newEvent)
      .into('events')
      .returning('*')
      .then(rows => rows[0])
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('events')
      .where({ id })
      .first()
  },

  deleteEvent(knex, id) {
    return knex
      .delete()
      .from('events')
      .where({ id })
  },

  updateEvent(knex, id, newEventFields) {
    return knex('events')
      .where({ id })
      .update(newEventFields)
  }
}
module.exports = EventsService