const EventsService = {

  getAllEvents(knex) {
    return knex.select('*').from('events')
  }
}
module.exports = EventsService