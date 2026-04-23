import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

const DRIVE_ITEM_LIMIT = 50;

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

export const listFolders = query({
  args: {
    parentFolderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    return await ctx.db
      .query("folders")
      .withIndex("by_ownerId_and_parentFolderId", (q) =>
        q.eq("ownerId", user._id).eq("parentFolderId", args.parentFolderId),
      )
      .order("desc")
      .take(DRIVE_ITEM_LIMIT);
  },
});

export const getFolder = query({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.ownerId !== user._id) {
      return null;
    }
    return folder;
  },
});

export const createFolder = mutation({
  args: {
    parentFolderId: v.union(v.id("folders"), v.null()),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Folder name is required");

    if (args.parentFolderId) {
      const parentFolder = await ctx.db.get(args.parentFolderId);
      if (!parentFolder || parentFolder.ownerId !== user._id) {
        throw new Error("Parent folder not found");
      }
    }

    return await ctx.db.insert("folders", {
      ownerId: user._id,
      parentFolderId: args.parentFolderId,
      name,
    });
  },
});

export const renameFolder = mutation({
  args: { folderId: v.id("folders"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.ownerId !== user._id) throw new Error("Folder not found");
    const name = args.name.trim();
    if (!name) throw new Error("Folder name is required");
    await ctx.db.patch(args.folderId, { name });
  },
});
