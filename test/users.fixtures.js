function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'user 1 First',
      last_name: 'user 1 Last',
      email: 'first@email.com',
      password: 'password',
      family: 'user1family',
      points: 100,
    },
    {
      id: 2,
      first_name: 'user 2 First',
      last_name: 'user 2 Last',
      email: 'second@email.com',
      password: 'password',
      family: 'user2family',
      points: 200,
    },
  ]
}

function makeMaliciousUser() {
  const maliciousUser = {
    id: 911,
    first_name: 'Naughty <script>alert("xss");</script>',
    last_name: 'Naughty <script>alert("xss");</script>',
    email: 'Naughty <script>alert("xss");</script>',
    password: 'password',
    family: 'Naughty <script>alert("xss");</script>',
    points: 100,
  }
  const expectedUser = {
    ...maliciousUser,
    first_name: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    last_name: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    email: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    family: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousUser,
    expectedUser
  }
}

module.exports = {
  makeUsersArray,
  makeMaliciousUser
}