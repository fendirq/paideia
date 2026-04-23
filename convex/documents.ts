import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

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

export const listDocuments = query({
  args: {
    folderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    return await ctx.db
      .query("documents")
      .withIndex("by_ownerId_and_folderId", (q) =>
        q.eq("ownerId", user._id).eq("folderId", args.folderId),
      )
      .collect();
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) return null;
    return doc;
  },
});

export const createDocument = mutation({
  args: {
    folderId: v.union(v.id("folders"), v.null()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    return await ctx.db.insert("documents", {
      ownerId: user._id,
      folderId: args.folderId,
      title: args.title,
      status: "draft",
      latestSnapshotId: null,
    });
  },
});

export const renameDocument = mutation({
  args: { documentId: v.id("documents"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) throw new Error("Document not found");
    await ctx.db.patch(args.documentId, { title: args.title });
  },
});

export const moveDocument = mutation({
  args: {
    documentId: v.id("documents"),
    folderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) throw new Error("Document not found");
    await ctx.db.patch(args.documentId, { folderId: args.folderId });
  },
});
