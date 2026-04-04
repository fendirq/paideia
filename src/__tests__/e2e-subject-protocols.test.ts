import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { filterResponseBySubject } from "@/lib/content-filter";
import { stripThinkingTags } from "@/lib/strip-thinking";

// ─── English Protocol E2E ───

describe("English protocol — full pipeline", () => {
  const englishContext = {
    subject: "ENGLISH",
    unitName: "Persuasive Essay Writing",
    teacherName: "Ms. Thompson",
    description: "I don't know how to structure my argument",
    ragChunks: [
      { content: "The student's draft argues that social media harms teen mental health but lacks specific evidence and has a weak thesis statement." },
    ],
    helpType: "essay-feedback",
  };

  const prompt = buildSystemPrompt(englishContext);

  // ─── Prompt structure ───

  it("identifies as Paideia Socratic tutor", () => {
    expect(prompt).toContain("You are Paideia, an AI Socratic tutor");
  });

  it("includes the golden rule", () => {
    expect(prompt).toContain("GOLDEN RULE: ONE STEP AT A TIME");
  });

  it("includes accuracy guardrail", () => {
    expect(prompt).toContain("Accuracy & Grounding");
    expect(prompt).toContain("NEVER invent quotes");
  });

  it("uses writing-focused formatting (no LaTeX)", () => {
    expect(prompt).toContain("Writing & Analysis Formatting");
    expect(prompt).toContain("Do NOT use LaTeX");
    expect(prompt).not.toContain("$x^2$");
    expect(prompt).not.toContain("\\frac");
  });

  it("includes thesis-focused Socratic techniques", () => {
    expect(prompt).toContain("thesis");
    expect(prompt).toContain("evidence");
    expect(prompt).toContain("quotation marks");
  });

  it("requires empathy before struggling response", () => {
    expect(prompt).toContain("Start with a warm acknowledgment");
    expect(prompt).toContain("No worries!");
  });

  it("requires grounding in uploaded material", () => {
    expect(prompt).toContain("Reference the student's uploaded text");
  });

  it("uses revision choices for actions (not math multiple choice)", () => {
    expect(prompt).toContain("REVISION CHOICES");
    expect(prompt).toContain("strengthens the current approach");
    expect(prompt).not.toContain("MULTIPLE CHOICE ANSWERS");
  });

  it("includes the student's context", () => {
    expect(prompt).toContain("Subject: ENGLISH");
    expect(prompt).toContain("Persuasive Essay Writing");
    expect(prompt).toContain("Ms. Thompson");
    expect(prompt).toContain("essay-feedback");
  });

  it("includes RAG excerpts", () => {
    expect(prompt).toContain("weak thesis statement");
    expect(prompt).toContain("[Excerpt 1]");
  });

  it("includes ACTIONS section", () => {
    expect(prompt).toContain("---ACTIONS---");
    expect(prompt).toContain("PLAIN TEXT only");
  });

  // ─── Content filter ───

  it("strips LaTeX from English AI responses", () => {
    const aiResponse = "Your thesis $T$ needs a **because clause**. Consider: $$\\text{claim} + \\text{reason}$$";
    const filtered = filterResponseBySubject(aiResponse, "ENGLISH");
    expect(filtered).not.toContain("$T$");
    expect(filtered).not.toContain("$$");
    expect(filtered).toContain("**because clause**"); // preserves markdown
  });

  it("preserves markdown bold/italic in English responses", () => {
    const aiResponse = "**Great start!** Your argument about *social media* is compelling.";
    const filtered = filterResponseBySubject(aiResponse, "ENGLISH");
    expect(filtered).toContain("**Great start!**");
    expect(filtered).toContain("*social media*");
  });

  // ─── Struggling response pattern ───

  it("writing struggling example shows empathy opener", () => {
    expect(prompt).toContain("That's totally okay");
  });

  it("writing struggling example shows concrete example", () => {
    expect(prompt).toContain("specific position");
    expect(prompt).toContain("because clause");
  });
});

// ─── History Protocol E2E ───

describe("History protocol — full pipeline", () => {
  const historyContext = {
    subject: "HISTORY",
    unitName: "The Abbasid Empire",
    teacherName: "Ms. Pederson",
    description: "I don't understand why the Abbasids overthrew the Umayyads",
    ragChunks: [
      { content: "The Abbasid Revolution of 750 CE was driven by discontent with Umayyad dynastic rule and a desire to return to the principles of the early caliphs." },
    ],
    helpType: "source-analysis",
  };

  const prompt = buildSystemPrompt(historyContext);

  // ─── Prompt structure ───

  it("identifies as Paideia Socratic tutor", () => {
    expect(prompt).toContain("You are Paideia, an AI Socratic tutor");
  });

  it("includes the golden rule", () => {
    expect(prompt).toContain("GOLDEN RULE: ONE STEP AT A TIME");
  });

  it("includes accuracy guardrail", () => {
    expect(prompt).toContain("NEVER invent quotes, dates, statistics");
  });

  it("uses history-focused formatting (no LaTeX)", () => {
    expect(prompt).toContain("History & Source Analysis Formatting");
    expect(prompt).toContain("Do NOT use LaTeX");
    expect(prompt).not.toContain("$x^2$");
  });

  it("includes cause-and-effect chain techniques", () => {
    expect(prompt).toContain("cause-and-effect chains");
    expect(prompt).toContain("Event A → Consequence B → Result C");
  });

  it("includes primary source analysis techniques", () => {
    expect(prompt).toContain("primary sources");
    expect(prompt).toContain("quotation marks");
  });

  it("requires empathy before struggling response", () => {
    expect(prompt).toContain("Start with a warm acknowledgment");
    expect(prompt).toContain("No worries!");
  });

  it("requires grounding in uploaded material for struggling responses", () => {
    expect(prompt).toContain("Reference the student's uploaded material");
  });

  it("uses interpretation choices for actions (not math MCQ)", () => {
    expect(prompt).toContain("INTERPRETATION CHOICES");
    expect(prompt).toContain("common misconceptions");
    expect(prompt).not.toContain("sign errors, forgot a step");
  });

  it("includes student's context", () => {
    expect(prompt).toContain("Subject: HISTORY");
    expect(prompt).toContain("The Abbasid Empire");
    expect(prompt).toContain("Ms. Pederson");
    expect(prompt).toContain("source-analysis");
  });

  it("includes RAG excerpts from uploaded material", () => {
    expect(prompt).toContain("Abbasid Revolution of 750 CE");
    expect(prompt).toContain("[Excerpt 1]");
  });

  it("includes ACTIONS section", () => {
    expect(prompt).toContain("---ACTIONS---");
    expect(prompt).toContain("PLAIN TEXT only");
  });

  // ─── Content filter ───

  it("strips LaTeX from History AI responses", () => {
    const aiResponse = "In $750$ CE, the revolution began. The chain: Umayyad corruption → $\\text{revolt}$ → new dynasty";
    const filtered = filterResponseBySubject(aiResponse, "HISTORY");
    expect(filtered).toContain("750");
    expect(filtered).not.toContain("$750$");
    expect(filtered).not.toContain("\\text");
  });

  it("preserves arrow notation in History responses", () => {
    const aiResponse = "War guilt → reparations → **economic collapse** → extremism";
    const filtered = filterResponseBySubject(aiResponse, "HISTORY");
    expect(filtered).toContain("→");
    expect(filtered).toContain("**economic collapse**");
  });

  // ─── History struggling response pattern ───

  it("history struggling example shows empathy + analogy pattern", () => {
    expect(prompt).toContain("No worries — let me connect this");
    expect(prompt).toContain("Imagine you lose a fight");
  });

  it("history struggling example uses arrow notation for causal chains", () => {
    expect(prompt).toContain("War guilt clause → massive reparations → **economic collapse**");
  });
});

// ─── Think-tag stripping E2E ───

describe("Think-tag stripping — R1 edge cases", () => {
  it("strips complete think blocks", () => {
    const text = "<think>reasoning here</think>The answer is clear.";
    expect(stripThinkingTags(text)).toBe("The answer is clear.");
  });

  it("strips unclosed think blocks (model still thinking)", () => {
    const text = "<think>still reasoning about this";
    expect(stripThinkingTags(text)).toBe("");
  });

  it("capitalizes sentence fragments after think-tag stripping", () => {
    // R1 starts sentence inside think, finishes outside
    const text = "<think>Let </think>me connect this to something concrete.";
    expect(stripThinkingTags(text)).toBe("Me connect this to something concrete.");
  });

  it("does NOT capitalize valid lowercase starters", () => {
    const text = "<think>reasoning</think>the Treaty of Versailles was harsh.";
    expect(stripThinkingTags(text)).toBe("the Treaty of Versailles was harsh.");
  });

  it("handles multiple think blocks", () => {
    const text = "<think>first</think>Hello <think>second</think>world";
    expect(stripThinkingTags(text)).toBe("Hello world");
  });

  it("handles no think tags", () => {
    const text = "Just a normal response.";
    expect(stripThinkingTags(text)).toBe("Just a normal response.");
  });
});

// ─── Cross-subject guardrail checks ───

describe("Cross-subject guardrails", () => {
  const subjects = ["MATHEMATICS", "SCIENCE", "ENGLISH", "HISTORY", "HUMANITIES"];

  for (const subject of subjects) {
    it(`${subject} prompt includes accuracy guardrail`, () => {
      const prompt = buildSystemPrompt({
        subject,
        unitName: "Test",
        teacherName: "Test",
        description: "Test",
        ragChunks: [],
        helpType: null,
      });
      expect(prompt).toContain("Accuracy & Grounding");
      expect(prompt).toContain("NEVER invent quotes");
    });

    it(`${subject} prompt requires empathy in struggling responses`, () => {
      const prompt = buildSystemPrompt({
        subject,
        unitName: "Test",
        teacherName: "Test",
        description: "Test",
        ragChunks: [],
        helpType: null,
      });
      expect(prompt).toContain("warm acknowledgment");
    });
  }

  it("Math/Science still use LaTeX, others don't", () => {
    for (const subject of ["MATHEMATICS", "SCIENCE"]) {
      const prompt = buildSystemPrompt({
        subject, unitName: "T", teacherName: "T", description: "T", ragChunks: [], helpType: null,
      });
      expect(prompt).toContain("LaTeX");
    }
    for (const subject of ["ENGLISH", "HISTORY", "HUMANITIES"]) {
      const prompt = buildSystemPrompt({
        subject, unitName: "T", teacherName: "T", description: "T", ragChunks: [], helpType: null,
      });
      expect(prompt).toContain("Do NOT use LaTeX");
    }
  });

  it("content filter preserves LaTeX for STEM, strips for others", () => {
    const latex = "The formula is $E = mc^2$ and $$F = ma$$";
    expect(filterResponseBySubject(latex, "MATHEMATICS")).toContain("$E = mc^2$");
    expect(filterResponseBySubject(latex, "SCIENCE")).toContain("$E = mc^2$");
    expect(filterResponseBySubject(latex, "ENGLISH")).not.toContain("$E = mc^2$");
    expect(filterResponseBySubject(latex, "HISTORY")).not.toContain("$$F = ma$$");
    expect(filterResponseBySubject(latex, "HUMANITIES")).not.toContain("$");
  });
});
