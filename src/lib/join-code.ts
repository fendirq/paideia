import { randomBytes } from "crypto";
import { db } from "./db";

export async function generateJoinCode(): Promise<string> {
  // Generate batch of candidates and check all at once to minimize round-trips
  const candidates = Array.from({ length: 10 }, () =>
    randomBytes(3).toString("hex").toUpperCase()
  );
  const taken = await db.class.findMany({
    where: { joinCode: { in: candidates } },
    select: { joinCode: true },
  });
  const takenSet = new Set(taken.map((t) => t.joinCode));
  const available = candidates.find((c) => !takenSet.has(c));
  if (available) return available;

  // Fallback to longer codes
  const fallback = Array.from({ length: 5 }, () =>
    randomBytes(4).toString("hex").toUpperCase()
  );
  const taken2 = await db.class.findMany({
    where: { joinCode: { in: fallback } },
    select: { joinCode: true },
  });
  const takenSet2 = new Set(taken2.map((t) => t.joinCode));
  const available2 = fallback.find((c) => !takenSet2.has(c));
  if (available2) return available2;

  throw new Error("Failed to generate unique join code");
}
