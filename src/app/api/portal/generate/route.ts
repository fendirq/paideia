import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildLevel1Prompt,
  buildLevel2StyleAnalysisPrompt,
  buildLevel2GenerationPrompt,
} from "@/lib/essay-generator";

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const LEVEL1_MODEL = "deepseek-ai/DeepSeek-V3";
const LEVEL2_ANALYSIS_MODEL = "deepseek-ai/DeepSeek-R1";
const LEVEL2_GENERATION_MODEL = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8";

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
  if (assignment.length > 5000 || (requirements && requirements.length > 1000)) {
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

  const profileData = {
    teacherProfile: profile.teacherProfile as Record<string, unknown>,
    selfAssessment: profile.selfAssessment as Record<string, unknown>,
    writingStyle: profile.writingStyle as Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const sampleData = samples.map((s) => ({ label: s.label, content: s.content }));

  const opts = { profile: profileData, samples: sampleData, assignment, wordCount, requirements };

  if (level === 1) {
    return streamLevel1(opts);
  } else {
    return await streamLevel2(opts);
  }
}

function streamLevel1(opts: Parameters<typeof buildLevel1Prompt>[0]): Response {
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
            temperature: 0.8,
          }),
        });

        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `API error: ${res.status}` })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        await pipeStream(res.body, controller, encoder);
      } catch {
        // pipeStream closes controller in its finally block
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

async function streamLevel2(opts: Parameters<typeof buildLevel1Prompt>[0]): Promise<Response> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Together API key not configured" }, { status: 500 });
  }

  // Step 1: Get style fingerprint (non-streaming)
  const analysisPrompt = buildLevel2StyleAnalysisPrompt(opts.samples);
  const analysisRes = await fetch(TOGETHER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LEVEL2_ANALYSIS_MODEL,
      messages: [
        { role: "system", content: "You are a writing style analyst. Return only JSON." },
        { role: "user", content: analysisPrompt },
      ],
      stream: false,
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!analysisRes.ok) {
    return NextResponse.json({ error: `Style analysis failed: ${analysisRes.status}` }, { status: 500 });
  }

  const analysisData = await analysisRes.json();
  const fingerprint = analysisData.choices?.[0]?.message?.content ?? "{}";

  // Step 2: Generate essay using fingerprint (streaming)
  const generationPrompt = buildLevel2GenerationPrompt(opts, fingerprint);

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
            model: LEVEL2_GENERATION_MODEL,
            messages: [
              { role: "system", content: generationPrompt },
              { role: "user", content: "Write the essay now." },
            ],
            stream: true,
            max_tokens: 4096,
            temperature: 0.8,
          }),
        });

        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `API error: ${res.status}` })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        await pipeStream(res.body, controller, encoder);
      } catch {
        // pipeStream closes controller in its finally block
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

async function pipeStream(
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
