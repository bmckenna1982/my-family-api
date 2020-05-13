function makeRewardsArray() {
  return [
    {
      id: 1,
      title: 'reward 1 title',
      points: 100,
      claimed: false,
      claimed_date: null,
      user_id: null
    },
    {
      id: 2,
      title: 'reward 2 title',
      points: 50,
      claimed: false,
      claimed_date: null,
      user_id: null
    },
  ]
}

function makeMaliciousReward() {
  const maliciousReward = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    points: 50,
    claimed: false,
    claimed_date: null,
    user_id: null
  }
  const expectedReward = {
    ...maliciousReward,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousReward,
    expectedReward
  }
}

module.exports = {
  makeRewardsArray,
  makeMaliciousReward
}