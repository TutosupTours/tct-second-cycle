"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Role = "Admin" | "BR" | "Examinateur" | "Étudiant";

type SessionItem = {
  id: string;
  title: string;
  date: string;
  room: string;
  level: string;
  program: string;
  capacity: number;
};

const ROLE_COLORS: Record<Role, string> = {
  Admin: "#d84f4f",
  BR: "#7c9c56",
  Examinateur: "#e0b63b",
  Étudiant: "#e7a9ae",
};

export default function Home() {
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupLevel, setSignupLevel] = useState("D2");
  const [signupProgram, setSignupProgram] = useState("ESEE");
  const [signupMessage, setSignupMessage] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setSessionsLoading(true);

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("starts_at", { ascending: true });

    if (error) {
      console.error("Erreur chargement sessions:", error);
      setSessions([]);
      setSessionsLoading(false);
      return;
    }

    const mapped: SessionItem[] =
      data?.map((s) => ({
        id: s.id,
        title: s.title,
        date: new Date(s.starts_at).toLocaleString("fr-FR"),
        room: s.location,
        level: s.level,
        program: s.program,
        capacity: s.max_students,
      })) ?? [];

    setSessions(mapped);
    setSessionsLoading(false);
  }

  async function handleSignup() {
    const fullName = signupName.trim();
    const email = signupEmail.trim().toLowerCase();

    if (!fullName || !email) {
      setSignupMessage("Merci de remplir le nom et l’email.");
      return;
    }

    setSignupLoading(true);
    setSignupMessage("");

    const { error } = await supabase.from("student_requests").insert({
      full_name: fullName,
      email,
      level: signupLevel,
      program: signupProgram,
      payment_status: "pending",
    });

    if (error) {
      console.error("Erreur inscription:", error);
      setSignupMessage("Erreur lors de l’envoi de la demande.");
      setSignupLoading(false);
      return;
    }

    setSignupName("");
    setSignupEmail("");
    setSignupLevel("D2");
    setSignupProgram("ESEE");
    setSignupMessage("Demande envoyée avec succès. En attente de validation par le BR.");
    setSignupLoading(false);
  }

  function handleQuickRole(role: Role) {
    if (role === "Admin") window.location.href = "/login?role=admin";
    if (role === "BR") window.location.href = "/login?role=br";
    if (role === "Examinateur") window.location.href = "/login?role=examinateur";
    if (role === "Étudiant") window.location.href = "/login?role=etudiant";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#efe8d7] text-[#2f2f2f]">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <Header />
        <HeroPhoto />

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.92fr] items-start">
          <MissionBlock />

          <section className="rounded-[32px] bg-[#f5f0e5] p-6 md:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7c9c56]">
                <User className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-4xl font-medium text-[#2f2f2f]">Accès plateforme</h2>
            </div>

            <p className="mt-6 text-sm text-[#666]">
              Clique sur ton profil pour accéder à la page de connexion correspondante.
            </p>

            <div className="mt-7 grid grid-cols-4 gap-4">
              {(["Admin", "BR", "Examinateur", "Étudiant"] as Role[]).map((role) => {
                const Icon =
                  role === "Admin"
                    ? ShieldCheck
                    : role === "BR"
                    ? UserCheck
                    : role === "Examinateur"
                    ? User
                    : GraduationCap;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickRole(role)}
                    className="group flex flex-col items-center"
                  >
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full shadow-md transition group-hover:scale-105"
                      style={{ backgroundColor: ROLE_COLORS[role] }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="mt-3 text-center text-lg text-[#444] leading-tight">
                      {role}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 border-t border-[#ddd2c5] pt-8">
              <h3 className="text-2xl font-semibold text-[#2f2f2f]">
                Demande d’inscription étudiant
              </h3>

              <div className="mt-5 space-y-4">
                <Field
                  icon={<User className="h-5 w-5 text-[#9aa18f]" />}
                  placeholder="Nom et prénom"
                  type="text"
                  value={signupName}
                  onChange={setSignupName}
                />
                <Field
                  icon={<User className="h-5 w-5 text-[#9aa18f]" />}
                  placeholder="Email"
                  type="email"
                  value={signupEmail}
                  onChange={setSignupEmail}
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={signupLevel}
                    onChange={(e) => setSignupLevel(e.target.value)}
                    className="rounded-2xl border border-[#d8d2c9] bg-[#f9f6ef] px-4 py-4 text-lg outline-none"
                  >
                    <option value="D2">D2</option>
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                  </select>

                  <select
                    value={signupProgram}
                    onChange={(e) => setSignupProgram(e.target.value)}
                    className="rounded-2xl border border-[#d8d2c9] bg-[#f9f6ef] px-4 py-4 text-lg outline-none"
                  >
                    <option value="ESEE">ESEE</option>
                    <option value="Procedural">Procédural</option>
                  </select>
                </div>
              </div>

              {signupMessage ? (
                <p className="mt-4 text-sm font-medium text-[#5c8945]">{signupMessage}</p>
              ) : null}

              <button
                type="button"
                onClick={handleSignup}
                disabled={signupLoading}
                className="mt-6 w-full rounded-2xl bg-[#d84f4f] px-6 py-4 text-xl font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {signupLoading ? "Envoi..." : "Envoyer ma demande"}
              </button>
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-[32px] bg-white/80 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-[#7c9c56]" />
            <h3 className="text-2xl font-semibold text-[#2f2f2f]">Sessions visibles</h3>
          </div>

          {sessionsLoading ? (
            <p className="text-[#666]">Chargement des sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-[#666]">Aucune session ouverte pour le moment.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-[24px] bg-[#faf7f0] p-5">
                  <p className="text-lg font-semibold">{session.title}</p>
                  <p className="mt-1 text-sm text-[#666]">{session.date}</p>
                  <p className="mt-1 text-sm text-[#666]">{session.room}</p>
                  <p className="mt-3 text-sm text-[#666]">
                    {session.level} · {session.program}
                  </p>
                  <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-sm text-[#666] shadow-sm">
                    {session.capacity} places max
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 pb-6 text-center">
          <p
            className="text-[#7ba15b] text-3xl md:text-4xl italic font-medium"
            style={{ fontFamily: "cursive" }}
          >
            Ensemble, vers la réussite. ❤️
          </p>
        </footer>
      </div>
    </main>
  );
}

function Header() {
  return (
    <section className="text-center">
      <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-white shadow-md md:h-28 md:w-28">
        <img
          src="/logo-tct.png"
          alt="Logo TCT"
          className="h-full w-full object-contain"
        />
      </div>

      <p className="text-[#6f9358] text-xl md:text-2xl tracking-[0.14em] font-semibold uppercase">
        Pôle 2nd cycle
      </p>

      <h1
        className="mt-2 text-[#6f9358] text-5xl md:text-7xl leading-none"
        style={{ fontFamily: "cursive" }}
      >
        Bienvenue
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-2xl md:text-3xl font-medium text-[#3b3b3b]">
        Plateforme de gestion des ECOS
        <br className="hidden md:block" />
        et de l’accompagnement des externes
      </p>
    </section>
  );
}

function HeroPhoto() {
  return (
    <section className="mt-8">
      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[56px] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <img
            src="/photo-equipe.jpg"
            alt="Équipe second cycle"
            className="h-[260px] w-full object-cover md:h-[390px]"
          />
        </div>
      </div>
    </section>
  );
}

function MissionBlock() {
  return (
    <section className="rounded-[32px] bg-transparent p-2">
      <div className="rounded-[28px] p-2 md:p-4">
        <div className="flex items-center gap-3">
          <LeafIcon />
          <h2 className="text-[#6f9358] text-3xl font-bold uppercase tracking-wide">
            Notre mission
          </h2>
        </div>

        <p className="mt-4 text-2xl leading-relaxed text-[#3b3b3b]">
          Accompagner les externes du D2 au D4
          <br />
          vers la réussite aux ECOS.
        </p>

        <div className="mt-8 space-y-6">
          <FeatureRow
            icon={<CalendarDays className="h-7 w-7 text-white" />}
            circleColor="#dd9388"
            title="Sessions & Inscriptions"
            titleColor="#d45b4b"
            text="Consultez les sessions disponibles et inscrivez-vous facilement."
          />

          <FeatureRow
            icon={<Users className="h-7 w-7 text-white" />}
            circleColor="#a7bc64"
            title="Évaluations"
            titleColor="#7a9b45"
            text="Suivez vos évaluations et vos progrès."
          />

          <FeatureRow
            icon={<CheckCircle2 className="h-7 w-7 text-white" />}
            circleColor="#efc1be"
            title="Suivi personnalisé"
            titleColor="#d45b4b"
            text="Retrouvez votre parcours et vos résultats année après année."
          />

          <FeatureRow
            icon={<Search className="h-7 w-7 text-white" />}
            circleColor="#8cad5b"
            title="Accompagnement"
            titleColor="#7a9b45"
            text="Accédez aux ressources et conseils pour progresser."
          />
        </div>
      </div>
    </section>
  );
}

function Field({
  icon,
  placeholder,
  type,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#d8d2c9] bg-[#f9f6ef] px-4 py-4">
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-lg outline-none placeholder:text-[#b5b1aa]"
      />
    </div>
  );
}

function FeatureRow({
  icon,
  circleColor,
  title,
  titleColor,
  text,
}: {
  icon: React.ReactNode;
  circleColor: string;
  title: string;
  titleColor: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: circleColor }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold" style={{ color: titleColor }}>
          {title}
        </h3>
        <p className="mt-1 text-xl leading-relaxed text-[#4a4a4a]">{text}</p>
      </div>
    </div>
  );
}

function LeafIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center text-[#7ea05c]">
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M19 3C10.5 3 5 8.5 5 17c6.5 0 12-5.5 12-14h2Z" />
        <path d="M7 17c3-4 6.5-6.5 11-8" />
      </svg>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-24 h-72 w-80 rounded-[45%_55%_55%_45%/55%_45%_55%_45%] bg-[#d84f4f]" />
        <div className="absolute top-0 right-0 h-64 w-80 rounded-[55%_45%_35%_65%/50%_60%_40%_50%] bg-[#5c8945]" />
        <div className="absolute bottom-0 left-0 h-64 w-[32rem] rounded-[60%_40%_65%_35%/45%_55%_45%_55%] bg-[#d84f4f]" />
        <div className="absolute bottom-0 right-0 h-64 w-[32rem] rounded-[40%_60%_40%_60%/55%_45%_55%_45%] bg-[#5c8945]" />
      </div>
    </>
  );
}