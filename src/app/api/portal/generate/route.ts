import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildLevel1Prompt,
  buildLevel2OutlinePrompt,
  buildLevel2GenerationPrompt,
  buildLegacyLevel1Prompt,
} from "@/lib/essay-generator";
import type {
  StyleFingerprint,
  TeacherProfile,
  SelfAssessment,
  GenerateOptions,
  LegacyGenerateOptions,
} from "@/lib/essay-generator";

export const maxDuration = 120;

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const LEVEL1_MODEL = "deepseek-ai/DeepSeek-V3";
const LEVEL2_MODEL = "claude-sonnet-4-20250514";

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
  if (typeof wordCount !== "number" || wordCount < 100 || wordCount > 5000) {
    return NextResponse.json({ error: "Word count must be between 100 and 5000" }, { status: 400 });
  }
  if (level !== 1 && level !== 2) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (assignment.length > 5000 || (requirements && requirements.length > 5000)) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const userId = session.user.id;

  const [profile, samples] = await Promise.all([
    db.writingProfile.findUnique({ where: { userId } }),
    db.writingSample.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  if (!profile || !samples.length) {
    return NextResponse.json({ error: "Complete your writing profile first" }, { status: 400 });
  }

  const sampleData = samples.map((s) => ({ label: s.label, content: s.content }));
  const fingerprint = profile.styleFingerprint as StyleFingerprint | null;

  if (fingerprint) {
    const tp = profile.teacherProfile as unknown as TeacherProfile;
    const sa = profile.selfAssessment as unknown as SelfAssessment;

    const opts: GenerateOptions = {
      teacherProfile: tp,
      selfAssessment: sa,
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
    // Legacy fallback — old profile shape, no fingerprint
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

  // Step 1: Generate outline (non-streaming)
  const outlinePrompt = buildLevel2OutlinePrompt(opts);
  const outlineMsg = await anthropic.messages.create({
    model: LEVEL2_MODEL,
    max_tokens: 1024,
    temperature: 0.4,
    system: "You are an essay planning assistant. Create structured outlines that match a student's writing patterns.",
    messages: [{ role: "user", content: outlinePrompt }],
  });

  const outline = outlineMsg.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  // Step 2: Generate essay from outline (streaming)
  const generationPrompt = buildLevel2GenerationPrompt(opts, outline);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: LEVEL2_MODEL,
          max_tokens: 4096,
          temperature: 0.5,
          system: generationPrompt,
          messages: [{ role: "user", content: "Write the essay now, following the outline." }],
        });

        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
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
