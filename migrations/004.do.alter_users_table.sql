ALTER TABLE users
ALTER COLUMN family TYPE INTEGER NOT NULL ON DELETE CASCADE;

ALTER TABLE users
ADD CONSTRAINT users_family_key FOREIGN KEY (family) REFERENCES family(id);