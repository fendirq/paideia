import {
  action,
  mutation,
  query,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
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

export const listRunsForDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) return [];
    return await ctx.db
      .query("writingRuns")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});

export const getRun = query({
  args: { runId: v.id("writingRuns") },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const run = await ctx.db.get(args.runId);
    if (!run || run.ownerId !== user._id) return null;
    return run;
  },
});

export const createRun = mutation({
  args: {
    documentId: v.id("documents"),
    kind: v.union(
      v.literal("outline"),
      v.literal("draft"),
      v.literal("rewrite"),
    ),
    instruction: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.ownerId !== user._id) {
      throw new Error("Document not found");
    }
    return await ctx.db.insert("writingRuns", {
      ownerId: user._id,
      documentId: args.documentId,
      kind: args.kind,
      status: "queued",
      instruction: args.instruction,
      outputText: null,
    });
  },
});

export const markRunning = internalMutation({
  args: { runId: v.id("writingRuns") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, { status: "running" });
  },
});

export const markSucceeded = internalMutation({
  args: { runId: v.id("writingRuns"), outputText: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "succeeded",
      outputText: args.outputText,
    });
  },
});

export const markFailed = internalMutation({
  args: { runId: v.id("writingRuns"), errorMessage: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "failed",
      outputText: args.errorMessage,
    });
  },
});

// V1 uses a mock output path so the UI loop works end-to-end without a model
// provider wired. A real implementation swaps the mock for an LLM call; the
// action boundary already isolates that concern.
export const executeRun = action({
  args: {
    runId: v.id("writingRuns"),
    mockOutput: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.writingRuns.markRunning, {
        runId: args.runId,
      });
      // Simulate async work; production swap calls the LLM provider here.
      await new Promise((resolve) => setTimeout(resolve, 250));
      await ctx.runMutation(internal.writingRuns.markSucceeded, {
        runId: args.runId,
        outputText: args.mockOutput,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(internal.writingRuns.markFailed, {
        runId: args.runId,
        errorMessage: message,
      });
    }
  },
});
