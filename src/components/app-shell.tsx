"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/app", label: "Home", icon: "home" },
  { href: "/app/upload", label: "Upload", icon: "upload" },
  { href: "/app/library", label: "Library", icon: "library" },
  { href: "/app/sessions", label: "Sessions", icon: "chat" },
];

function NavIcon({ icon }: { icon: string }) {
  const cls = "w-5 h-5";
  switch (icon) {
    case "home":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "upload":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      );
    case "library":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "chat":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      );
    default:
      return null;
  }
}

interface RecentSession {
  id: string;
  unitName: string;
  teacherName: string;
  status: string;
}

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: string | null;
  recentSessions?: RecentSession[];
}

export function AppShell({
  children,
  userName,
  userRole,
  recentSessions = [],
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessions, setSessions] = useState(recentSessions);
  useEffect(() => { setSessions(recentSessions); }, [recentSessions]);
  const currentSessionId = pathname.startsWith("/app/sessions/")
    ? pathname.split("/app/sessions/")[1]?.split("/")[0]
    : null;

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(false);
    try {
      const res = await fetch(`/api/sessions/${deleteTarget}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== deleteTarget));
        if (currentSessionId === deleteTarget) {
          router.push("/app");
        }
        setDeleteTarget(null);
      } else {
        setDeleteError(true);
      }
    } catch {
      setDeleteError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-bg-surface border border-bg-elevated rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
              Delete session?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              This will permanently delete this tutoring session and all its
              messages. This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-400 mb-3">
                Failed to delete. Please try again.
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(false); }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-bg-elevated rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-accent hover:bg-accent-light text-bg-base rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <aside className="w-64 bg-bg-surface border-r border-bg-elevated flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-display font-bold text-text-primary">
            Paideia
          </h2>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <div className="mt-6 flex-1 overflow-y-auto px-3">
            <p className="px-3 text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Recents
            </p>
            <div className="space-y-0.5">
              {sessions.map((s) => {
                const isActive = currentSessionId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`group relative rounded-lg transition-colors ${
                      isActive
                        ? "bg-bg-elevated"
                        : "hover:bg-bg-elevated/50"
                    }`}
                  >
                    <Link
                      href={`/app/sessions/${s.id}`}
                      className="block px-3 py-2 pr-8"
                    >
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-text-primary" : "text-text-secondary"
                        }`}
                      >
                        {s.unitName}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {s.teacherName}
                      </p>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTarget(s.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-text-muted hover:text-text-primary transition-all p-1"
                      aria-label="Delete session"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-bg-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary truncate">
                {userName ?? "Guest"}
              </p>
              <p className="text-xs text-text-muted">
                {userRole === "ADMIN"
                  ? "Admin"
                  : userRole === "TEACHER"
                    ? "Teacher"
                    : userRole === "STUDENT"
                      ? "Student"
                      : ""}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-text-muted hover:text-text-primary transition-colors"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  );
}
