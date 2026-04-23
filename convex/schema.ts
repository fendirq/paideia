import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkUserId: v.string(),
    displayName: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
    capabilities: v.array(v.string()),
    activeProfileId: v.union(v.id("writingProfiles"), v.null()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  folders: defineTable({
    ownerId: v.id("users"),
    parentFolderId: v.union(v.id("folders"), v.null()),
    name: v.string(),
  }).index("by_ownerId_and_parentFolderId", ["ownerId", "parentFolderId"]),

  documents: defineTable({
    ownerId: v.id("users"),
    folderId: v.union(v.id("folders"), v.null()),
    title: v.string(),
    status: v.union(v.literal("draft"), v.literal("archived")),
    latestSnapshotId: v.union(v.id("documentSnapshots"), v.null()),
  }).index("by_ownerId_and_folderId", ["ownerId", "folderId"]),

  documentSnapshots: defineTable({
    documentId: v.id("documents"),
    ownerId: v.id("users"),
    editorJson: v.string(),
    source: v.union(
      v.literal("autosave"),
      v.literal("manual"),
      v.literal("ai-run"),
    ),
  }).index("by_documentId", ["documentId"]),

  writingProfiles: defineTable({
    ownerId: v.id("users"),
    status: v.union(
      v.literal("empty"),
      v.literal("training"),
      v.literal("ready"),
    ),
    sampleCount: v.number(),
    summary: v.union(v.string(), v.null()),
  }).index("by_ownerId", ["ownerId"]),

  writingSamples: defineTable({
    ownerId: v.id("users"),
    profileId: v.id("writingProfiles"),
    fileId: v.union(v.id("_storage"), v.null()),
    title: v.string(),
    excerpt: v.union(v.string(), v.null()),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_profileId", ["profileId"]),

  writingRuns: defineTable({
    ownerId: v.id("users"),
    documentId: v.id("documents"),
    kind: v.union(
      v.literal("outline"),
      v.literal("draft"),
      v.literal("rewrite"),
    ),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),
    instruction: v.string(),
    outputText: v.union(v.string(), v.null()),
  })
    .index("by_documentId", ["documentId"])
    .index("by_ownerId", ["ownerId"]),
});
