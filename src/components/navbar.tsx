"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { TripleClickWrapper } from "./portal/TripleClickWrapper";

const navItems = [
  { href: "/app", label: "Home" },
  { href: "/app/analytics", label: "Analytics" },
];

interface NavbarProps {
  userName?: string;
  userImage?: string;
  userRole?: string | null;
}

export function Navbar({ userName, userImage, userRole }: NavbarProps) {
  const pathname = usePathname();
  const isSessionPage = /^\/app\/sessions\/[^/]+$/.test(pathname);
  const isPortal = pathname.startsWith("/portal");
  const logoHref = isPortal ? "/portal/home" : "/app";
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleSignOut = useCallback(() => {
    // Clear portal cookie before signing out (prevents stale access on shared devices)
    document.cookie = "portal_access=; Path=/; Max-Age=0";
    signOut({ callbackUrl: "/" });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNavOpen(false);
  }, [pathname]);

  const initial = userName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 h-14 ${isSessionPage ? "bg-bg-inner" : "bg-transparent"}`}
    >
      {/* Left: Logo */}
      <TripleClickWrapper>
        <Link
          href={logoHref}
          className="font-display font-bold text-2xl tracking-[0.12em] text-text-primary"
        >
          PAIDEIA
        </Link>
      </TripleClickWrapper>

      {/* Right: Desktop */}
      <div className="hidden md:flex items-center" ref={navRef}>
        {navOpen ? (
          /* Expanded nav capsule */
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 p-1 animate-in fade-in duration-200">
            {navItems.map((item) => {
              const isActive =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-black"
                      : "text-black/70 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Avatar */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-medium text-text-secondary hover:text-text-primary transition-colors overflow-hidden"
              >
                {userImage ? (
                  <Image src={userImage} alt="" width={28} height={28} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-bg-surface border border-white/[0.06] rounded-xl shadow-xl py-2">
                  <p className="px-4 py-1 text-sm text-text-secondary truncate">
                    {userName ?? "User"}
                  </p>
                  <hr className="my-1 border-white/[0.04]" />
                  {userRole === "ADMIN" && (
                    <Link
                      href="/app/admin"
                      className="block px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated/50 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated/50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => setNavOpen(false)}
              className="px-2 py-1.5 rounded-full text-black/50 hover:text-black transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* Collapsed: hamburger icon */
          <button
            onClick={() => setNavOpen(true)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-black/70 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Right: Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
      >
        {mobileOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-bg-surface border-b border-white/[0.06] shadow-xl">
          <div className="px-6 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-text-primary"
                      : "text-text-muted hover:text-text-secondary hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <hr className="border-white/[0.04]" />
            {userRole === "ADMIN" && (
              <Link
                href="/app/admin"
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-secondary hover:bg-white/[0.04] transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-text-secondary">{userName ?? "User"}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
