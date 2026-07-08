// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { label: "Users",    href: "/users",    module: "Users"    },
  { label: "Reports",  href: "/reports",  module: "Reports"  },
  { label: "Roles",    href: "/roles",    module: "Roles"    },
  { label: "Settings", href: "/settings", module: "Settings" },
];

export default function Sidebar() {
  const { role, permissions } = useAuthStore();

  const canViewModule = (module: string) => {
    if (role === "super_admin") return true;
    return permissions?.[module]?.view ?? false;
  };

  return (
    <nav className="w-64 bg-slate-800 text-white min-h-screen p-6">
      <ul className="space-y-2">
        {NAV_ITEMS.filter((item) => canViewModule(item.module)).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded px-4 py-2 hover:bg-slate-700"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}