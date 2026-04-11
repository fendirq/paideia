import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildLevel1Prompt,
  buildLevel2PlanPrompt,
  buildLevel2WritingPrompt,
  buildLevel2AuditPrompt,
  buildLegacyLevel1Prompt,
  normalizeFingerprint,
} from "@/lib/essay-generator";
import type {
  TeacherProfile,
  SelfAssessment,
  GenerateOptions,
  LegacyGenerateOptions,
} from "@/lib/essay-generator";

export const maxDuration = 180;

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const LEVEL1_MODEL = "deepseek-ai/DeepSeek-V3";
const LEVEL2_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

interface GenerateBody {
  assignment: string;
  wordCount: number;
  requirements?: string;
  level: 1 | 2;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: GenerateBody = await req.json();
  const { assignment, wordCount, requirements, level } = body;

  if (!assignment?.trim()) {
    return NextResponse.json({ error: "Assignment is required" }, { status: 400 });
  }
  if (typeof wordCount !== "number" || wordCount < 250 || wordCount > 2000) {
    return NextResponse.json({ error: "Word count must be between 250 and 2000" }, { status: 400 });
  }
  if (typeof level !== "number" || (level !== 1 && level !== 2)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (assignment.length > 5000 || (requirements && requirements.length > 5000)) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const userId = session.user.id;

  const [profile, samples, paymentUser] = await Promise.all([
    db.writingProfile.findUnique({ where: { userId } }),
    db.writingSample.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    level === 2
      ? db.user.findUnique({ where: { id: userId }, select: { level2PaidAt: true, role: true } })
      : null,
  ]);

  if (!profile || !samples.length) {
    return NextResponse.json({ error: "Complete your writing profile first" }, { status: 400 });
  }

  // Guard: Level 2 generation requires a Level 2 profile
  if (level === 2 && profile.level !== 2) {
    return NextResponse.json({ error: "Level 2 generation requires a Level 2 profile. Update your profile first." }, { status: 400 });
  }

  // Guard: Level 2 generation requires payment (admin bypass)
  if (level === 2 && paymentUser?.role !== "ADMIN" && !paymentUser?.level2PaidAt) {
    return NextResponse.json({ error: "Level 2 requires an upgrade. Visit the upgrade page to unlock." }, { status: 403 });
  }

  const sampleData = samples.map((s) => ({ label: s.label, content: s.content }));
  const rawFingerprint = profile.styleFingerprint as Record<string, unknown> | null;

  if (rawFingerprint) {
    if (!profile.teacherProfile || !profile.selfAssessment) {
      return NextResponse.json({ error: "Incomplete profile. Please update your writing profile." }, { status: 400 });
    }
    const fingerprint = normalizeFingerprint(rawFingerprint);
    const tp = profile.teacherProfile as unknown as TeacherProfile;
    const sa = profile.selfAssessment as unknown as SelfAssessment;

    // Ensure backward compat: if old profile shape is loaded, provide defaults
    const teacherProfile: TeacherProfile = {
      gradeLevel: tp.gradeLevel || "",
      gradeOther: tp.gradeOther || "",
      losesPointsFor: tp.losesPointsFor || [],
      losesPointsOther: tp.losesPointsOther || "",
    };

    const selfAssessment: SelfAssessment = {
      gradeRange: sa.gradeRange || "",
      gradeRangeOther: sa.gradeRangeOther || "",
      revisionLevel: sa.revisionLevel || "",
      revisionOther: sa.revisionOther || "",
      evidenceApproach: sa.evidenceApproach || "",
      evidenceOther: sa.evidenceOther || "",
      conclusionApproach: sa.conclusionApproach || "",
      conclusionOther: sa.conclusionOther || "",
      wordCountTendency: sa.wordCountTendency || "",
      wordCountOther: sa.wordCountOther || "",
      writingHabits: sa.writingHabits || [],
      writingHabitsOther: sa.writingHabitsOther || "",
      quoteIntroStyle: sa.quoteIntroStyle,
      quoteIntroOther: sa.quoteIntroOther,
      overusedPhrases: sa.overusedPhrases,
      overusedPhrasesOther: sa.overusedPhrasesOther,
      selfEditFocus: sa.selfEditFocus,
      selfEditOther: sa.selfEditOther,
      timeSpentOn: sa.timeSpentOn,
      timeSpentOther: sa.timeSpentOther,
    };

    const opts: GenerateOptions = {
      teacherProfile,
      selfAssessment,
      fingerprint,
      samples: sampleData,
      assignment,
      wordCount,
      requirements,
    };

    if (level === 1) {
      return streamLevel1(opts);
    } else {
      return await streamLevel2Anthropic(opts);
    }
  } else {
    // Legacy fallback — old profile shape, no fingerprint (Level 1 only)
    if (level === 2) {
      return NextResponse.json(
        { error: "Level 2 requires a style fingerprint. Please update your writing profile first." },
        { status: 400 }
      );
    }

    const profileData = {
      teacherProfile: profile.teacherProfile as Record<string, unknown>,
      selfAssessment: profile.selfAssessment as Record<string, unknown>,
      writingStyle: (profile.writingStyle ?? {}) as Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const legacyOpts: LegacyGenerateOptions = {
      profile: profileData,
      samples: sampleData,
      assignment,
      wordCount,
      requirements,
    };

    return streamLegacy(legacyOpts);
  }
}

// ─── Level 1: DeepSeek-V3 via Together AI ───

function streamLevel1(opts: GenerateOptions): Response {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Together API key not configured" }, { status: 500 });
  }

  const systemPrompt = buildLevel1Prompt(opts);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(TOGETHER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: LEVEL1_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Write the essay now." },
            ],
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `API error: ${res.status}` })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        await pipeTogetherStream(res.body, controller, encoder);
      } catch {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Connection failed" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch { /* controller may already be closed by pipeTogetherStream */ }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── Level 2: Claude Sonnet 4 via Anthropic (outline + essay) ───

async function streamLevel2Anthropic(opts: GenerateOptions): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });

  let outline = "";
  let rawEssay = "";

  try {
    // Step 1: Structural plan (non-streaming, 45s timeout)
    const planPrompt = buildLevel2PlanPrompt(opts);
    const outlineMsg = await anthropic.messages.create({
      model: LEVEL2_MODEL,
      max_tokens: 1024,
      temperature: 0.4,
      system: "You are an essay planning assistant. Create a concise structural outline for the assignment.",
      messages: [{ role: "user", content: planPrompt }],
    }, { signal: AbortSignal.timeout(45_000) });

    outline = outlineMsg.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Step 2: Sample-first essay generation (non-streaming, 75s timeout)
    const writingPrompt = buildLevel2WritingPrompt(opts, outline);
    const essayMsg = await anthropic.messages.create({
      model: LEVEL2_MODEL,
      max_tokens: 4096,
      temperature: 0.6,
      system: "You are ghostwriting an essay as a specific student. Your only goal is to produce writing that is indistinguishable from their own. Study their writing samples carefully — they are your primary guide. Write exactly as they would. Not better. Not worse.",
      messages: [{ role: "user", content: writingPrompt }],
    }, { signal: AbortSignal.timeout(75_000) });

    rawEssay = essayMsg.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");
  } catch (err) {
    const isTimeout = err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
    return NextResponse.json(
      { error: isTimeout
          ? "Generation timed out. Please try again or use a shorter assignment."
          : "Generation failed. Please try again." },
      { status: isTimeout ? 504 : 502 },
    );
  }

  if (!rawEssay) {
    return NextResponse.json(
      { error: "Essay generation returned empty content. Please try again." },
      { status: 502 },
    );
  }

  // Step 3: Forensic audit — compare against student's real samples, fix voice mismatches
  const auditPrompt = buildLevel2AuditPrompt(
    rawEssay,
    opts.fingerprint,
    opts.samples,
    opts.selfAssessment,
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: LEVEL2_MODEL,
          max_tokens: 4096,
          temperature: 0.3,
          system: "You are a writing forensics expert. Your job is to compare a generated essay against a student's real writing samples and determine if it sounds like the same person wrote both. Fix anything that doesn't match.",
          messages: [{ role: "user", content: auditPrompt }],
        }, { signal: AbortSignal.timeout(55_000) });

        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg = err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")
          ? "Refinement timed out. Please try again."
          : "Refinement failed. Please try again.";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── Legacy: DeepSeek-V3 for old profiles without fingerprint ───

function streamLegacy(opts: LegacyGenerateOptions): Response {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Together API key not configured" }, { status: 500 });
  }

  const systemPrompt = buildLegacyLevel1Prompt(opts);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(TOGETHER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: LEVEL1_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Write the essay now." },
            ],
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `API error: ${res.status}` })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        await pipeTogetherStream(res.body, controller, encoder);
      } catch {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Connection failed" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch { /* controller may already be closed by pipeTogetherStream */ }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── Together AI stream helper ───

async function pipeTogetherStream(
  body: ReadableStream<Uint8Array>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        } catch {
          // skip parse errors
        }
      }
    }
  } catch (err) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
  } finally {
    reader.releaseLock();
    controller.close();
  }
}
