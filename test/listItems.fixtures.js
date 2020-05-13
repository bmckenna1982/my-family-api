function makeListItemsArray() {
  return [
    {
      id: 1,
      title: 'listItem 1 title',
      list_id: 1,
      checked: false,
    },
    {
      id: 2,
      title: 'listItem 2 title',
      list_id: 1,
      checked: false,
    },
  ]
}

function makeMaliciousListItem() {
  const maliciousListItem = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    list_id: 1,
    checked: false,
  }
  const expectedListItem = {
    ...maliciousListItem,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousListItem,
    expectedListItem
  }
}

module.exports = {
  makeListItemsArray,
  makeMaliciousListItem
}