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

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: session.user.email ?? undefined,
    metadata: { userId: session.user.id },
    success_url: `${origin}/portal/upgrade?success=true`,
    cancel_url: `${origin}/portal/upgrade?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
