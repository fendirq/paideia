import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { hasLevel2Access } from "@/lib/payment";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alreadyPaid = await hasLevel2Access(session.user.id, session.user.role);
  if (alreadyPaid) {
    return NextResponse.json({ alreadyPaid: true });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  const origin = new URL(req.url).origin;

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email ?? undefined,
      metadata: { userId: session.user.id },
      success_url: `${origin}/portal/upgrade?success=true`,
      cancel_url: `${origin}/portal/upgrade?canceled=true`,
    });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    // Stripe outage or a bad priceId will throw. Without this catch
    // Next.js surfaces a bare HTML 500 page; the client's
    // /api/portal/checkout fetch then rejects with no useful body.
    console.error("portal.checkout: Stripe session creation failed", {
      userId: session.user.id,
      priceId,
      err,
    });
    return NextResponse.json(
      { error: "Checkout service unavailable. Please try again in a minute." },
      { status: 503 },
    );
  }
}
