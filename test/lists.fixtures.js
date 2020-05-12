function makeListsArray() {
  return [
    {
      id: 1,
      title: 'list 1 title',
    },
    {
      id: 2,
      title: 'list 2 title',
    },
  ]
}

function makeMaliciousList() {
  const maliciousList = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
  }
  const expectedList = {
    ...maliciousList,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousList,
    expectedList,
  }
}

module.exports = {
  makeListsArray,
  makeMaliciousList
}