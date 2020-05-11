const events = [
  {
    id: 1,
    title: 'event 1 title',
    date: new Date(),
    startTime: '15:00',
    userId: 1,
  },
  {
    id: 2,
    title: 'event 2 title',
    date: new Date(),
    startTime: '15:00',
    userId: 2,
  },
]

const tasks = [
  {
    id: 1,
    title: 'task 1',
    points: 10,
    complete: false,
    date: null,
    userId: null
  },
  {
    id: 2,
    title: 'task 2',
    points: 20,
    complete: false,
    date: null,
    userId: null
  },
]

const lists = [
  {
    id: 1,
    title: 'list 1'
  },
  {
    id: 2,
    title: 'list 2'
  },
]

const listItems = [
  {
    id: 1,
    title: 'item 1',
    listId: 1,
    checked: false
  },
  {
    id: 2,
    title: 'item 2',
    listId: 1,
    checked: false
  },
  {
    id: 3,
    title: 'item 3',
    listId: 2,
    checked: false
  },
  {
    id: 4,
    title: 'item 4',
    listId: 2,
    checked: false
  },
]

const users = [
  {
    id: 1,
    firstName: 'First-1',
    lastName: 'Last-1',
    password: 'password',
    family: 'family',
    email: 'first@email.com',
    points: 100
  },
  {
    id: 2,
    firstName: 'First-2',
    lastName: 'Last-2',
    password: 'password',
    family: 'family',
    email: 'second@email.com',
    points: 200
  }
]

const rewards = [
  {
    id: 1,
    title: 'reward-1',
    points: 100,
    claimed: false,
    userId: null
  },
  {
    id: 2,
    title: 'reward-2',
    points: 200,
    claimed: false,
    userId: null
  },
  {
    id: 3,
    title: 'reward-3',
    points: 100,
    claimed: false,
    userId: null
  },
]

module.exports = { events, tasks, lists, listItems, users, rewards }