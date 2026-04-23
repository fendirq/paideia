import { DocumentWorkspace } from "@/components/write/document-workspace";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return <DocumentWorkspace documentId={documentId as Id<"documents">} />;
}
