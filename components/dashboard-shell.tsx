"use client";

import React from "react";
import Link from "next/link";
import { LogOut, LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type DashboardShellProps = {
  roleLabel: string;
  userName: string;
  topColor: string;
  accentColor: string;
  lightAccent: string;
  avatarUrl?: string | null;
  navItems: NavItem[];
  activePath: string;
  children: React.ReactNode;
};

export default function DashboardShell({
  roleLabel,
  userName,
  topColor,
  accentColor,
  lightAccent,
  avatarUrl,
  navItems,
  activePath,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#fbf1df] text-[#2c2f4a]">
      <div className="mx-auto min-h-screen max-w-[1600px] overflow-hidden bg-[#fbf7f0] shadow-[0_16px_40px_rgba(0,0,0,0.08)] md:rounded-[26px]">
        <header
          className="flex items-center justify-between px-6 py-4 text-white"
          style={{ backgroundColor: topColor }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/15 font-semibold">
              {roleLabel.slice(0, 1)}
            </div>
            <p className="text-lg font-semibold">{roleLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-sm md:block">Bonjour, {userName}</p>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/60 bg-white/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-semibold">
                  {userName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="relative border-r border-[#eee3d7] bg-[#fffaf4] px-4 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activePath === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition"
                    style={{
                      backgroundColor: active ? lightAccent : "transparent",
                      color: active ? topColor : "#2c2f4a",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              <a
                href="/logout"
                className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#c65a50] hover:bg-[#f8e7e4]"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </a>
            </nav>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 overflow-hidden">
              <div
                className="absolute bottom-0 left-[-15%] h-20 w-[75%] rounded-t-full opacity-25"
                style={{ backgroundColor: topColor }}
              />
              <div
                className="absolute bottom-0 right-[-10%] h-16 w-[70%] rounded-t-full opacity-20"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </aside>

          <section className="relative bg-[#fbf7f0] px-6 py-7 md:px-8">
            {children}

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 overflow-hidden">
              <div
                className="absolute bottom-0 left-[-5%] h-16 w-[45%] rounded-t-full opacity-18"
                style={{ backgroundColor: accentColor }}
              />
              <div
                className="absolute bottom-0 left-[25%] h-20 w-[40%] rounded-t-full opacity-12"
                style={{ backgroundColor: topColor }}
              />
              <div
                className="absolute bottom-0 right-[-5%] h-14 w-[38%] rounded-t-full opacity-18"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function DashboardTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="mb-5">
      <h1 className="text-[32px] font-bold text-[#2c2f4a]">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-[#81786f]">{subtitle}</p> : null}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#eee3d7] bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[#958a80]">{title}</p>
      <p className="mt-2 text-[36px] font-bold leading-none text-[#2c2f4a]">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-[#8b8177]">{subtitle}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  rightText,
  children,
}: {
  title: string;
  rightText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#eee3d7] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#2c2f4a]">{title}</h2>
        {rightText ? <span className="text-xs text-[#9a8f85]">{rightText}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function MiniAction({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="block rounded-2xl border border-[#eadccf] bg-white px-4 py-3 text-sm font-medium text-[#2c2f4a] transition hover:bg-[#fffaf5]"
    >
      {label}
    </a>
  );
}