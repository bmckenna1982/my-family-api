ALTER TABLE events
ADD COLUMN family INTEGER REFERENCES family(id) ON DELETE CASCADE;