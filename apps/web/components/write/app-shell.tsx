import type { ReactNode } from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { DriveSidebar } from "./drive-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-svh bg-background text-foreground">
      <DriveSidebar />
      <SidebarInset className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1 rounded-none" />
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
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
