# Paideia — Concept Brief (for redesign)

*A rethinking-level spec. Keeps the ideas, mechanisms, and design decisions. Drops the implementation specifics. Pair with `summary-3.md` if you need the current build's details.*

---

## 1. The Product Thesis

**An AI learning product that refuses to do the student's thinking for them — except when the student is *writing*, in which case it writes the way the student would write, just better.**

Two seemingly opposite stances in one product:

- **When studying**, the AI is Socratic: it asks rather than answers, and it grounds every question in the student's own materials.
- **When writing**, the AI is a voice-matched ghostwriter: it captures *this student's* style, rubric, and teacher context, and produces essays that read like them.

The tension is intentional. The tutor protects learning. The portal protects the student's voice. Both exist because the alternative (a generic AI that either solves homework or writes generic essays) is the default everywhere else.

Teachers sit above both — they create the context (classes, materials, rubrics) that the AI uses, and they see how students are actually using it.

---

## 2. Who It's For

- **Primary user: high-school students.** Two distinct jobs-to-be-done:
  1. *"I'm stuck and I want to understand, not just get the answer."*
  2. *"I have to write this essay and I want it to sound like me."*
- **Secondary user: high-school teachers.** Jobs:
  1. *"I want to give my students something that doesn't undermine what I'm teaching."*
  2. *"I want visibility into what my class is struggling with."*
- **Tertiary: school admins / parents** — not in scope today, but any model you pick should leave room for them later.

Worth reconsidering in a redesign: is there a version that works for *middle school* or *college* without being a different product? Today it's implicitly high-school, and that shapes tone, rubric expectations, and onboarding.

---

## 3. The Three Products (Conceptually)

### 3.1 The Socratic Tutor

**What it is.** A chat interface that helps the student think through a specific piece of material (a worksheet, a reading, a problem set, an essay prompt) by asking pointed questions instead of answering.

**Why it's distinctive.**
- It refuses to be a solver. It's an *interlocutor*.
- It's grounded — every response references the student's actual uploaded file, not abstract knowledge.
- It reshapes itself to match the *kind* of material (a problem set is walked through problem-by-problem; a reading is discussed paragraph-by-paragraph; a worksheet is handled question-by-question).
- The very first message is special: the tutor proves it's read the file by citing a specific detail from it.

**Core mechanisms worth preserving (or consciously replacing):**
- **Material-aware framing** — the tutor knows whether it's looking at a reading, a problem set, a worksheet, etc., and behaves differently. Don't lose this. It's what separates "chat with PDF" from actual tutoring.
- **Grounded-in-source retrieval** — not general knowledge, the student's actual document. Retrieval is a means, not the feature.
- **Help-type awareness** — the student can tell the tutor *why* they're asking (stuck, checking an answer, wanting to go deeper). The tutor adapts scaffolding.
- **Socratic-opener priming** — pre-generated "way-in" questions so the blank chat box isn't intimidating.

**Open questions for redesign:**
- Is chat even the right surface? Voice? Margin notes on the PDF? Inline annotation?
- Should the tutor sometimes *refuse* to engage (e.g., the student clearly just wants the answer)? How firm?
- How should it behave when the student is genuinely wrong — correct them, or let them discover it?
- Long conversations: what's the memory model? Today it compresses; could instead restart, or maintain an explicit "what we've worked on" sidebar.
- Multi-file sessions: does the tutor pick one, merge them, or switch based on the question?

### 3.2 The Writing Portal

**What it is.** A guided flow that: (a) captures a student's writing voice and their teacher's rubric, then (b) generates essays that sound like them and satisfy the rubric.

**Why it's distinctive.**
- It doesn't generate *an essay*. It generates *this student's essay*.
- Voice is captured from **real samples**, not self-description. Students can't accurately describe their own writing; their writing can.
- The rubric side is captured from the **teacher's lens** — what this teacher grades on, what students usually lose points for — not a generic "how to write a 5-paragraph essay."
- Output is produced through **multiple passes**, not one shot. Each pass has one job (plan, draft, critique, revise, then targeted fixes for evidence / attribution / rubric / voice).

**Core mechanisms worth preserving:**
- **The "style fingerprint"** — a structured profile of how the student writes (sentence patterns, signature vocabulary, transitions they use vs. avoid, how they handle evidence, their rhythm, even their typical errors). The exact shape can change; the *concept* — that voice is a measurable set of tendencies, not a vibe — is the key idea.
- **Two separate inputs** — teacher rubric AND student self-assessment AND samples. Any one is insufficient. Samples show *how*, the teacher profile shows *what's graded*, self-assessment shows *intent* and catches when samples are atypical.
- **Multi-pass generation with dedicated passes** — one prompt that "does everything" underperforms a pipeline where each pass has one small job. The specific pass list (plan/draft/critique/revise + conditional passes for expansion, evidence, attribution, rubric compliance, naturalness, source flow, trim) is tuned to *argumentative* essays. Narrative essays skip most optional passes.
- **A judge** — the pipeline critiques its own draft before revising. The revision knows what the critique said.
- **Two tiers** — a free, fast, voice-agnostic generator (Level 1) and a premium, voice-matched, multi-pass generator (Level 2). The free tier isn't a crippled demo; it's a separate use case (speed over quality).

**Open questions for redesign:**
- Is "generate the essay" even the right output? Could it instead be "draft alongside the student," with editable steps, or "give me three opening paragraphs in my voice"?
- Voice capture is currently one-shot up front. Could it be continuous (it learns from every essay the student accepts/rejects)?
- The rubric capture is currently a form. Could the student just upload a scored past assignment and we reverse-engineer what got points?
- Should Level 2 show its work (plan → draft → critique → revise visible to the user) or hide the machinery?
- How do you resist "just rewrite my draft" becoming the dominant usage pattern?
- Ethical surface area: the portal is closer to "AI ghostwriter" than "AI tutor." How explicit is that? Is there a visible teacher-facing audit trail? Today there isn't one — worth reconsidering.

### 3.3 The Teacher Workspace

**What it is.** A place where teachers create classes, upload materials, and get a feed of how their students are using the tutor.

**Why it's conceptually important.**
- It turns the student experience from "generic AI tutor" into "AI tutor that knows my class." The tutor works off *the teacher's* materials and *the teacher's* framing.
- It gives the teacher a reason to bring this into the classroom rather than fight it.

**Core mechanisms worth preserving:**
- **Class as a context container** — materials, assignments, students, and sessions all live inside it. The tutor reads from it; analytics roll up from it.
- **Join codes** — low-friction student enrollment. No email invites.
- **Material = first-class object** — not an attachment to an assignment. A material can be the anchor for any number of tutoring sessions.

**Open questions for redesign:**
- What does the teacher actually want to see? Today it's aggregate session counts and ratings. More useful might be: "these 5 students are stuck on the same concept," or "this assignment is harder than you think."
- Grading / submissions are on the roadmap but not built. Do you want to be in that market? It's a much bigger product if yes.
- Announcements, per-student notes, assignment vs. resource split — are these real needs or cargo-culted from LMS products?
- Should teachers be able to write/tune the tutor's behavior for their class (custom system-prompt overlays, banned topics, preferred Socratic style)?

---

## 4. Key Design Decisions Worth Revisiting

### 4.1 Two separate surfaces vs. one
Today the tutor and the portal are different products glued to one account. A student tutoring on an essay prompt has to leave the tutor and go to the portal to actually generate the essay. **Is that separation right?** It protects the "tutor doesn't do your homework" stance, but it's also friction. A redesign could:
- Keep them hard-separated (current — purity).
- Put them on a spectrum (tutor can escalate to co-drafting with friction).
- Merge them ("writing mode" inside one chat, with the tutor becoming the ghostwriter on demand).

### 4.2 Gating
Today: portal access requires a shared access code, *plus* Level 2 requires a Stripe subscription, *plus* admin role bypasses. That's three overlapping gates. Worth deciding in a redesign:
- Is the access code temporary (pre-launch) or permanent (per-school licensing)?
- Is Level 2 the monetization boundary or is the tutor also monetized?
- Do teachers pay, students pay, or schools pay?

### 4.3 Retrieval granularity
Today everything is file-level chunks with semantic search. Alternative models:
- Page-level / section-level retrieval (better for textbooks).
- Structured parse (a problem set has problems; retrieve the problem, not the chunk).
- No retrieval — full file in context (viable as context windows grow; simpler; probably the right move for most uploads < 30 pages).

### 4.4 The voice fingerprint format
Today it's a structured JSON with ~60 fields. Tradeoffs:
- **Structured (today)** — interpretable, auditable, can be shown to the student, composable across prompts. Risk: the schema biases what "voice" means.
- **Freeform** — LLM-generated prose description of the voice. Less legible, possibly more accurate, harder to validate.
- **Exemplar-based** — no schema, just retrieve similar sentences from the student's own samples at generation time. Simpler, but brittle.
- **Hybrid** — structured skeleton + raw excerpts. Probably the right answer.

### 4.5 Multi-pass vs. single-pass generation
The multi-pass pipeline is costly (latency, tokens, stage complexity). A redesign could:
- Keep multi-pass but make the passes configurable per essay type.
- Replace it with a single pass using a much stronger model and a very detailed prompt.
- Keep multi-pass but expose it as *steps the student approves* instead of hidden machinery.

### 4.6 Trust and attribution
Today there's no mechanism for a teacher to see that a submitted essay was Level-2 generated in the portal. A redesign should decide up-front:
- Invisible assistance (current de facto stance).
- Attributed assistance ("this essay was drafted with Paideia" watermark / teacher dashboard).
- Gated assistance (teacher enables/disables Level 2 for their class).

This is the single most consequential product decision the app is currently punting on.

### 4.7 Socratic rigidity
The tutor is currently quite firm about not giving answers. In practice, some students (and some moments) need the answer. A redesign should decide:
- Strict Socratic (today).
- Tiered: show hint → show next step → show answer, with friction between tiers.
- User-adjustable: student picks Socratic vs. direct at session start.

---

## 5. The Data Shape (at concept level)

Not schema — concepts. A redesign needs to represent these regardless of tech stack:

- **User** with a role (student / teacher / admin), plus whatever's needed for payment entitlement.
- **Class** — a teacher-owned container with a join code, a roster, materials, and derived analytics.
- **Material** — a first-class object owned by a teacher (class materials) or a student (inquiries). Has files attached, each of which gets parsed into chunks, embedded, and classified by structure.
- **Structure classification** — a discriminated type describing what a material *is* (reading, reading+questions, worksheet, problem set, essay prompt, fill-in template, unknown). Drives tutor behavior.
- **Session** — a tutoring conversation anchored to a material. Has messages, optional rating, optional compressed summary, a help-type signal, and a status.
- **Writing Profile** — a per-student record of their voice, plus the teacher-rubric + self-assessment context that goes with it.
- **Writing Sample** — raw student essays used to build the profile.
- **Generated Essay** — output of a portal generation, stamped with tier (free vs. voice-matched), and optionally tied to a teacher's class for organization.
- **Rate limit / audit records** — operational, not product.

Worth questioning in a redesign:
- Are "Inquiry" (student's own material) and "ClassMaterial" (teacher's material) really two different things? Today they're parallel tables. They could be one type with an owner.
- Is "PortalClass" (student-owned folder for generated essays) necessary, or can generated essays just be tagged?
- Does "StudyItem" / "Exam" still earn its place? It exists in the schema but barely surfaces in the UX.

---

## 6. The Non-Negotiables (if you keep the idea)

If you redesign the app, these are the commitments that make it *Paideia* rather than a generic AI-in-education product. Breaking any one of them changes the product.

1. **The tutor is grounded in the student's actual material.** Not general knowledge. Not web search. The file they uploaded or their teacher gave them.
2. **The tutor defaults to questions, not answers.** How firmly is a design choice; the default is not.
3. **The writing product captures voice from real samples, not descriptions.**
4. **The writing product captures the teacher's rubric, not a generic rubric.**
5. **Essays are refined, not one-shot.** The exact pipeline can change; the commitment to "more than one pass" should not.
6. **Teachers have a real role, not a dashboard after the fact.** Classes, materials, and context flow from the teacher into the student experience.
7. **There are tiers.** At least one fast / cheap / no-setup tier and one premium / high-quality / requires-setup tier. Whatever you charge for, not everything should be behind it.

---

## 7. What to Throw Away in the Redesign

Don't bring these forward uncritically.

- **The "inquiry" metaphor.** Students don't talk like this. They have assignments, materials, and questions. Call them that.
- **Separate chat surfaces per inquiry vs. per material.** Probably should be one thing.
- **The portal access code.** It's a pre-launch gate that smells permanent. Decide if it is.
- **Search as a navbar item that doesn't work.** Either build it or remove it.
- **`StudyItem` / `Exam` / exam-countdown.** They exist, they barely surface. Decide if they're a feature or bit-rot.
- **Two session sources (inquiry-based vs. material-based) plumbed in parallel.** Collapse.
- **Role = STUDENT | TEACHER | ADMIN as a rigid enum.** A user can easily be both (a TA, a tutor, a parent). Model it as capabilities, not roles.
- **Waitlist / admin-passcode artifacts.** Already mostly removed; finish.
- **"Help type" as a discrete enum the student picks.** Inferring it from the message is probably better UX.

---

## 8. What to Figure Out Before Building

Questions that are cheap to answer now and expensive to answer later:

1. **Monetization model** — subscription per student? per school? per teacher? freemium with usage caps?
2. **Who hosts whose data** — is this a SaaS where student essays live in your database, or does the school bring their own storage?
3. **Privacy posture for under-18 users** — this shapes auth, retention, and what you can log.
4. **The honesty question** — is the writing portal openly a ghostwriter, or dressed as "editing help"? Pick and commit.
5. **The single LLM or many** — today it's multi-provider. For a redesign, is the cost/latency/quality tradeoff actually load-bearing, or is it over-engineering?
6. **Real-time vs. async** — the tutor is streaming chat. Does it need to be? Async "I'll think and come back with questions" could be a stronger pedagogical move.
7. **Surface** — web-only today. Mobile-first? Extension-first (annotate any PDF in the browser)? Desktop app? Each changes the architecture.
8. **Languages** — `MANDARIN` is in the subject enum but nothing in the prompts suggests non-English support. Is this a bilingual product?

---

## 9. One-Paragraph Pitch (for rethinking)

> Paideia is two AI tools for students, sharing an account: a tutor that refuses to give you answers and instead asks questions about your actual homework, and a writer that refuses to sound like generic AI and instead learns how *you* write. Teachers bring the materials and the rubrics; students bring the questions and the samples; the AI stays in the middle. Everything it does is grounded in real classroom context, not pretraining.

If the redesign can still be described by that paragraph, the idea survived. If it can't, you've made a different product — which might be the right call, but should be a conscious one.
