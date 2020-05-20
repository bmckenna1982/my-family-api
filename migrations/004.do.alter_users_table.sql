ALTER TABLE users
ALTER COLUMN family TYPE INTEGER USING (trim(family)::integer);

ALTER TABLE users
ADD CONSTRAINT users_family_key FOREIGN KEY (family) REFERENCES family(id);
