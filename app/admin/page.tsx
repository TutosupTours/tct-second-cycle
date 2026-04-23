"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import {
  CalendarDays,
  LogOut,
  Plus,
  Users,
  ClipboardList,
} from "lucide-react";

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  location: string;
  level: string;
  program: string;
  max_students: number;
  status: string;
};

type RoomItem = {
  id: string;
  session_id: string;
  name: string;
  station_count: number;
  max_students: number;
};

type ExaminerItem = {
  id: string;
  full_name: string;
  email: string;
};

export default function AdminPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [examiners, setExaminers] = useState<ExaminerItem[]>([]);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("D2");
  const [program, setProgram] = useState("ESEE");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxStudents, setMaxStudents] = useState("16");

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [stationCount, setStationCount] = useState("1");
  const [roomMaxStudents, setRoomMaxStudents] = useState("8");

  const [assignSessionId, setAssignSessionId] = useState("");
  const [assignRoomId, setAssignRoomId] = useState("");
  const [assignExaminerId, setAssignExaminerId] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=admin";
      return;
    }

    if (!loading && user && profile?.role !== "admin") {
      window.location.href = "/";
      return;
    }

    if (user && profile?.role === "admin") {
      loadAll();
    }
  }, [user, profile, loading]);

  async function loadAll() {
    const [sessionsRes, roomsRes, examinersRes] = await Promise.all([
      supabase.from("sessions").select("*").order("starts_at", { ascending: true }),
      supabase.from("session_rooms").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email").eq("role", "examiner"),
    ]);

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!roomsRes.error) setRooms((roomsRes.data as RoomItem[]) || []);
    if (!examinersRes.error) setExaminers((examinersRes.data as ExaminerItem[]) || []);
  }

  async function handleCreateSession() {
    setMessage("");

    const { error } = await supabase.from("sessions").insert({
      title,
      description: null,
      session_type: program,
      level,
      program,
      starts_at: startsAt,
      ends_at: endsAt,
      location,
      max_students: Number(maxStudents),
      status: "open",
    });

    if (error) {
      setMessage("Erreur lors de la création de la session.");
      return;
    }

    setTitle("");
    setLocation("");
    setLevel("D2");
    setProgram("ESEE");
    setStartsAt("");
    setEndsAt("");
    setMaxStudents("16");
    setMessage("Session créée avec succès.");
    loadAll();
  }

  async function handleCreateRoom() {
    setMessage("");

    const { error } = await supabase.from("session_rooms").insert({
      session_id: selectedSessionId,
      name: roomName,
      station_count: Number(stationCount),
      max_students: Number(roomMaxStudents),
    });

    if (error) {
      setMessage("Erreur lors de la création de la salle.");
      return;
    }

    setRoomName("");
    setStationCount("1");
    setRoomMaxStudents("8");
    setMessage("Salle créée avec succès.");
    loadAll();
  }

  async function handleAssignExaminer() {
    setMessage("");

    const { error } = await supabase.from("examiner_assignments").insert({
      session_id: assignSessionId,
      room_id: assignRoomId || null,
      examiner_profile_id: assignExaminerId,
    });

    if (error) {
      setMessage("Erreur lors de l'affectation de l'examinateur.");
      return;
    }

    setMessage("Examinateur affecté avec succès.");
  }

  if (loading) return <main className="p-10">Chargement...</main>;
  if (!user || !profile || profile.role !== "admin") return <main className="p-10">Redirection...</main>;

  return (
    <main className="min-h-screen bg-[#efe8d7] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[30px] bg-white/90 p-6 shadow">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2f2f2f]">Interface Admin</h1>
              <p className="mt-2 text-[#666]">{profile.full_name}</p>
              <p className="text-sm text-[#777]">{profile.email}</p>
            </div>

            <a
              href="/logout"
              className="inline-flex items-center gap-2 rounded-xl bg-[#d84f4f] px-4 py-2 text-white"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </a>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Créer une session" icon={<Plus className="h-5 w-5 text-[#d84f4f]" />}>
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Lieu" value={location} onChange={(e) => setLocation(e.target.value)} />

              <div className="grid grid-cols-2 gap-4">
                <select className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                </select>

                <select className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={program} onChange={(e) => setProgram(e.target.value)}>
                  <option value="ESEE">ESEE</option>
                  <option value="Procedural">Procédural</option>
                </select>
              </div>

              <input type="datetime-local" className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              <input type="datetime-local" className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              <input type="number" className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />

              <button onClick={handleCreateSession} className="w-full rounded-2xl bg-[#d84f4f] px-6 py-4 text-white font-semibold">
                Créer la session
              </button>
            </div>
          </Card>

          <Card title="Créer une salle" icon={<ClipboardList className="h-5 w-5 text-[#7c9c56]" />}>
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
                <option value="">Choisir une session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>

              <input className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Nom de la salle" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
              <input type="number" className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Nombre de stations" value={stationCount} onChange={(e) => setStationCount(e.target.value)} />
              <input type="number" className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Capacité salle" value={roomMaxStudents} onChange={(e) => setRoomMaxStudents(e.target.value)} />

              <button onClick={handleCreateRoom} className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold">
                Créer la salle
              </button>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Affecter un examinateur" icon={<Users className="h-5 w-5 text-[#7c9c56]" />}>
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={assignSessionId} onChange={(e) => setAssignSessionId(e.target.value)}>
                <option value="">Choisir une session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>

              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={assignRoomId} onChange={(e) => setAssignRoomId(e.target.value)}>
                <option value="">Choisir une salle</option>
                {rooms
                  .filter((r) => !assignSessionId || r.session_id === assignSessionId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>

              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={assignExaminerId} onChange={(e) => setAssignExaminerId(e.target.value)}>
                <option value="">Choisir un examinateur</option>
                {examiners.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.email})
                  </option>
                ))}
              </select>

              <button onClick={handleAssignExaminer} className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold">
                Affecter l'examinateur
              </button>
            </div>
          </Card>

          <Card title="Sessions créées" icon={<CalendarDays className="h-5 w-5 text-[#7c9c56]" />}>
            {sessions.length === 0 ? (
              <p className="text-[#666]">Aucune session créée.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((s) => (
                  <div key={s.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                    <p className="text-lg font-semibold">{s.title}</p>
                    <p className="mt-1 text-sm text-[#666]">{new Date(s.starts_at).toLocaleString("fr-FR")}</p>
                    <p className="text-sm text-[#666]">{s.location}</p>
                    <p className="mt-1 text-sm text-[#666]">
                      {s.level} · {s.program} · {s.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {message ? (
          <section className="rounded-[20px] bg-white p-4 shadow text-[#5c8945] font-medium">
            {message}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] bg-white/90 p-6 shadow">
      <div className="mb-5 flex items-center gap-3">
        {icon}
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}