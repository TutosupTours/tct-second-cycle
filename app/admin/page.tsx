"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import {
  CalendarDays,
  ClipboardList,
  LogOut,
  Plus,
  Settings2,
  Users,
  Clock3,
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

type StudentItem = {
  id: string;
  full_name: string;
  email: string;
};

type RotationItem = {
  id: string;
  session_id: string;
  room_id: string;
  student_profile_id: string;
  scheduled_at: string;
  order_index: number;
};

type FormItem = {
  id: string;
  title: string;
  description: string | null;
  session_type: string;
  is_active: boolean;
};

type FormCriterion = {
  id: string;
  form_id: string;
  label: string;
  item_type: "checkbox" | "score" | "text";
  max_score: number | null;
  sort_order: number;
};

type RoomFormAssignment = {
  id: string;
  session_id: string;
  room_id: string;
  form_id: string;
};

export default function AdminPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [examiners, setExaminers] = useState<ExaminerItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [rotations, setRotations] = useState<RotationItem[]>([]);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [formItems, setFormItems] = useState<FormCriterion[]>([]);
  const [assignments, setAssignments] = useState<RoomFormAssignment[]>([]);
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

  const [rotationSessionId, setRotationSessionId] = useState("");
  const [rotationRoomId, setRotationRoomId] = useState("");
  const [rotationStudentId, setRotationStudentId] = useState("");
  const [rotationDateTime, setRotationDateTime] = useState("");
  const [rotationOrder, setRotationOrder] = useState("1");

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSessionType, setFormSessionType] = useState("ESEE");

  const [selectedFormId, setSelectedFormId] = useState("");
  const [criterionLabel, setCriterionLabel] = useState("");
  const [criterionType, setCriterionType] = useState<"checkbox" | "score" | "text">("checkbox");
  const [criterionMaxScore, setCriterionMaxScore] = useState("1");
  const [criterionOrder, setCriterionOrder] = useState("1");

  const [assignFormSessionId, setAssignFormSessionId] = useState("");
  const [assignFormRoomId, setAssignFormRoomId] = useState("");
  const [assignFormId, setAssignFormId] = useState("");

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
    const [
      sessionsRes,
      roomsRes,
      examinersRes,
      studentsRes,
      rotationsRes,
      formsRes,
      formItemsRes,
      assignmentsRes,
    ] = await Promise.all([
      supabase.from("sessions").select("*").order("starts_at", { ascending: true }),
      supabase.from("session_rooms").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email").eq("role", "examiner"),
      supabase.from("profiles").select("id, full_name, email").eq("role", "student").order("full_name", { ascending: true }),
      supabase.from("room_rotations").select("*").order("scheduled_at", { ascending: true }),
      supabase.from("evaluation_forms").select("*").order("created_at", { ascending: false }),
      supabase.from("evaluation_form_items").select("*").order("sort_order", { ascending: true }),
      supabase.from("room_form_assignments").select("*").order("created_at", { ascending: false }),
    ]);

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!roomsRes.error) setRooms((roomsRes.data as RoomItem[]) || []);
    if (!examinersRes.error) setExaminers((examinersRes.data as ExaminerItem[]) || []);
    if (!studentsRes.error) setStudents((studentsRes.data as StudentItem[]) || []);
    if (!rotationsRes.error) setRotations((rotationsRes.data as RotationItem[]) || []);
    if (!formsRes.error) setForms((formsRes.data as FormItem[]) || []);
    if (!formItemsRes.error) setFormItems((formItemsRes.data as FormCriterion[]) || []);
    if (!assignmentsRes.error) setAssignments((assignmentsRes.data as RoomFormAssignment[]) || []);
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
    loadAll();
  }

  async function handleCreateRotation() {
    setMessage("");

    const { error } = await supabase.from("room_rotations").insert({
      session_id: rotationSessionId,
      room_id: rotationRoomId,
      student_profile_id: rotationStudentId,
      scheduled_at: rotationDateTime,
      order_index: Number(rotationOrder),
    });

    if (error) {
      setMessage("Erreur lors de la création du passage.");
      return;
    }

    setRotationDateTime("");
    setRotationOrder("1");
    setMessage("Passage planifié avec succès.");
    loadAll();
  }

  async function handleCreateForm() {
    setMessage("");

    const { error } = await supabase.from("evaluation_forms").insert({
      title: formTitle,
      description: formDescription || null,
      session_type: formSessionType,
      is_active: true,
    });

    if (error) {
      setMessage("Erreur lors de la création de la grille.");
      return;
    }

    setFormTitle("");
    setFormDescription("");
    setMessage("Grille créée avec succès.");
    loadAll();
  }

  async function handleCreateCriterion() {
    setMessage("");

    const { error } = await supabase.from("evaluation_form_items").insert({
      form_id: selectedFormId,
      label: criterionLabel,
      item_type: criterionType,
      max_score: criterionType === "text" ? null : Number(criterionMaxScore),
      sort_order: Number(criterionOrder),
    });

    if (error) {
      setMessage("Erreur lors de la création du critère.");
      return;
    }

    setCriterionLabel("");
    setCriterionMaxScore("1");
    setCriterionOrder("1");
    setMessage("Critère ajouté avec succès.");
    loadAll();
  }

  async function handleAssignFormToRoom() {
    setMessage("");

    const { error } = await supabase.from("room_form_assignments").insert({
      session_id: assignFormSessionId,
      room_id: assignFormRoomId,
      form_id: assignFormId,
    });

    if (error) {
      setMessage("Erreur lors de l'affectation de la grille.");
      return;
    }

    setMessage("Grille affectée à la salle avec succès.");
    loadAll();
  }

  const filteredRoomsForAssign = useMemo(
    () => rooms.filter((r) => !assignSessionId || r.session_id === assignSessionId),
    [rooms, assignSessionId]
  );

  const filteredRoomsForRotation = useMemo(
    () => rooms.filter((r) => !rotationSessionId || r.session_id === rotationSessionId),
    [rooms, rotationSessionId]
  );

  const filteredRoomsForForm = useMemo(
    () => rooms.filter((r) => !assignFormSessionId || r.session_id === assignFormSessionId),
    [rooms, assignFormSessionId]
  );

  const visibleFormItems = useMemo(
    () => formItems.filter((item) => item.form_id === selectedFormId),
    [formItems, selectedFormId]
  );

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
                {filteredRoomsForAssign.map((r) => (
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

          <Card title="Planifier un passage" icon={<Clock3 className="h-5 w-5 text-[#7c9c56]" />}>
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={rotationSessionId} onChange={(e) => setRotationSessionId(e.target.value)}>
                <option value="">Choisir une session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>

              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={rotationRoomId} onChange={(e) => setRotationRoomId(e.target.value)}>
                <option value="">Choisir une salle</option>
                {filteredRoomsForRotation.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={rotationStudentId} onChange={(e) => setRotationStudentId(e.target.value)}>
                <option value="">Choisir un étudiant</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.email})
                  </option>
                ))}
              </select>

              <input type="datetime-local" className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={rotationDateTime} onChange={(e) => setRotationDateTime(e.target.value)} />
              <input type="number" className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={rotationOrder} onChange={(e) => setRotationOrder(e.target.value)} />

              <button onClick={handleCreateRotation} className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold">
                Créer le passage
              </button>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Créer une grille d'évaluation" icon={<Settings2 className="h-5 w-5 text-[#7c9c56]" />}>
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Nom de la grille" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              <textarea className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none min-h-[100px]" placeholder="Description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={formSessionType} onChange={(e) => setFormSessionType(e.target.value)}>
                <option value="ESEE">ESEE</option>
                <option value="Procedural">Procédural</option>
              </select>
              <button onClick={handleCreateForm} className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold">
                Créer la grille
              </button>
            </div>
          </Card>

          <Card title="Ajouter des critères à une grille" icon={<ClipboardList className="h-5 w-5 text-[#7c9c56]" />}>
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
                <option value="">Choisir une grille</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>

              <input className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Libellé du critère" value={criterionLabel} onChange={(e) => setCriterionLabel(e.target.value)} />

              <div className="grid grid-cols-3 gap-4">
                <select className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={criterionType} onChange={(e) => setCriterionType(e.target.value as "checkbox" | "score" | "text")}>
                  <option value="checkbox">Case à cocher</option>
                  <option value="score">Score</option>
                  <option value="text">Texte</option>
                </select>

                <input type="number" className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Points max" value={criterionMaxScore} onChange={(e) => setCriterionMaxScore(e.target.value)} />

                <input type="number" className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" placeholder="Ordre" value={criterionOrder} onChange={(e) => setCriterionOrder(e.target.value)} />
              </div>

              <button onClick={handleCreateCriterion} className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold">
                Ajouter le critère
              </button>

              {selectedFormId ? (
                <div className="rounded-[20px] bg-[#faf7f0] p-4">
                  <p className="mb-3 font-semibold">Critères existants</p>
                  {visibleFormItems.length === 0 ? (
                    <p className="text-sm text-[#666]">Aucun critère pour cette grille.</p>
                  ) : (
                    <div className="space-y-2">
                      {visibleFormItems.map((item) => (
                        <div key={item.id} className="rounded-xl bg-white p-3 text-sm">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-[#666]">
                            {item.item_type} · {item.max_score ?? "-"} pt · ordre {item.sort_order}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Assigner une grille à une salle" icon={<Settings2 className="h-5 w-5 text-[#7c9c56]" />}>
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={assignFormSessionId} onChange={(e) => setAssignFormSessionId(e.target.value)}>
                <option value="">Choisir une session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>

              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={assignFormRoomId} onChange={(e) => setAssignFormRoomId(e.target.value)}>
                <option value="">Choisir une salle</option>
                {filteredRoomsForForm.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none" value={assignFormId} onChange={(e) => setAssignFormId(e.target.value)}>
                <option value="">Choisir une grille</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>

              <button onClick={handleAssignFormToRoom} className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold">
                Affecter la grille
              </button>
            </div>
          </Card>

          <Card title="Grilles affectées" icon={<CalendarDays className="h-5 w-5 text-[#7c9c56]" />}>
            {assignments.length === 0 ? (
              <p className="text-[#666]">Aucune affectation de grille pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {assignments.map((a) => {
                  const room = rooms.find((r) => r.id === a.room_id);
                  const session = sessions.find((s) => s.id === a.session_id);
                  const form = forms.find((f) => f.id === a.form_id);

                  return (
                    <div key={a.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                      <p className="font-semibold">{form?.title || "Grille"}</p>
                      <p className="text-sm text-[#666]">{session?.title || "Session"}</p>
                      <p className="text-sm text-[#666]">{room?.name || "Salle"}</p>
                    </div>
                  );
                })}
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