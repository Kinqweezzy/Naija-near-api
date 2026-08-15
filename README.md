# NaijaNear Production API

Backend foundation for search and the future order/booking flows.

## Local setup
Install Node.js 20+, run `npm install`, create `.env` from `.env.example`, provision PostgreSQL + PostGIS, run `schema.sql`, then `npm run dev`.

## Production integrations still required
Managed database, HTTPS hosting, Paystack, maps/GPS, phone OTP, OpenAI, authentication, verified business data, monitoring, backups and rate limiting.

Never commit `.env` or production secrets.
