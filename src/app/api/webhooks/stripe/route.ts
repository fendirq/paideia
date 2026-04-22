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

  // Idempotency: record the event.id BEFORE touching user state. Stripe
  // replays events on timeout/non-2xx; without this, a stale replay of
  // `checkout.session.completed` after a `customer.subscription.deleted`
  // would reinstate level2PaidAt without a new payment.
  try {
    await db.stripeWebhookEvent.create({
      data: { id: event.id, eventType: event.type },
    });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("stripe webhook: idempotency insert failed", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("stripe webhook: checkout.session.completed missing userId", session.id);
      return NextResponse.json({ error: "Missing userId in metadata" }, { status: 500 });
    }

    try {
      await db.user.update({
        where: { id: userId },
        data: {
          level2PaidAt: new Date(),
          stripePaymentId: session.id,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        },
      });
    } catch (err) {
      const prismaErr = err as { code?: string };
      if (prismaErr.code === "P2002") {
        // Duplicate webhook delivery — already processed, safe to ignore
      } else {
        console.error("stripe webhook: db update failed", err);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : null;

    if (customerId) {
      try {
        await db.user.update({
          where: { stripeCustomerId: customerId },
          data: { level2PaidAt: null },
        });
      } catch (err) {
        const prismaErr = err as { code?: string };
        if (prismaErr.code !== "P2025") {
          console.error("stripe webhook: subscription.deleted db update failed", err);
          return NextResponse.json({ error: "DB error" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
