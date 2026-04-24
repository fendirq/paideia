"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";

let convexClient: ConvexReactClient | null = null;

function getConvexClient() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return null;
  }

  convexClient ??= new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  return convexClient;
}

export function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const client = getConvexClient();

  if (!client) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
