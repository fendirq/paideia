import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

const PROFILE_READY_SAMPLE_TARGET = 3;
const PROFILE_SAMPLE_LIMIT = 12;

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

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireViewerRecord(ctx);
    const profile = await ctx.db
      .query("writingProfiles")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .unique();
    return profile;
  },
});

export const listSamples = query({
  args: { profileId: v.id("writingProfiles") },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.ownerId !== user._id) return [];
    return await ctx.db
      .query("writingSamples")
      .withIndex("by_profileId", (q) => q.eq("profileId", args.profileId))
      .order("desc")
      .take(PROFILE_SAMPLE_LIMIT);
  },
});

export const createProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireViewerRecord(ctx);
    const existing = await ctx.db
      .query("writingProfiles")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("writingProfiles", {
      ownerId: user._id,
      status: "empty",
      sampleCount: 0,
      summary: null,
    });
  },
});

export const addSampleMetadata = mutation({
  args: {
    profileId: v.id("writingProfiles"),
    title: v.string(),
    excerpt: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.ownerId !== user._id) {
      throw new Error("Profile not found");
    }
    await ctx.db.insert("writingSamples", {
      ownerId: user._id,
      profileId: args.profileId,
      fileId: null,
      title: args.title.trim(),
      excerpt: args.excerpt,
    });
    const nextCount = profile.sampleCount + 1;
    await ctx.db.patch(args.profileId, {
      sampleCount: nextCount,
      status: profile.status === "ready" ? "ready" : "training",
    });
  },
});

export const updateProfileSummary = mutation({
  args: {
    profileId: v.id("writingProfiles"),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.ownerId !== user._id) {
      throw new Error("Profile not found");
    }

    const summary = args.summary.trim();
    await ctx.db.patch(args.profileId, {
      summary: summary.length > 0 ? summary : null,
      status: profile.status === "empty" ? "training" : profile.status,
    });
  },
});

export const markProfileReady = mutation({
  args: {
    profileId: v.id("writingProfiles"),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.ownerId !== user._id) {
      throw new Error("Profile not found");
    }

    if (profile.sampleCount < PROFILE_READY_SAMPLE_TARGET) {
      throw new Error("Add at least three samples before marking ready");
    }

    if (!profile.summary?.trim()) {
      throw new Error("Add voice notes before marking ready");
    }

    await ctx.db.patch(args.profileId, {
      status: "ready",
    });
  },
});
