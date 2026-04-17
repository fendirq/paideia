import { describe, expect, it } from "vitest";
import {
  JUDGE_THRESHOLDS,
  HEURISTIC_THRESHOLDS,
  meetsFloor,
  meetsTarget,
} from "../../scripts/qa-lib/thresholds";
import {
  checkJudgeScores,
  checkHeuristics,
  mergeResults,
  formatBreach,
} from "../../scripts/qa-lib/threshold-check";

describe("elite thresholds", () => {
  describe("meetsFloor / meetsTarget — higher-is-better", () => {
    it("passes floor when value equals floor", () => {
      expect(meetsFloor(7, { target: 8, floor: 7, direction: "higher" })).toBe(true);
    });

    it("fails floor when value below floor", () => {
      expect(meetsFloor(6.9, { target: 8, floor: 7, direction: "higher" })).toBe(false);
    });

    it("hits target when value equals target", () => {
      expect(meetsTarget(8, { target: 8, floor: 7, direction: "higher" })).toBe(true);
    });

    it("misses target when between floor and target", () => {
      const t = { target: 8, floor: 7, direction: "higher" } as const;
      expect(meetsFloor(7.5, t)).toBe(true);
      expect(meetsTarget(7.5, t)).toBe(false);
    });
  });

  describe("meetsFloor / meetsTarget — lower-is-better", () => {
    it("passes floor when value at or below floor", () => {
      expect(meetsFloor(2, { target: 2, floor: 2, direction: "lower" })).toBe(true);
      expect(meetsFloor(1, { target: 2, floor: 2, direction: "lower" })).toBe(true);
    });

    it("fails floor when value above floor", () => {
      expect(meetsFloor(3, { target: 2, floor: 2, direction: "lower" })).toBe(false);
    });
  });

  describe("checkJudgeScores", () => {
    it("is elite when all scores meet targets", () => {
      const result = checkJudgeScores(
        {
          aiDetectionResistance: 9,
          sampleAccuracy: 8,
          rubricAccuracy: 8,
          evidenceHandling: 8,
          overallWriting: 8,
          voiceNaturalness: 8,
          sourceIntegration: 7,
          academicQuality: 8,
        },
        { sourced: true },
      );
      expect(result.elite).toBe(true);
      expect(result.passed).toBe(true);
      expect(result.floorBreaches).toHaveLength(0);
      expect(result.targetMisses).toHaveLength(0);
    });

    it("passes but is not elite when scores are between floor and target", () => {
      const result = checkJudgeScores(
        {
          aiDetectionResistance: 8,
          sampleAccuracy: 7,
          rubricAccuracy: 7,
          evidenceHandling: 7,
          overallWriting: 7,
          voiceNaturalness: 7,
          sourceIntegration: 6,
          academicQuality: 7,
        },
        { sourced: true },
      );
      expect(result.passed).toBe(true);
      expect(result.elite).toBe(false);
      expect(result.targetMisses.length).toBeGreaterThan(0);
    });

    it("fails when any score breaches its floor", () => {
      const result = checkJudgeScores(
        {
          aiDetectionResistance: 9,
          sampleAccuracy: 8,
          rubricAccuracy: 6,
          evidenceHandling: 8,
          overallWriting: 8,
        },
        { sourced: false },
      );
      expect(result.passed).toBe(false);
      expect(result.elite).toBe(false);
      expect(result.floorBreaches.some((b) => b.metric === "rubricAccuracy")).toBe(true);
    });

    it("skips sourceIntegration when the fixture is unsourced", () => {
      const result = checkJudgeScores(
        {
          aiDetectionResistance: 9,
          sampleAccuracy: 8,
          rubricAccuracy: 8,
          evidenceHandling: 8,
          overallWriting: 8,
        },
        { sourced: false },
      );
      expect(result.skipped).toContain("sourceIntegration");
      expect(result.floorBreaches.find((b) => b.metric === "sourceIntegration")).toBeUndefined();
    });

    it("checks sourceIntegration when the fixture is sourced", () => {
      const result = checkJudgeScores(
        {
          aiDetectionResistance: 9,
          sampleAccuracy: 8,
          rubricAccuracy: 8,
          evidenceHandling: 8,
          overallWriting: 8,
          sourceIntegration: 5,
        },
        { sourced: true },
      );
      expect(result.passed).toBe(false);
      expect(result.floorBreaches.some((b) => b.metric === "sourceIntegration")).toBe(true);
    });

    it("treats missing scores as skipped, not failed (forward compat for judge expansion)", () => {
      const result = checkJudgeScores(
        {
          aiDetectionResistance: 9,
          sampleAccuracy: 8,
          rubricAccuracy: 8,
          evidenceHandling: 8,
          overallWriting: 8,
        },
        { sourced: false },
      );
      expect(result.skipped).toContain("voiceNaturalness");
      expect(result.skipped).toContain("academicQuality");
      expect(result.passed).toBe(true);
    });
  });

  describe("checkHeuristics", () => {
    it("flags a repeated opener run above the floor", () => {
      const result = checkHeuristics(
        {
          heuristicAiResistance: 10,
          heuristicAuthenticity: 10,
          maxRepeatedOpenerRun: 4,
          maxTransitionReuse: 2,
          sentenceStdDev: 9,
        },
        { sourced: false },
      );
      expect(result.passed).toBe(false);
      expect(result.floorBreaches.some((b) => b.metric === "maxRepeatedOpenerRun")).toBe(true);
    });

    it("flags transition reuse above the floor", () => {
      const result = checkHeuristics(
        {
          heuristicAiResistance: 10,
          heuristicAuthenticity: 10,
          maxRepeatedOpenerRun: 2,
          maxTransitionReuse: 4,
          sentenceStdDev: 9,
        },
        { sourced: false },
      );
      expect(result.passed).toBe(false);
      expect(result.floorBreaches.some((b) => b.metric === "maxTransitionReuse")).toBe(true);
    });

    it("passes when all heuristic metrics meet targets", () => {
      const result = checkHeuristics(
        {
          heuristicAiResistance: 10,
          heuristicAuthenticity: 10,
          maxRepeatedOpenerRun: 2,
          maxTransitionReuse: 2,
          sentenceStdDev: 9,
        },
        { sourced: false },
      );
      expect(result.elite).toBe(true);
      expect(result.passed).toBe(true);
    });
  });

  describe("mergeResults", () => {
    it("aggregates floor breaches across multiple check runs", () => {
      const a = checkJudgeScores({ rubricAccuracy: 6 }, { sourced: false });
      const b = checkHeuristics({ maxRepeatedOpenerRun: 5 }, { sourced: false });
      const merged = mergeResults([a, b]);
      expect(merged.passed).toBe(false);
      expect(merged.floorBreaches.length).toBeGreaterThanOrEqual(2);
    });

    it("passes only when every component passes", () => {
      const a = checkJudgeScores(
        { aiDetectionResistance: 9, sampleAccuracy: 8, rubricAccuracy: 8, evidenceHandling: 8, overallWriting: 8 },
        { sourced: false },
      );
      const b = checkHeuristics(
        { heuristicAiResistance: 10, heuristicAuthenticity: 10, maxRepeatedOpenerRun: 2, maxTransitionReuse: 2, sentenceStdDev: 9 },
        { sourced: false },
      );
      const merged = mergeResults([a, b]);
      expect(merged.passed).toBe(true);
    });
  });

  describe("formatBreach", () => {
    it("formats a higher-is-better floor breach readably", () => {
      const msg = formatBreach({
        metric: "overallWriting",
        value: 6,
        threshold: JUDGE_THRESHOLDS.overallWriting,
        severity: "floor",
      });
      expect(msg).toContain("overallWriting");
      expect(msg).toContain("got 6");
      expect(msg).toContain(">= 7");
    });

    it("formats a lower-is-better floor breach readably", () => {
      const msg = formatBreach({
        metric: "maxRepeatedOpenerRun",
        value: 5,
        threshold: HEURISTIC_THRESHOLDS.maxRepeatedOpenerRun,
        severity: "floor",
      });
      expect(msg).toContain("<= 2");
    });
  });
});
