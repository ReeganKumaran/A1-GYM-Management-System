"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/bills", label: "Bills" },
  { href: "/packages", label: "Packages" },
  { href: "/notifications", label: "Notifications" },
  { href: "/reports", label: "Reports" },
  { href: "/supplements", label: "Supplements" },
  { href: "/diet", label: "Diet" },
];

const memberLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/bills", label: "Bills" },
  { href: "/notifications", label: "Notifications" },
];

const userLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/details", label: "Details" },
  { href: "/search", label: "Search" },
];

function getLinksForRole(role?: string) {
  switch (role) {
    case "admin":
      return adminLinks;
    case "member":
      return memberLinks;
    default:
      return userLinks;
  }
}

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const links = getLinksForRole(role);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-orange-500 tracking-tight">
              A1 GYM
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-4">
            {session?.user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  {session.user.name}
                </span>
                {role && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {role.toUpperCase()}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-800">
              {session?.user && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="text-sm text-gray-300">
                    {session.user.name}
                  </span>
                  {role && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {role.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full mt-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
