import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { defaultCapabilitiesForEmail } from "./lib/capabilities";

export const ensureViewer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing) return existing;

    const id = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      displayName: identity.name ?? null,
      email: identity.email ?? null,
      capabilities: defaultCapabilitiesForEmail(identity.email ?? null),
      activeProfileId: null,
    });
    return await ctx.db.get(id);
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});
