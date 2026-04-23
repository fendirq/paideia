import { WritingEditor } from "@/components/editor/editor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId: _ } = await params;
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Document</p>
          <h1 className="text-3xl font-semibold tracking-tight">Untitled</h1>
        </div>
      </header>
      <WritingEditor />
    </div>
  );
}
