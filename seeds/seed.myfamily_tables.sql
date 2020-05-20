BEGIN;

TRUNCATE
  rewards,
  tasks,
  listItems,
  events,
  lists,
  users,
  family
  RESTART IDENTITY CASCADE;

INSERT INTO family (family_name)
  VALUES
  (
    'Demo'
  );

INSERT INTO users (first_name, last_name, email, password, family)
  VALUES
    (
      'Demo',
      'User',
      'demo@demo.com',
      '$2a$12$TI5cAkHqScTh2MwdBVoF4.l18hLCC0DpUSrEv4Dn3Y5FP1ow1Lx.G',
      1
    ),
    (
      'Child',
      'User',
      'child@demo.com',
      '$2a$12$TI5cAkHqScTh2MwdBVoF4.l18hLCC0DpUSrEv4Dn3Y5FP1ow1Lx.G',
      1
    );

INSERT INTO lists (title, family)
  VALUES
    (
      'Demo Grocery',
      1
    ),
    (
      'Demo Home',
      1
    );

INSERT INTO events (title, event_date, start_time, family)
  VALUES 
  (
    'demo event',
    '2020-05-20',
    '15:00',
    1
  ),
  (
    'demo event',
    '2020-05-23',
    '15:00',
    1
  );

INSERT INTO rewards (title, points, family)
  VALUES
    (
      'demo reward 1',
      100,
      1

    ),
    (
      'demo reward 2',
      200,
      1
    ),
    (
      'demo reward 3',
      100,
      1
    );

INSERT INTO listitems (title, list_id)
  VALUES
    (
      'grocery item 1',
      1
    ),
    (
      'grocery item 2',
      1
    ),
    (
      'grocery item 3',
      1
    ),
    (
      'home item 1',
      2
    ),
    (
      'home item 2',
      2
    );

INSERT INTO tasks (title, points, family)
  VALUES
    (
      'demo task 1',
    10, 
    1
    ),
    (
      'demo task 2',
    20, 
    1
    ),
    (
      'demo task 3',
    50, 
    1
    ),
    (
      'demo task 4',
    100, 
    1
    );

INSERT INTO tasks (title, points, complete, completed_date, user_id, family)
  VALUES
    (
      'demo complete 1',
    10,
    'true', 
    '2020-05-15',
    1,
    1
    ),
    (
      'demo complete 2',
    20,
    'true', 
    '2020-05-15',
    1, 
    1
    ),
    (
      'demo complete 3',
    50, 
    'true', 
    '2020-05-15',
    2,
    1
    ),
    (
      'demo complete 4',
    100, 
    'true', 
    '2020-05-15',
    1,
    1
    );

COMMIT;

