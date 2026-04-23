"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Lock,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from "lucide-react";

type Role = "Admin" | "BR" | "Examinateur" | "Étudiant";

type StudentRequest = {
  id: string;
  fullName: string;
  email: string;
  level: "D2" | "D3" | "D4";
  program: "ESEE" | "Procédural";
  createdAt: string;
};

type StudentAccount = {
  id: string;
  fullName: string;
  email: string;
  level: "D2" | "D3" | "D4";
  program: "ESEE" | "Procédural";
  loginId: string;
  password: string;
};

type IssuedCredential = {
  id: string;
  fullName: string;
  email: string;
  loginId: string;
  password: string;
  createdAt: string;
};

type SessionItem = {
  id: string;
  title: string;
  date: string;
  room: string;
  level: "D2" | "D3" | "D4";
  program: "ESEE" | "Procédural";
  capacity: number;
  enrolled: number;
};

type Enrollment = {
  id: string;
  accountId: string;
  sessionId: string;
};

type BaseUser = {
  username: string;
  password: string;
  role: Exclude<Role, "Étudiant">;
  displayName: string;
};

type StudentUser = {
  username: string;
  password: string;
  role: "Étudiant";
  displayName: string;
  accountId: string;
};

type ConnectedUser = BaseUser | StudentUser;

const STORAGE_KEY = "tct-demo-premium-v4";

const BASE_USERS: BaseUser[] = [
  { username: "admin", password: "admin", role: "Admin", displayName: "Amélia & Théo" },
  { username: "br", password: "br", role: "BR", displayName: "Bureau restreint" },
  { username: "exam1", password: "exam1", role: "Examinateur", displayName: "Examinateur 1" },
  { username: "exam2", password: "exam2", role: "Examinateur", displayName: "Examinateur 2" },
];

const ROLE_COLORS: Record<Role, string> = {
  Admin: "#d84f4f",
  BR: "#7c9c56",
  Examinateur: "#e0b63b",
  Étudiant: "#e7a9ae",
};

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: "s1",
    title: "ESEE D2 - Session 1",
    date: "28 avril 2026 · 18:00",
    room: "Salle 1",
    level: "D2",
    program: "ESEE",
    capacity: 16,
    enrolled: 4,
  },
  {
    id: "s2",
    title: "ECOS procédural D4",
    date: "02 mai 2026 · 18:30",
    room: "Salle 2",
    level: "D4",
    program: "Procédural",
    capacity: 16,
    enrolled: 6,
  },
  {
    id: "s3",
    title: "ESEE D4 - Session 2",
    date: "06 mai 2026 · 19:00",
    room: "Salle 4",
    level: "D4",
    program: "ESEE",
    capacity: 20,
    enrolled: 5,
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function nowFr() {
  return new Date().toLocaleString("fr-FR");
}

function makeLogin(fullName: string) {
  const base = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, 8);

  return `${base || "etu"}${Math.floor(10 + Math.random() * 90)}`;
}

function makePassword() {
  return `mdp${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function Home() {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [user, setUser] = useState<ConnectedUser | null>(null);
  const [page, setPage] = useState("dashboard");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupLevel, setSignupLevel] = useState<"D2" | "D3" | "D4">("D2");
  const [signupProgram, setSignupProgram] = useState<"ESEE" | "Procédural">("ESEE");
  const [signupMessage, setSignupMessage] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setRequests(parsed.requests ?? []);
      setAccounts(parsed.accounts ?? []);
      setIssuedCredentials(parsed.issuedCredentials ?? []);
      setSessions(parsed.sessions ?? INITIAL_SESSIONS);
      setEnrollments(parsed.enrollments ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        requests,
        accounts,
        issuedCredentials,
        sessions,
        enrollments,
      })
    );
  }, [requests, accounts, issuedCredentials, sessions, enrollments]);

  const allUsers: ConnectedUser[] = useMemo(() => {
    const studentUsers: StudentUser[] = accounts.map((a) => ({
      username: a.loginId,
      password: a.password,
      role: "Étudiant",
      displayName: a.fullName,
      accountId: a.id,
    }));
    return [...BASE_USERS, ...studentUsers];
  }, [accounts]);

  const currentStudent = useMemo(() => {
    if (!user || user.role !== "Étudiant") return null;
    return accounts.find((a) => a.id === user.accountId) || null;
  }, [user, accounts]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) =>
      `${r.fullName} ${r.email} ${r.level} ${r.program}`.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) =>
      `${a.fullName} ${a.email} ${a.level} ${a.program} ${a.loginId}`.toLowerCase().includes(q)
    );
  }, [accounts, search]);

  const availableStudentSessions = useMemo(() => {
    if (!currentStudent) return [];
    return sessions.filter(
      (s) => s.level === currentStudent.level && s.program === currentStudent.program
    );
  }, [sessions, currentStudent]);

  const enrolledSessionIds = useMemo(() => {
    if (!currentStudent) return new Set<string>();
    return new Set(
      enrollments.filter((e) => e.accountId === currentStudent.id).map((e) => e.sessionId)
    );
  }, [enrollments, currentStudent]);

  const handleSignup = () => {
    const fullName = signupName.trim();
    const email = signupEmail.trim().toLowerCase();

    if (!fullName || !email) {
      setSignupMessage("Merci de remplir le nom et l’email.");
      return;
    }

    const alreadyRequested = requests.some((r) => r.email.toLowerCase() === email);
    const alreadyAccount = accounts.some((a) => a.email.toLowerCase() === email);

    if (alreadyRequested || alreadyAccount) {
      setSignupMessage("Une demande ou un compte existe déjà avec cet email.");
      return;
    }

    const newRequest: StudentRequest = {
      id: uid(),
      fullName,
      email,
      level: signupLevel,
      program: signupProgram,
      createdAt: nowFr(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    setSignupName("");
    setSignupEmail("");
    setSignupLevel("D2");
    setSignupProgram("ESEE");
    setSignupMessage(`Demande envoyée pour ${newRequest.fullName}.`);
  };

  const handleValidate = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const loginId = makeLogin(req.fullName);
    const password = makePassword();

    const newAccount: StudentAccount = {
      id: uid(),
      fullName: req.fullName,
      email: req.email,
      level: req.level,
      program: req.program,
      loginId,
      password,
    };

    const credential: IssuedCredential = {
      id: uid(),
      fullName: req.fullName,
      email: req.email,
      loginId,
      password,
      createdAt: nowFr(),
    };

    setAccounts((prev) => [newAccount, ...prev]);
    setIssuedCredentials((prev) => [credential, ...prev]);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleLogin = () => {
    const found = allUsers.find(
      (u) => u.username === loginUsername.trim() && u.password === loginPassword
    );

    if (!found) {
      setLoginError("Identifiants incorrects");
      return;
    }

    setUser(found);
    setPage("dashboard");
    setLoginError("");
    setLoginUsername("");
    setLoginPassword("");
  };

  const handleQuickRole = (role: Role) => {
    const found = BASE_USERS.find((u) => u.role === role);
    if (!found) return;
    setUser(found);
    setPage("dashboard");
    setLoginError("");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("dashboard");
    setSearch("");
  };

  const handleEnroll = (sessionId: string) => {
    if (!currentStudent) return;
    if (enrolledSessionIds.has(sessionId)) return;

    const target = sessions.find((s) => s.id === sessionId);
    if (!target || target.enrolled >= target.capacity) return;

    setEnrollments((prev) => [
      ...prev,
      { id: uid(), accountId: currentStudent.id, sessionId },
    ]);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, enrolled: s.enrolled + 1 } : s
      )
    );
  };

  if (!user) {
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
                <h2 className="text-4xl font-medium text-[#2f2f2f]">Connexion</h2>
              </div>

              <div className="mt-8 space-y-4">
                <Field
                  icon={<User className="h-5 w-5 text-[#9aa18f]" />}
                  placeholder="Identifiant"
                  type="text"
                  value={loginUsername}
                  onChange={setLoginUsername}
                />
                <Field
                  icon={<Lock className="h-5 w-5 text-[#9aa18f]" />}
                  placeholder="Mot de passe"
                  type="password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                />
              </div>

              {loginError ? (
                <p className="mt-4 text-sm font-medium text-red-600">{loginError}</p>
              ) : null}

              <button
                type="button"
                onClick={handleLogin}
                className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-2xl font-semibold text-white transition hover:opacity-95"
              >
                Se connecter
              </button>

              <div className="mt-8 flex items-center gap-4 text-[#9b978f]">
                <div className="h-px flex-1 bg-[#d7d0c5]" />
                <span className="text-lg">Accès rapide</span>
                <div className="h-px flex-1 bg-[#d7d0c5]" />
              </div>

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

              <div className="mt-8 rounded-2xl bg-[#f9f6ef] p-4 text-sm text-[#666]">
                <p className="font-semibold mb-2">Comptes bureau :</p>
                <p>admin / admin</p>
                <p>br / br</p>
                <p>exam1 / exam1</p>
                <p>exam2 / exam2</p>
                <p className="mt-2 text-xs">
                  Les comptes étudiants sont créés après validation BR.
                </p>
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
                      onChange={(e) => setSignupLevel(e.target.value as "D2" | "D3" | "D4")}
                      className="rounded-2xl border border-[#d8d2c9] bg-[#f9f6ef] px-4 py-4 text-lg outline-none"
                    >
                      <option value="D2">D2</option>
                      <option value="D3">D3</option>
                      <option value="D4">D4</option>
                    </select>

                    <select
                      value={signupProgram}
                      onChange={(e) =>
                        setSignupProgram(e.target.value as "ESEE" | "Procédural")
                      }
                      className="rounded-2xl border border-[#d8d2c9] bg-[#f9f6ef] px-4 py-4 text-lg outline-none"
                    >
                      <option value="ESEE">ESEE</option>
                      <option value="Procédural">Procédural</option>
                    </select>
                  </div>
                </div>

                {signupMessage ? (
                  <p className="mt-4 text-sm font-medium text-[#5c8945]">{signupMessage}</p>
                ) : null}

                <button
                  type="button"
                  onClick={handleSignup}
                  className="mt-6 w-full rounded-2xl bg-[#d84f4f] px-6 py-4 text-xl font-semibold text-white transition hover:opacity-95"
                >
                  Envoyer ma demande
                </button>

                <div className="mt-6 rounded-2xl bg-[#f9f6ef] p-4 text-sm text-[#666]">
                  <p className="font-semibold mb-2">Demandes en attente : {requests.length}</p>
                  {requests.length === 0 ? (
                    <p>Aucune demande pour le moment.</p>
                  ) : (
                    requests.slice(0, 5).map((r) => (
                      <p key={r.id}>
                        {r.fullName} — {r.email}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </section>
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

  return (
    <main className="min-h-screen bg-[#efe8d7] p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <aside
          className="hidden md:flex w-72 shrink-0 flex-col justify-between rounded-[32px] p-6 text-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
          style={{ backgroundColor: ROLE_COLORS[user.role] }}
        >
          <div>
            <div className="mb-8">
              <p className="text-sm opacity-80">Plateforme</p>
              <h2 className="text-3xl font-semibold">TCT</h2>
              <p className="mt-2 text-sm opacity-80">{user.role}</p>
            </div>

            <nav className="space-y-2">
              <SidebarButton
                active={page === "dashboard"}
                onClick={() => setPage("dashboard")}
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
              />
              <SidebarButton
                active={page === "sessions"}
                onClick={() => setPage("sessions")}
                icon={<CalendarDays className="h-5 w-5" />}
                label="Sessions"
              />
              <SidebarButton
                active={page === "users"}
                onClick={() => setPage("users")}
                icon={<Users className="h-5 w-5" />}
                label="Utilisateurs"
              />
              <SidebarButton
                active={page === "results"}
                onClick={() => setPage("results")}
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Résultats"
              />
              <SidebarButton
                active={page === "settings"}
                onClick={() => setPage("settings")}
                icon={<Settings className="h-5 w-5" />}
                label="Paramètres"
              />
            </nav>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/15 px-4 py-3 text-white"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </aside>

        <section className="min-w-0 flex-1 space-y-6">
          <div className="flex items-center justify-between rounded-[28px] bg-white/80 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <div>
              <h1 className="text-3xl font-semibold text-[#2f2f2f]">
                Bonjour {user.displayName}
              </h1>
              <p className="mt-1 text-[#777]">
                {user.role === "Admin" && "Pilotage global de la plateforme"}
                {user.role === "BR" && "Validation des demandes et paiements"}
                {user.role === "Examinateur" && "Vue dédiée examinateur"}
                {user.role === "Étudiant" && "Espace personnel étudiant"}
              </p>
            </div>

            <div
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: ROLE_COLORS[user.role] }}
            >
              {user.role}
            </div>
          </div>

          {page === "dashboard" && (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Demandes" value={String(requests.length)} icon={<Users className="h-5 w-5 text-[#555]" />} />
                <StatCard label="Comptes actifs" value={String(accounts.length)} icon={<CheckCircle2 className="h-5 w-5 text-[#555]" />} />
                <StatCard label="Sessions" value={String(sessions.length)} icon={<CalendarDays className="h-5 w-5 text-[#555]" />} />
                <StatCard label="Inscriptions" value={String(enrollments.length)} icon={<ClipboardList className="h-5 w-5 text-[#555]" />} />
              </div>

              {user.role === "BR" && (
                <>
                  <CardPanel title="Demandes à valider">
                    {requests.length === 0 ? (
                      <p className="text-[#666]">Aucune demande en attente.</p>
                    ) : (
                      <div className="space-y-4">
                        {requests.map((r) => (
                          <div key={r.id} className="rounded-[24px] bg-[#faf7f0] p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold">{r.fullName}</p>
                                <p className="text-sm text-[#666]">{r.email}</p>
                                <p className="mt-1 text-sm text-[#666]">
                                  {r.level} · {r.program}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleValidate(r.id)}
                                className="rounded-xl bg-[#7c9c56] px-4 py-2 text-sm font-semibold text-white"
                              >
                                Valider paiement
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardPanel>

                  <CardPanel title="Identifiants générés">
                    {issuedCredentials.length === 0 ? (
                      <p className="text-[#666]">Aucun identifiant généré pour le moment.</p>
                    ) : (
                      <div className="space-y-4">
                        {issuedCredentials.map((c) => (
                          <div key={c.id} className="rounded-[24px] bg-[#faf7f0] p-4">
                            <p className="font-semibold">{c.fullName}</p>
                            <p className="text-sm text-[#666]">{c.email}</p>
                            <p className="mt-2 text-sm">
                              <span className="font-semibold">ID :</span> {c.loginId}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">MDP :</span> {c.password}
                            </p>
                            <p className="mt-2 text-xs text-[#888]">{c.createdAt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardPanel>
                </>
              )}

              {user.role === "Admin" && (
                <CardPanel title="Comptes créés">
                  <div className="space-y-3">
                    {accounts.length === 0 ? (
                      <p className="text-[#666]">Aucun compte étudiant encore créé.</p>
                    ) : (
                      accounts.slice(0, 10).map((a) => (
                        <div key={a.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                          <p className="font-semibold">{a.fullName}</p>
                          <p className="text-sm text-[#666]">
                            {a.level} · {a.program} · {a.loginId}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardPanel>
              )}

              {user.role === "Examinateur" && (
                <CardPanel title="Mes sessions">
                  <div className="grid gap-4 md:grid-cols-2">
                    {sessions.slice(0, 2).map((s) => (
                      <div key={s.id} className="rounded-[24px] bg-[#faf7f0] p-4">
                        <p className="text-lg font-semibold">{s.title}</p>
                        <p className="mt-1 text-sm text-[#666]">
                          {s.date} · {s.room}
                        </p>
                        <p className="mt-2 text-sm text-[#666]">
                          {s.enrolled} / {s.capacity} inscrits
                        </p>
                      </div>
                    ))}
                  </div>
                </CardPanel>
              )}

              {user.role === "Étudiant" && currentStudent && (
                <CardPanel title="Mon profil">
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoBox label="Nom" value={currentStudent.fullName} />
                    <InfoBox label="Niveau" value={currentStudent.level} />
                    <InfoBox label="Programme" value={currentStudent.program} />
                  </div>
                </CardPanel>
              )}
            </>
          )}

          {page === "sessions" && (
            <CardPanel title="Sessions">
              {user.role === "Étudiant" && currentStudent ? (
                <div className="space-y-4">
                  {availableStudentSessions.map((s) => {
                    const already = enrolledSessionIds.has(s.id);
                    const full = s.enrolled >= s.capacity;

                    return (
                      <div key={s.id} className="rounded-[24px] bg-[#faf7f0] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold">{s.title}</p>
                            <p className="mt-1 text-sm text-[#666]">
                              {s.date} · {s.room}
                            </p>
                            <p className="mt-1 text-sm text-[#666]">
                              {s.enrolled} / {s.capacity} inscrits
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={already || full}
                            onClick={() => handleEnroll(s.id)}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: ROLE_COLORS["Étudiant"] }}
                          >
                            {already ? "Déjà inscrit" : full ? "Complet" : "S'inscrire"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="rounded-[24px] bg-[#faf7f0] p-4">
                      <p className="text-lg font-semibold">{s.title}</p>
                      <p className="mt-1 text-sm text-[#666]">
                        {s.date} · {s.room}
                      </p>
                      <p className="mt-2 text-sm text-[#666]">
                        {s.level} · {s.program}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardPanel>
          )}

          {page === "users" && (
            <CardPanel title="Utilisateurs">
              <div className="mb-5 relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher"
                  className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] py-3 pl-10 pr-4 outline-none"
                />
              </div>

              {user.role === "Admin" ? (
                <div className="overflow-hidden rounded-[24px] border border-[#ece6da]">
                  <div className="grid grid-cols-5 gap-4 bg-[#faf7f0] px-4 py-3 text-sm font-semibold text-[#666]">
                    <div>Nom</div>
                    <div>Email</div>
                    <div>Niveau</div>
                    <div>Programme</div>
                    <div>Login</div>
                  </div>

                  {filteredAccounts.map((a) => (
                    <div
                      key={a.id}
                      className="grid grid-cols-5 gap-4 border-t border-[#ece6da] bg-white px-4 py-3 text-sm"
                    >
                      <div>{a.fullName}</div>
                      <div>{a.email}</div>
                      <div>{a.level}</div>
                      <div>{a.program}</div>
                      <div>{a.loginId}</div>
                    </div>
                  ))}
                </div>
              ) : user.role === "BR" ? (
                <div className="overflow-hidden rounded-[24px] border border-[#ece6da]">
                  <div className="grid grid-cols-4 gap-4 bg-[#faf7f0] px-4 py-3 text-sm font-semibold text-[#666]">
                    <div>Nom</div>
                    <div>Email</div>
                    <div>Niveau</div>
                    <div>Programme</div>
                  </div>

                  {filteredRequests.map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-4 gap-4 border-t border-[#ece6da] bg-white px-4 py-3 text-sm"
                    >
                      <div>{r.fullName}</div>
                      <div>{r.email}</div>
                      <div>{r.level}</div>
                      <div>{r.program}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666]">Accès limité pour ce profil.</p>
              )}
            </CardPanel>
          )}

          {page === "results" && (
            <CardPanel title="Résultats">
              <div className="space-y-4">
                {accounts.slice(0, 4).map((a, index) => (
                  <div key={a.id} className="rounded-[24px] bg-[#faf7f0] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{a.fullName}</p>
                        <p className="text-sm text-[#666]">
                          {a.level} · {a.program}
                        </p>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-sm font-semibold text-white"
                        style={{ backgroundColor: ROLE_COLORS[user.role] }}
                      >
                        {index % 2 === 0 ? "15/20" : "17/20"}
                      </div>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <p className="text-[#666]">Aucun résultat pour le moment.</p>
                )}
              </div>
            </CardPanel>
          )}

          {page === "settings" && (
            <CardPanel title="Paramètres">
              <div className="grid gap-4 md:grid-cols-3">
                <InfoBox label="Thème" value="Palette tutorat active" />
                <InfoBox label="Mode test" value="Bureau - 21 utilisateurs" />
                <InfoBox label="Statut" value="Prêt à l'emploi" />
              </div>
            </CardPanel>
          )}
        </section>
      </div>
    </main>
  );
}

function SidebarButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
        active ? "bg-white/20" : "hover:bg-white/10"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] bg-white/90 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#f4efe4] p-3">{icon}</div>
        <div>
          <p className="text-sm text-[#777]">{label}</p>
          <p className="text-2xl font-semibold text-[#2f2f2f]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-[#faf7f0] p-5">
      <p className="text-sm text-[#777]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#2f2f2f]">{value}</p>
    </div>
  );
}

function CardPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
      <h2 className="mb-5 text-2xl font-semibold text-[#2f2f2f]">{title}</h2>
      {children}
    </section>
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