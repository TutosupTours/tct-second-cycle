"use client";

import Link from "next/link";

export default function DashboardShell({
  children,
  roleLabel,
  userName,
  topColor,
  accentColor,
  lightAccent,
  avatarUrl,
  navItems,
}: any) {
  return (
    <div className="min-h-screen flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">{roleLabel}</h2>

          <nav className="flex flex-col gap-2">
            {navItems.map((item: any) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-3 rounded-xl hover:bg-[#f3eee7] transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10">
          <p className="text-sm text-[#7c736a]">Connecté :</p>
          <p className="font-semibold">{userName}</p>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

/* BLOCS */

export function DashboardTitle({ title, subtitle }: any) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-[#7c736a]">{subtitle}</p>
    </div>
  );
}

export function Panel({ title, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-sm text-[#7c736a]">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-[#a69c92]">{subtitle}</p>
    </div>
  );
}

export function MiniAction({ href, label }: any) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-4 text-center hover:shadow transition"
    >
      {label}
    </Link>
  );
}