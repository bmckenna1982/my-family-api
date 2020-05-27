const EventsService = {

  getAllEvents(knex, family) {
    return knex.select('*').from('events').where({ family })
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
  },

  getUpcomingEvents(knex, family) {
    const currentDateTime = new Date()
    const currentDateStr = `${currentDateTime.getUTCMonth() + 1}/${currentDateTime.getUTCDate()}/${currentDateTime.getUTCFullYear()}`

    return knex.select('*').from('events')
      .where('event_date', '>=', currentDateStr)
      .where({ family })
      .orderBy('event_date', 'asc')
      .limit(3)
  },
}
module.exports = EventsService