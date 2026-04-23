import { DriveView } from "@/components/write/drive-view";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  return <DriveView folderId={folderId as Id<"folders">} />;
}
