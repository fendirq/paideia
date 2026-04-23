import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

const SNAPSHOT_LIST_LIMIT = 25;

async function requireViewerRecord(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) throw new Error("User record missing");
  return user;
}

export const listSnapshots = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) return [];
    return await ctx.db
      .query("documentSnapshots")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .take(SNAPSHOT_LIST_LIMIT);
  },
});

export const saveSnapshot = mutation({
  args: {
    documentId: v.id("documents"),
    editorJson: v.string(),
    source: v.union(v.literal("autosave"), v.literal("manual"), v.literal("ai-run")),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) throw new Error("Document not found");

    if (doc.latestSnapshotId) {
      const latestSnapshot = await ctx.db.get(doc.latestSnapshotId);
      if (
        latestSnapshot &&
        latestSnapshot.ownerId === user._id &&
        latestSnapshot.editorJson === args.editorJson
      ) {
        return latestSnapshot._id;
      }
    }

    const snapshotId = await ctx.db.insert("documentSnapshots", {
      documentId: args.documentId,
      ownerId: user._id,
      editorJson: args.editorJson,
      source: args.source,
    });
    await ctx.db.patch(args.documentId, { latestSnapshotId: snapshotId });
    return snapshotId;
  },
});

export const getLatestSnapshot = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) return null;
    if (!doc.latestSnapshotId) return null;
    return await ctx.db.get(doc.latestSnapshotId);
  },
});
