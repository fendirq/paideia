"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FolderAddIcon,
  FileAddIcon,
  FolderIcon,
  FileEditIcon,
  ArrowLeft01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DriveViewProps = {
  folderId?: Id<"folders"> | null;
};

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DriveView({ folderId = null }: DriveViewProps) {
  const parentFolderId = folderId ?? null;

  const folders = useQuery(api.drive.listFolders, {
    parentFolderId,
  });
  const documents = useQuery(api.documents.listDocuments, {
    folderId: parentFolderId,
  });

  const createFolder = useMutation(api.drive.createFolder);
  const createDocument = useMutation(api.documents.createDocument);

  const [isFolderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [isDocOpen, setDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [creatingDoc, setCreatingDoc] = useState(false);

  const isLoading = folders === undefined || documents === undefined;

  const title = useMemo(() => {
    if (!folderId) return "My Drive";
    return "Folder";
  }, [folderId]);

  const counts = useMemo(() => {
    return {
      folders: folders?.length ?? 0,
      documents: documents?.length ?? 0,
    };
  }, [folders, documents]);

  async function onCreateFolder() {
    const trimmed = folderName.trim();
    if (!trimmed) return;
    setCreatingFolder(true);
    try {
      await createFolder({ parentFolderId, name: trimmed });
      setFolderName("");
      setFolderOpen(false);
    } finally {
      setCreatingFolder(false);
    }
  }

  async function onCreateDocument() {
    const trimmed = docTitle.trim();
    if (!trimmed) return;
    setCreatingDoc(true);
    try {
      await createDocument({ folderId: parentFolderId, title: trimmed });
      setDocTitle("");
      setDocOpen(false);
    } finally {
      setCreatingDoc(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 font-sans">
      <header className="flex flex-col gap-4">
        {folderId ? (
          <Link
            href="/write"
            className="inline-flex w-fit items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} size={12} />
            Back to drive
          </Link>
        ) : (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Writing portal
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading your drive…"
                : `${counts.folders} ${counts.folders === 1 ? "folder" : "folders"} · ${counts.documents} ${counts.documents === 1 ? "document" : "documents"}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NewFolderDialog
              open={isFolderOpen}
              onOpenChange={setFolderOpen}
              name={folderName}
              onNameChange={setFolderName}
              onCreate={onCreateFolder}
              isCreating={creatingFolder}
              triggerLabel="New folder"
              triggerVariant="outline"
            />
            <NewDocumentDialog
              open={isDocOpen}
              onOpenChange={setDocOpen}
              title={docTitle}
              onTitleChange={setDocTitle}
              onCreate={onCreateDocument}
              isCreating={creatingDoc}
              triggerLabel="New document"
              triggerVariant="default"
            />
          </div>
        </div>
      </header>

      <FoldersSection
        folders={folders}
        isLoading={isLoading}
        onCreateClick={() => setFolderOpen(true)}
      />

      <DocumentsSection
        documents={documents}
        isLoading={isLoading}
        onCreateClick={() => setDocOpen(true)}
      />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  count,
}: {
  eyebrow: string;
  count: number | undefined;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {eyebrow}
      </p>
      {typeof count === "number" ? (
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          {count}
        </span>
      ) : (
        <HugeiconsIcon
          icon={Loading03Icon}
          strokeWidth={1.8}
          size={12}
          className="animate-spin text-muted-foreground/70"
        />
      )}
    </div>
  );
}

function FoldersSection({
  folders,
  isLoading,
  onCreateClick,
}: {
  folders: Doc<"folders">[] | undefined;
  isLoading: boolean;
  onCreateClick: () => void;
}) {
  const isEmpty = !isLoading && folders && folders.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader eyebrow="Folders" count={folders?.length} />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-28 animate-pulse bg-card/40" />
          ))}
        </div>
      ) : isEmpty ? (
        <Card className="border-dashed bg-card/50 ring-foreground/5">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex size-12 items-center justify-center border border-border bg-background text-muted-foreground">
              <HugeiconsIcon icon={FolderAddIcon} strokeWidth={1.6} size={22} />
            </span>
            <div className="flex max-w-sm flex-col gap-1.5">
              <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
                No folders yet
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Group related drafts into folders to keep longer projects
                organized.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={onCreateClick}
            >
              <HugeiconsIcon icon={FolderAddIcon} strokeWidth={2} />
              New folder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {folders?.map((folder) => (
            <FolderCard key={folder._id} folder={folder} />
          ))}
        </div>
      )}
    </section>
  );
}

function FolderCard({ folder }: { folder: Doc<"folders"> }) {
  return (
    <Link
      href={`/write/folders/${folder._id}`}
      className="group/folder block outline-none"
    >
      <Card className="h-full transition-colors group-hover/folder:bg-muted/40 group-focus-visible/folder:ring-2 group-focus-visible/folder:ring-ring">
        <CardContent className="flex h-full flex-col gap-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-9 items-center justify-center border border-border bg-background text-foreground">
              <HugeiconsIcon icon={FolderIcon} strokeWidth={1.8} size={18} />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Folder
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
              {folder.name}
            </h3>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Created {formatDate(folder._creationTime)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DocumentsSection({
  documents,
  isLoading,
  onCreateClick,
}: {
  documents: Doc<"documents">[] | undefined;
  isLoading: boolean;
  onCreateClick: () => void;
}) {
  const isEmpty = !isLoading && documents && documents.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader eyebrow="Documents" count={documents?.length} />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-36 animate-pulse bg-card/40" />
          ))}
        </div>
      ) : isEmpty ? (
        <Card className="border-dashed bg-card/50 ring-foreground/5">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex size-14 items-center justify-center border border-border bg-background text-muted-foreground">
              <HugeiconsIcon icon={FileAddIcon} strokeWidth={1.6} size={26} />
            </span>
            <div className="flex max-w-sm flex-col gap-1.5">
              <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
                No documents yet
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Start a draft, outline, or rewrite. Everything you write lands
                here with full history.
              </p>
            </div>
            <Button className="gap-2" onClick={onCreateClick}>
              <HugeiconsIcon icon={FileAddIcon} strokeWidth={2} />
              New document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {documents?.map((doc) => <DocumentCard key={doc._id} doc={doc} />)}
        </div>
      )}
    </section>
  );
}

function DocumentCard({ doc }: { doc: Doc<"documents"> }) {
  return (
    <Link
      href={`/write/documents/${doc._id}`}
      className="group/doc block outline-none"
    >
      <Card className="h-full transition-colors group-hover/doc:bg-muted/40 group-focus-visible/doc:ring-2 group-focus-visible/doc:ring-ring">
        <CardContent className="flex h-full flex-col gap-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-9 items-center justify-center border border-border bg-background text-foreground">
              <HugeiconsIcon icon={FileEditIcon} strokeWidth={1.8} size={18} />
            </span>
            <Badge
              variant={doc.status === "archived" ? "outline" : "secondary"}
              className="uppercase tracking-[0.14em]"
            >
              {doc.status}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
              {doc.title || "Untitled document"}
            </h3>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Updated {formatDate(doc._creationTime)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function NewFolderDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  onCreate,
  isCreating,
  triggerLabel,
  triggerVariant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (value: string) => void;
  onCreate: () => void | Promise<void>;
  isCreating: boolean;
  triggerLabel: string;
  triggerVariant: "default" | "outline";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button variant={triggerVariant} size="lg" className="gap-2">
            <HugeiconsIcon icon={FolderAddIcon} strokeWidth={2} />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>
            Group related drafts so your drive stays organized.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void onCreate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-folder-name" className="uppercase tracking-[0.14em] text-muted-foreground">
              Name
            </Label>
            <Input
              id="new-folder-name"
              autoFocus
              placeholder="e.g. Short stories"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? "Creating…" : "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewDocumentDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onCreate,
  isCreating,
  triggerLabel,
  triggerVariant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onCreate: () => void | Promise<void>;
  isCreating: boolean;
  triggerLabel: string;
  triggerVariant: "default" | "outline";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button variant={triggerVariant} size="lg" className="gap-2">
            <HugeiconsIcon icon={FileAddIcon} strokeWidth={2} />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New document</DialogTitle>
          <DialogDescription>
            Title it now — you can rename any time from the editor.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void onCreate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-doc-title" className="uppercase tracking-[0.14em] text-muted-foreground">
              Title
            </Label>
            <Input
              id="new-doc-title"
              autoFocus
              placeholder="e.g. College essay draft"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isCreating || !title.trim()}>
              {isCreating ? "Creating…" : "Create document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
