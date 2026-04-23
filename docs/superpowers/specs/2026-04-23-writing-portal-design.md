# Writing Portal Design

Status: Draft
Date: 2026-04-23
Scope: First product slice for the Paideia rebuild

## Summary

This spec defines the first sub-project for the new Paideia platform:

- a student-only writing portal
- the platform foundation required to support it cleanly

This first product slice is not the Socratic tutor and not the teacher workspace. It is the writing product students use as a better, more structured alternative to using a generic AI tool like ChatGPT for essay drafting and revision.

## Product Boundary

The writing portal is a student-only product surface.

- Teachers should not access it.
- Role and capability gating should allow the platform to hide student-only features from teachers and teacher-only features from students.
- This first sub-project is not a generic shared document system and is not a teacher workflow.

The product should optimize for one student:

- training a writing profile from real samples
- organizing work in a personal drive
- creating and editing multiple documents
- attaching prompts, source materials, and rubric text
- generating outlines or drafts
- making focused AI-assisted edits inside a lightweight editor

## Core User Workflow

The student first trains their profile by submitting real writing samples so the system can learn their voice. After that, they use the portal as an alternative to writing in a basic AI tool.

The first version should support:

- profile training from real writing samples
- prompt-based draft generation
- a built-in editor for quick edits
- selection-based AI edits for focused rewriting
- support for multiple documents
- a student-owned drive with folders
- prompt, source materials, and pasted rubric/requirements as document inputs
- user choice between outline-first and draft-first generation

## Real-Time and Sync Expectations

The portal should support:

- autosave
- multi-device resume
- same-user real-time sync across tabs/devices
- a foundation that can grow into deeper collaboration later

The first version does not need full Google Docs quality editing behavior, but it should be designed cleanly enough that the architecture does not become messy as the product grows.

## Recommended Architecture Direction

Recommended direction: Convex-first document app.

### Why

- Convex is a strong fit for documents, autosave, sync, workflow state, and AI job orchestration.
- It keeps the app model coherent instead of splitting durable state across too many systems.
- It matches the product’s need for document-centric workflows and same-user live sync.

### High-level split

- Next.js owns routes, auth-gated UI, uploads entry points, and product shell concerns.
- Clerk owns identity.
- Convex owns durable application state, sync, workflow state, and backend auth verification.

## High-Level Architecture

The first product slice should optimize for one authenticated student owning a drive, training a writing profile, creating folders and documents, uploading prompts, sources, and rubrics, generating drafts, and making targeted edits with AI.

Convex should own:

- users and capabilities
- folders
- documents
- source file metadata
- writing profile state
- generation runs
- editor snapshots
- live sync state

AI work should be represented as explicit backend workflows rather than implicit UI actions. Examples:

- train profile
- generate outline
- generate draft
- rewrite selection

Each of these should have:

- status
- inputs
- outputs
- retry/failure visibility
- references back to the document they affect

## Frontend Architecture

The frontend should stay narrow and product-shaped.

- Next.js App Router remains the shell.
- Clerk provides auth-gated access and role-aware visibility.
- Convex provides live data and sync.
- The app should not introduce a second heavy client data layer unless a real limitation forces it.

The editor route should be a focused client surface with:

- lightweight rich text editing
- AI action toolbar
- selection-aware rewrite actions
- autosave state
- generation controls in a sidebar or drawer

State separation should be explicit.

### Durable product state in Convex

- documents
- folders
- profile artifacts
- generation runs

### Transient editor interaction state in the client

- cursor
- active selection
- local typing buffer
- open or closed UI panels

### Derived AI workflow state

- queued
- running
- succeeded
- failed

## UI System, Theming, and Product Shell

The app should use a shadcn-first UI system with one unified product theme.

The selected direction is:

- preset `b7C9wSxrU`
- style `Lyra`
- base color `Mist`
- theme `Mist`
- chart color `Mist`
- heading `Figtree`
- font `Figtree`
- icon library `HugeIcons`
- radius `None`
- menu `Default / Solid`
- menu accent `Subtle`
- dark premium creative-studio design language

This should apply across the whole student product, including:

- drive
- onboarding
- folders
- document lists
- profile training
- AI controls
- editor workspace

The editor canvas may be visually refined for readability, but it should still feel like part of the same system rather than a separate theme.

Component strategy:

- shadcn-first
- component surface grows intentionally over time
- some components may be adapted or customized, but the system should stay visually uniform

## Product Surfaces and Information Architecture

The first writing-portal product should have four primary surfaces.

### 1. Profile Training

- guided setup flow
- upload writing samples
- collect preferences and context
- prepare the student for useful drafting

### 2. Drive

- student-owned drive
- folders
- multiple documents and related assets

### 3. Document Workspace

- lightweight rich text editing
- basic formatting
- targeted AI edits on selected content
- manual editing remains easy

### 4. Generation and Revision Flow

- outline-first or draft-first
- prompt input
- source materials
- pasted rubric and requirements
- generation integrated into the document lifecycle

### Current Navigation Direction

The initial student navigation should stay tight:

- Drive
- Profile
- current document workspace when a document is open

Out of scope for now:

- teacher views
- class management
- admin-heavy analytics
- broad AI tools menus detached from documents

## Editor and Document Model

Because the chosen editing experience is lightweight rich text with selection-focused AI edits, the document system should be built around a canonical document record plus versioned content snapshots.

Each document should have stable metadata in Convex:

- owner
- folder
- title
- created and updated timestamps
- status
- active prompt, rubric, and source references
- active profile reference
- latest snapshot pointer

The actual body content should be stored as editor snapshots in a separate versioned model. This supports:

- autosave
- restore previous state
- AI rewrites
- outline-to-draft transitions
- future audit and version history

The document is the durable object. Snapshots are the timed states of that object.

### Editing behavior

The client editor should own immediate typing responsiveness, selection state, and formatting actions.

Convex should receive:

- debounced snapshot saves
- explicit semantic operations

Examples:

- save current draft
- rewrite selected paragraph
- apply generated draft as new snapshot
- promote outline to draft
- rename document
- move to folder

AI operations should not mutate arbitrary client state directly. Instead, they should produce structured outputs that either:

- create a candidate change for the current document, or
- become a new snapshot when accepted or applied

Selection-based AI edits should be modeled as transformation requests against a known snapshot range, not blind freeform prompts.

That means the system always knows:

- which document
- which snapshot
- which range or selection
- what instruction was given
- what result came back
- whether it was applied

## Convex Responsibilities in This Stack

Convex should be treated as the application runtime for the writing portal, not just a database hanging off the side of Next.js.

The smoothness comes from giving Convex responsibility for the parts it is naturally strong at:

- realtime subscriptions
- durable product state
- auth-checked mutations
- backend workflows
- file and storage coordination

Next.js should stay focused on product shell concerns, route composition, and the editor UI.

### Convex feature buckets to rely on

#### Reactive queries

Use for:

- drive lists
- folders
- document metadata
- profile status
- generation status
- source and rubric attachments

These keep the UI live without inventing a separate sync layer.

#### Mutations

Use for:

- create, move, and rename docs and folders
- save snapshots
- attach prompts, rubrics, and source references
- apply accepted AI changes

All of these should be auth-checked with `ctx.auth.getUserIdentity()`.

#### Actions

Use for:

- longer-running AI work
- orchestration
- provider calls
- transformations that should not live inside a transaction

Examples:

- train voice profile
- generate outline
- generate draft
- rewrite selection

#### File storage

Use for:

- uploaded writing samples
- prompt and source attachments where raw files need to persist
- rubric or source artifacts before they are parsed into application-level records

#### Scheduling and workflow chaining

If generation or training needs multiple steps, retries, or background continuation, model that explicitly instead of burying it in one oversized request.

### Boundaries that keep Convex usage un-messy

1. Documents and folders are first-class durable objects.
2. Snapshots are separate from document metadata.
3. AI runs are first-class records with inputs, outputs, and status.
4. High-churn state is separated from stable state.
5. Indexes do the retrieval work.

Expected indexes include:

- drive listing by owner and folder
- documents by folder
- snapshots by document
- runs by document or user
- profile artifacts by owner

### Smooth path through the stack

1. Clerk authenticates the student.
2. Convex validates the Clerk token.
3. The UI subscribes to the student’s drive and document state through Convex queries.
4. The editor works locally for immediate responsiveness.
5. Debounced saves and explicit semantic actions go to Convex mutations.
6. AI generation and profile training run through Convex actions or workflows.
7. The UI reacts automatically as runs complete and snapshots update.

## V1 Feature Scope

V1 should deliver one clear promise:

A student can train a personal writing profile from real samples, organize work in a drive with folders, generate an outline or draft from a prompt plus supporting context, and make focused AI-assisted revisions inside a lightweight editor.

### 1. Profile Training

V1 should include:

- sample upload
- profile readiness state
- optional preferences and context capture
- retraining or profile refresh when new samples are added

The system should let a student become usable before the profile is fully mature.

### 2. Student Drive

V1 should include:

- create folder
- rename folder
- move folder
- create document
- rename document
- move document
- document list with last updated state
- folder-contained writing assets

V1 does not need advanced sharing, comments, or team permissions.

### 3. Draft Inputs

A document can have:

- prompt
- source materials
- pasted rubric or requirements

These inputs should be durable parts of the workspace, not one-off generation inputs.

### 4. Generation Flow

A student can choose:

- outline-first
- draft-first

V1 should support:

- generate outline
- generate draft
- regenerate from updated instructions
- preserve run history and outputs as structured records

### 5. Editor and Focused AI Edits

V1 should support:

- core rich text writing
- manual editing
- selecting text and asking AI to revise or focus on that selection
- applying AI output into the doc as a controlled document change
- autosave and recovery through snapshots

V1 should not chase advanced collaborative editing behavior.

### 6. Auth and Role Gating

V1 should include:

- student access to portal routes
- teachers hidden from this product surface
- a capability-ready architecture so role handling can expand later without rewriting every route

## Explicitly Out of Scope for V1

To keep the first portal sharp, v1 should leave out:

- teacher access to the writing portal
- deep class integration
- billing or subscription enforcement details unless they block product testing
- full audit or teacher attribution model
- Google-Docs-level collaboration
- comments
- suggestion mode
- multiplayer cursors
- broad admin tooling
- generalized AI chat detached from documents

## Success Criteria

This first product slice is successful if a student can:

1. sign in
2. train a profile from samples
3. create folders and documents in a drive
4. attach prompt, sources, and rubric context
5. choose outline-first or draft-first
6. receive a draft that uses their trained profile
7. revise targeted sections with AI
8. return later and find everything still organized and synced

## Open Questions

These still need final design decisions before implementation planning:

- which editor technology should back the lightweight rich text model
- how profile training artifacts should be represented in the data model
- how version history should appear in the student UI
- how AI generation history should appear in the document experience
- how far the drive model should go in v1 beyond folders and documents
- which exact shadcn components should anchor each major surface
