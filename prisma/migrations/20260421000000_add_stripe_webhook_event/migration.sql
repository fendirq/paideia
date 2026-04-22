-- Stripe webhook idempotency. Stripe replays events when an earlier
-- delivery timed out or returned a non-2xx. Without a processed-event
-- log, replaying an old checkout.session.completed after a later
-- customer.subscription.deleted would reinstate level2PaidAt without
-- a new payment.
--
-- Route writes the event.id here inside the same transaction as the
-- side effect; the PK collision on replay short-circuits before any
-- user data is touched.

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
  "id"          TEXT         NOT NULL,
  "eventType"   TEXT         NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);
