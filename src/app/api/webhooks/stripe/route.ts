import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("stripe webhook: STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: record event.id + side effects in ONE transaction.
  // If any side effect fails, the whole tx (including the event-id
  // row) rolls back, so Stripe's next retry gets a fresh attempt. If
  // we inserted the event id first outside a tx, a partial failure
  // would leave the dedup row committed and the retry would be
  // rejected as a duplicate with the side effect still undone.
  //
  // Stripe replays events on timeout/non-2xx. Without this tx pattern
  // a stale replay of checkout.session.completed after a later
  // subscription.deleted could reinstate level2PaidAt; with it, the
  // committed event-id row is our guarantee "this side effect ran."
  try {
    await db.$transaction(async (tx) => {
      await tx.stripeWebhookEvent.create({
        data: { id: event.id, eventType: event.type },
      });

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error("stripe webhook: checkout.session.completed missing userId", session.id);
          throw new WebhookMissingUserIdError();
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            level2PaidAt: new Date(),
            stripePaymentId: session.id,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          },
        });
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : null;

        if (customerId) {
          try {
            await tx.user.update({
              where: { stripeCustomerId: customerId },
              data: { level2PaidAt: null },
            });
          } catch (err) {
            // P2025: no row matched stripeCustomerId. Either the cancel
            // fires for a user we never saw the checkout for (test mode,
            // manual Stripe dashboard action) or the row was deleted. Not
            // a webhook failure — ack and move on so Stripe does not
            // retry. The tx still commits the event-id dedup row.
            const prismaErr = err as { code?: string };
            if (prismaErr.code !== "P2025") throw err;
          }
        }
      }
    });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    if (err instanceof WebhookMissingUserIdError) {
      return NextResponse.json({ error: "Missing userId in metadata" }, { status: 500 });
    }
    console.error("stripe webhook: transaction failed", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Marker error so the catch block can distinguish a missing-userId
// bail (should surface as a proper 500) from a generic DB failure. We
// deliberately throw out of the transaction so the event-id row rolls
// back — Stripe will retry, and if metadata is still missing the
// failure repeats until the issue is resolved upstream.
class WebhookMissingUserIdError extends Error {
  constructor() {
    super("Missing userId in metadata");
    this.name = "WebhookMissingUserIdError";
  }
}
