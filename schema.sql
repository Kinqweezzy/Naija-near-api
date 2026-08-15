CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS places (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL,
 type TEXT NOT NULL CHECK (type IN ('restaurant','hotel','mall','business')),
 city TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'Delta',
 address TEXT, description TEXT, rating NUMERIC(2,1),
 latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
 location GEOGRAPHY(POINT,4326), verified BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS places_city_idx ON places(city);
CREATE INDEX IF NOT EXISTS places_type_idx ON places(type);
CREATE INDEX IF NOT EXISTS places_location_idx ON places USING GIST(location);
CREATE TABLE IF NOT EXISTS orders (
 id BIGSERIAL PRIMARY KEY, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL,
 place_id BIGINT NOT NULL REFERENCES places(id), items JSONB NOT NULL,
 total_amount NUMERIC(12,2) NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
 payment_reference TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bookings (
 id BIGSERIAL PRIMARY KEY, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL,
 place_id BIGINT NOT NULL REFERENCES places(id), check_in DATE NOT NULL,
 check_out DATE NOT NULL, guests INTEGER NOT NULL DEFAULT 1,
 status TEXT NOT NULL DEFAULT 'pending', payment_reference TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);