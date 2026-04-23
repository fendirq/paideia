import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

const DRIVE_DOCUMENT_LIMIT = 50;

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
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_ownerId_and_folderId", (q) =>
        q.eq("ownerId", user._id).eq("folderId", args.folderId),
      )
      .order("desc")
      .take(DRIVE_DOCUMENT_LIMIT);

    return await Promise.all(
      docs.map(async (doc) => {
        if (!doc.latestSnapshotId) {
          return {
            ...doc,
            lastUpdatedAt: doc._creationTime,
          };
        }

        const snapshot = await ctx.db.get(doc.latestSnapshotId);
        return {
          ...doc,
          lastUpdatedAt: snapshot?._creationTime ?? doc._creationTime,
        };
      }),
    );
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
    const title = args.title.trim();
    if (!title) throw new Error("Document title is required");

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.ownerId !== user._id) {
        throw new Error("Folder not found");
      }
    }

    return await ctx.db.insert("documents", {
      ownerId: user._id,
      folderId: args.folderId,
      title,
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
    const title = args.title.trim();
    if (!title) throw new Error("Document title is required");
    await ctx.db.patch(args.documentId, { title });
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

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.ownerId !== user._id) {
        throw new Error("Folder not found");
      }
    }

    await ctx.db.patch(args.documentId, { folderId: args.folderId });
  },
});
