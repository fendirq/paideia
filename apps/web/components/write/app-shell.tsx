"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { canAccessWritingPortal } from "@/lib/portal-access";
import { api } from "../../../../convex/_generated/api";

import { DriveSidebar } from "./drive-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const viewer = useQuery(api.users.viewer);
  const ensureViewer = useMutation(api.users.ensureViewer);
  const didBootstrapRef = useRef(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    if (viewer !== null || didBootstrapRef.current) {
      return;
    }

    didBootstrapRef.current = true;
    void ensureViewer({})
      .catch((error: unknown) => {
        didBootstrapRef.current = false;
        setBootstrapError(
          error instanceof Error ? error.message : "Unable to prepare workspace.",
        );
      });
  }, [ensureViewer, viewer]);

  const isPreparingWorkspace = viewer === undefined || viewer === null;
  const isAllowed = viewer ? canAccessWritingPortal(viewer.capabilities) : false;

  let content = children;

  if (bootstrapError) {
    content = (
      <div className="flex min-h-[calc(100svh-3rem)] items-center justify-center px-6 py-10">
        <div className="flex max-w-md flex-col gap-3 border border-border bg-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Workspace error
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We could not load your writing portal.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {bootstrapError}
          </p>
        </div>
      </div>
    );
  } else if (isPreparingWorkspace) {
    content = (
      <div className="flex min-h-[calc(100svh-3rem)] items-center justify-center px-6 py-10">
        <div className="flex max-w-md flex-col gap-3 border border-dashed border-border bg-card/60 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Preparing workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Setting up your student drive
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;re syncing your student record with Convex so the write
            portal can load the right folders, profile, and documents.
          </p>
        </div>
      </div>
    );
  } else if (!isAllowed) {
    content = (
      <div className="flex min-h-[calc(100svh-3rem)] items-center justify-center px-6 py-10">
        <div className="flex max-w-md flex-col gap-4 border border-border bg-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Student-only portal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            This workspace is only available to students.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your current account does not have the writing portal capability, so
            we&apos;re keeping this surface hidden.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-fit gap-2"
            onClick={() => router.push("/")}
          >
            Return home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="min-h-svh bg-background text-foreground">
      <DriveSidebar />
      <SidebarInset className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger
            aria-label="Toggle sidebar"
            className="-ml-1 rounded-none"
          />
          <Separator orientation="vertical" className="h-5" />
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            <span className="text-muted-foreground/70">Paideia</span>
            <span aria-hidden className="text-muted-foreground/40">
              /
            </span>
            <span className="text-foreground">Write</span>
          </nav>
        </header>
        <div className="flex-1 overflow-auto">{content}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
