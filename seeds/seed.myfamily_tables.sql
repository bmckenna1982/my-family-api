BEGIN;

TRUNCATE
  rewards,
  tasks,
  listItems,
  events,
  lists,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (first_name, last_name, email, password, family)
  VALUES
    (
      'First-1',
      'Last-1',
      'first@email.com',
      'password',
      'family'
    ),
    (
      'First-2',
      'Last-2',
      'second@email.com',
      'password',
      'family'
    );

INSERT INTO lists (title)
  VALUES
    (
      'List 1'
    ),
    (
      'List 2'
    );

INSERT INTO events (title, event_date, start_time)
  VALUES 
  (
    'event 1 title',
    '2020-05-10',
    '15:00'
  );

INSERT INTO rewards (title, points)
  VALUES
    (
      'reward-1',
      100
    ),
    (
      'reward-2',
      200
    ),
    (
      'reward-3',
      100
    );

COMMIT;

