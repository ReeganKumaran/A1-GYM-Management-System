"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/members", label: "Members", icon: "👥" },
  { href: "/bills", label: "Bills", icon: "💰" },
  { href: "/packages", label: "Packages", icon: "📦" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/supplements", label: "Supplements", icon: "💊" },
  { href: "/diet", label: "Diet", icon: "🥗" },
];

const memberLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/bills", label: "Bills", icon: "💰" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
];

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/details", label: "Details", icon: "📋" },
  { href: "/search", label: "Search", icon: "🔍" },
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

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const links = getLinksForRole(role);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="md:hidden fixed bottom-4 left-4 z-40 p-3 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Toggle sidebar"
      >
        <span className="text-lg">{collapsed ? "☰" : "✕"}</span>
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out w-64 ${
          collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full py-4">
          <nav className="flex-1 px-3 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setCollapsed(true)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom user info */}
          {session?.user && (
            <div className="px-3 pt-4 mt-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {role?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
