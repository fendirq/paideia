"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { href: "/app", label: "Home" },
  { href: "/app/sessions", label: "Sessions" },
  { href: "/app/analytics", label: "Analytics" },
];

interface NavbarProps {
  userName?: string;
  userImage?: string;
}

export function Navbar({ userName, userImage }: NavbarProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/app";
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = userName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-colors ${
        isHomepage
          ? "bg-transparent"
          : "bg-[#1d1c19] border-b border-white/[0.06]"
      }`}
    >
      {/* Left: Logo */}
      <Link
        href="/app"
        className="font-display font-bold text-base tracking-[0.1em] text-text-primary"
      >
        PAIDEIA
      </Link>

      {/* Right: Start Chat + Nav Capsule */}
      <div className="flex items-center gap-3">
        {/* Start Chat button */}
        <Link
          href="/app/upload"
          className="bg-accent border-2 border-accent-light rounded-full px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(74,157,91,0.3)] hover:bg-accent-light transition-colors"
        >
          Start Chat
        </Link>

        {/* Nav capsule */}
        <div className="flex items-center gap-1 bg-bg-base/40 backdrop-blur-xl rounded-full border border-white/[0.06] p-1">
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
                    ? "bg-white/[0.08] text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Search */}
          <Link
            href="/app/search"
            className="px-3 py-1.5 rounded-full text-text-muted hover:text-text-secondary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Link>

          {/* Avatar */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-medium text-text-secondary hover:text-text-primary transition-colors overflow-hidden"
            >
              {userImage ? (
                <img src={userImage} alt="" className="w-full h-full object-cover" />
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
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated/50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
