# Deployment sequence

1. Provision managed PostgreSQL + PostGIS.
2. Run schema.sql.
3. Deploy Node API to an HTTPS host.
4. Add environment secrets.
5. Point the frontend to the API.
6. Add Paystack initialization/webhook verification.
7. Add maps/GPS and OTP.
8. Import and verify Delta businesses.
9. Test orders/bookings end-to-end before accepting real payments.
