import { db } from "./db";

export async function hasLevel2Access(
  userId: string,
  userRole?: string | null
): Promise<boolean> {
  if (userRole === "ADMIN") return true;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { level2PaidAt: true },
  });
  return user?.level2PaidAt != null;
}
