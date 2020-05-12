function makeEventsArray() {
  return [
    {
      id: 1,
      title: 'event 1 title',
      event_date: '2020-05-11T04:00:00.000Z',
      start_time: '15:00',
      user_id: null
    },
    {
      id: 2,
      title: 'event 2 title',
      event_date: '2020-05-11T04:00:00.000Z',
      start_time: '15:00',
      user_id: null
    },
  ]
}

function makeMaliciousEvent() {
  const maliciousEvent = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    event_date: new Date().toISOString(),
    start_time: '15:00'
  }
  const expectedEvent = {
    ...maliciousEvent,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousEvent,
    expectedEvent,
  }
}

module.exports = {
  makeEventsArray,
  makeMaliciousEvent
}