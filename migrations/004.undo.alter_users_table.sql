ALTER TABLE users
DROP CONSTRAINT users_family_key;

ALTER TABLE users
ALTER COLUMN family type TEXT;