-- WaitlistEntry gated pre-launch email signups. Paideia is live and
-- the /waitlist page is gone; no remaining writers, no remaining
-- readers (admin dashboard no longer queries it). Dropping the table
-- removes the last reference to the pre-launch gate.

DROP TABLE "WaitlistEntry";
