import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, materialId } = await params;

  // Verify teacher owns the class (ADMIN can access any class)
  const classWhere = session.user.role === "ADMIN" ? { id } : { id, teacherId: session.user.id };
  const cls = await db.class.findUnique({
    where: classWhere,
    select: { id: true },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const material = await db.classMaterial.findUnique({
    where: { id: materialId, classId: id },
  });

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  await db.classMaterial.delete({ where: { id: materialId } });

  return NextResponse.json({ success: true });
}
