"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  UserCircleIcon,
  QuillWrite02Icon,
  FileEditIcon,
} from "@hugeicons/core-free-icons";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

type NavItem = {
  label: string;
  href: string;
  icon: typeof BookOpen01Icon;
};

const navItems: NavItem[] = [
  { label: "Drive", href: "/write", icon: BookOpen01Icon },
  { label: "Profile", href: "/write/profile", icon: UserCircleIcon },
];

function isActiveHref(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/write") {
    return pathname === "/write";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DriveSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Link
          href="/write"
          className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-8 items-center justify-center border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
            <HugeiconsIcon icon={QuillWrite02Icon} strokeWidth={2} size={16} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Paideia
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/60">
              Writing Portal
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActiveHref(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={
                        <Link href={item.href}>
                          <HugeiconsIcon icon={item.icon} strokeWidth={1.8} />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
            Recent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div
              data-slot="recent-empty"
              className="mx-2 mt-1 flex flex-col items-start gap-1 border border-dashed border-sidebar-border bg-sidebar-accent/30 px-3 py-3 text-sidebar-foreground/70"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/60">
                <HugeiconsIcon icon={FileEditIcon} strokeWidth={1.8} size={12} />
                No documents yet
              </span>
              <span className="text-[11px] leading-snug text-sidebar-foreground/55">
                Recently opened drafts appear here once you start writing.
              </span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8 rounded-none border border-sidebar-border",
              },
            }}
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-xs font-medium text-sidebar-foreground">
              Signed in
            </span>
            <span className="truncate text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/55">
              Student workspace
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
