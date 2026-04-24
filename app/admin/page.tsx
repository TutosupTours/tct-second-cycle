"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  FileCheck,
  GraduationCap,
  LogOut,
  Stethoscope,
  Users,
  Building2,
  PlusCircle,
} from "lucide-react";

type Staff = {
  login_id: string;
  prenom: string;
  nom: string;
  role: string;
  fonction?: string;
};

const cards = [
  {
    title: "Sessions ECOS",
    description: "Créer et gérer les sessions d’entraînement.",
    icon: CalendarDays,
    color: "#6a8f4f",
    href: "/admin/sessions",
  },
  {
    title: "Étudiants",
    description: "Suivre les comptes étudiants activés.",
    icon: GraduationCap,
    color: "#ef9faa",
    href: "/admin/students",
  },
  {
    title: "Examinateurs",
    description: "Ajouter, inviter et affecter les examinateurs.",
    icon: Stethoscope,
    color: "#efc24d",
    href: "/admin/examiners",
  },
  {
    title: "Faculté",
    description: "Gérer l’accès des encadrants facultaires.",
    icon: Building2,
    color: "#243b63",
    href: "/admin/faculty",
  },
  {
    title: "Stations",
    description: "Créer les stations et scénarios ECOS.",
    icon: ClipboardList,
    color: "#d63b33",
    href: "/admin/stations",
  },
  {
    title: "Grilles",
    description: "Créer les grilles d’évaluation.",
    icon: FileCheck,
    color: "#8eab60",
    href: "/admin/grids",
  },
  {
    title: "Affectations",
    description: "Attribuer étudiants, examinateurs et stations.",
    icon: Users,
    color: "#7d6fb2",
    href: "/admin/assignments",
  },
];

export default function AdminPage() {
  const [staff, setStaff] = useState<Staff | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("staff_session");

    if (!raw) {
      window.location.href = "/login?role=admin";
      return;
    }

    const parsed = JSON.parse(raw);

    if (parsed.role !== "admin") {
      window.location.href = "/";
      return;
    }

    setStaff(parsed);
  }, []);

  if (!staff) return null;

  return (
    <main className="min-h-screen bg-[#f5f0e5] text-[#2f2f2f]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <header className="rounded-[32px] bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6a8f4f]">
                Administration ECOS Tours
              </p>
              <h1 className="mt-2 text-4xl font-bold">
                Bonjour {staff.prenom}
              </h1>
              <p className="mt-2 text-[#6f6a63]">
                Pilotage des sessions, stations, grilles, examinateurs et
                affectations.
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("staff_session");
                window.location.href = "/";
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#cf332b] px-5 py-3 font-semibold text-white"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat title="Sessions" value="0" />
          <Stat title="Étudiants actifs" value="0" />
          <Stat title="Examinateurs" value="0" />
          <Stat title="Stations" value="0" />
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Modules admin</h2>
            <p className="text-sm text-[#6f6a63]">
              Choisis le module à configurer.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="group rounded-[28px] border border-[#eadfd2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md"
                    style={{ backgroundColor: card.color }}
                  >
                    <Icon size={28} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">{card.title}</h3>

                  <p className="mt-2 min-h-[48px] text-sm text-[#6f6a63]">
                    {card.description}
                  </p>

                  <Link
                    href={card.href}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-[#d9cbbb] bg-[#faf7f0] px-4 py-3 text-sm font-semibold text-[#4b463f] transition group-hover:bg-[#6a8f4f] group-hover:text-white"
                  >
                    <PlusCircle size={17} />
                    Ouvrir
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[#7b736a]">{title}</p>
      <p className="mt-2 text-3xl font-bold text-[#2f2f2f]">{value}</p>
    </div>
  );
}