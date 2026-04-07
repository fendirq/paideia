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
        },
      });
    } catch (err) {
      // P2002 = unique constraint violation — already processed (idempotent)
      if ((err as { code?: string }).code === "P2002") {
        // Already processed — safe to ignore
      } else {
        console.error("stripe webhook: db update failed", err);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
