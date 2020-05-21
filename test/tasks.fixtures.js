function makeTasksArray() {
  return [
    {
      id: 1,
      title: 'task 1 title',
      points: 100,
      complete: false,
      completed_date: null,
      family: 1,
      user_id: null
    },
    {
      id: 2,
      title: 'task 2 title',
      points: 50,
      complete: false,
      completed_date: null,
      family: 1,
      user_id: null
    },
  ]
}

function makeMaliciousTask() {
  const maliciousTask = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    points: 50,
    complete: false,
    completed_date: null,
    family: 1,
    user_id: null
  }
  const expectedTask = {
    ...maliciousTask,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousTask,
    expectedTask
  }
}

module.exports = {
  makeTasksArray,
  makeMaliciousTask
}