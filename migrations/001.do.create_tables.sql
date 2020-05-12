CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  family TEXT NOT NULL,
  points INTEGER DEFAULT 0
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date TIMESTAMP NOT NULL,
  start_time TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL 
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  points INTEGER NOT NULL,
  complete BOOLEAN DEFAULT false,
  completed_date DATE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE listItems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE
);

CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  points INTEGER NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_date DATE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);