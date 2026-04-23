"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell, {
  DashboardTitle,
  Panel,
  StatCard,
} from "@/components/dashboard-shell";

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  level: string;
  program: string;
  location: string;
  status: string;
  max_students: number;
};

type RoomItem = {
  id: string;
  session_id: string;
  name: string;
  station_count: number;
  max_students: number;
};

type ProfileLite = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  examiner_category?: string | null;
  examiner_grade?: string | null;
};

type StationItem = {
  id: string;
  session_id: string;
  room_id: string | null;
  name: string;
  station_type: string;
  program: string;
  order_index: number;
  has_ps: boolean;
  has_pss: boolean;
};

type GroupItem = {
  id: string;
  session_id: string;
  name: string;
  program: string;
  level: string | null;
};

type GroupMember = {
  id: string;
  group_id: string;
  student_profile_id: string;
};

type ExaminerRole = {
  id: string;
  code: string;
  label: string;
  program: string;
};

type StationAssignment = {
  id: string;
  session_id: string;
  station_id: string | null;
  room_id: string | null;
  examiner_profile_id: string;
  examiner_role_code: string;
  group_id: string | null;
  planned_hours: number | null;
};

type AttendanceLog = {
  id: string;
  examiner_profile_id: string;
  session_id: string;
  station_id: string | null;
  role_code: string | null;
  hours_done: number | null;
  validated: boolean;
};

export default function AdminPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [stations, setStations] = useState<StationItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [examinerRoles, setExaminerRoles] = useState<ExaminerRole[]>([]);
  const [stationAssignments, setStationAssignments] = useState<StationAssignment[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionLevel, setSessionLevel] = useState("D2");
  const [sessionProgram, setSessionProgram] = useState("ESEE");
  const [sessionStartsAt, setSessionStartsAt] = useState("");
  const [sessionEndsAt, setSessionEndsAt] = useState("");
  const [sessionCapacity, setSessionCapacity] = useState("16");

  const [roomSessionId, setRoomSessionId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomStationCount, setRoomStationCount] = useState("1");
  const [roomCapacity, setRoomCapacity] = useState("8");

  const [stationSessionId, setStationSessionId] = useState("");
  const [stationRoomId, setStationRoomId] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationType, setStationType] = useState("Station clinique");
  const [stationProgram, setStationProgram] = useState("ESEE");
  const [stationOrder, setStationOrder] = useState("1");
  const [stationHasPs, setStationHasPs] = useState(false);
  const [stationHasPss, setStationHasPss] = useState(false);

  const [groupSessionId, setGroupSessionId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupProgram, setGroupProgram] = useState("Procedural");
  const [groupLevel, setGroupLevel] = useState("D2");

  const [memberGroupId, setMemberGroupId] = useState("");
  const [memberStudentId, setMemberStudentId] = useState("");

  const [assignSessionId, setAssignSessionId] = useState("");
  const [assignStationId, setAssignStationId] = useState("");
  const [assignRoomId, setAssignRoomId] = useState("");
  const [assignExaminerId, setAssignExaminerId] = useState("");
  const [assignRoleCode, setAssignRoleCode] = useState("");
  const [assignGroupId, setAssignGroupId] = useState("");
  const [assignPlannedHours, setAssignPlannedHours] = useState("2");

  const [attendanceExaminerId, setAttendanceExaminerId] = useState("");
  const [attendanceSessionId, setAttendanceSessionId] = useState("");
  const [attendanceStationId, setAttendanceStationId] = useState("");
  const [attendanceRoleCode, setAttendanceRoleCode] = useState("");
  const [attendanceHoursDone, setAttendanceHoursDone] = useState("2");
  const [attendanceValidated, setAttendanceValidated] = useState(true);

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
    setPageLoading(true);

    const [
      sessionsRes,
      roomsRes,
      profilesRes,
      stationsRes,
      groupsRes,
      membersRes,
      rolesRes,
      assignmentsRes,
      attendanceRes,
    ] = await Promise.all([
      supabase.from("sessions").select("*").order("starts_at", { ascending: true }),
      supabase.from("session_rooms").select("*").order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, email, role, examiner_category, examiner_grade")
        .order("full_name", { ascending: true }),
      supabase.from("session_stations").select("*").order("order_index", { ascending: true }),
      supabase.from("student_groups").select("*").order("created_at", { ascending: false }),
      supabase.from("student_group_members").select("*"),
      supabase.from("examiner_roles").select("*").order("program", { ascending: true }),
      supabase.from("station_examiner_assignments").select("*").order("created_at", { ascending: false }),
      supabase.from("examiner_attendance_logs").select("*").order("created_at", { ascending: false }),
    ]);

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!roomsRes.error) setRooms((roomsRes.data as RoomItem[]) || []);
    if (!profilesRes.error) setProfiles((profilesRes.data as ProfileLite[]) || []);
    if (!stationsRes.error) setStations((stationsRes.data as StationItem[]) || []);
    if (!groupsRes.error) setGroups((groupsRes.data as GroupItem[]) || []);
    if (!membersRes.error) setGroupMembers((membersRes.data as GroupMember[]) || []);
    if (!rolesRes.error) setExaminerRoles((rolesRes.data as ExaminerRole[]) || []);
    if (!assignmentsRes.error) setStationAssignments((assignmentsRes.data as StationAssignment[]) || []);
    if (!attendanceRes.error) setAttendanceLogs((attendanceRes.data as AttendanceLog[]) || []);

    setPageLoading(false);
  }

  const students = profiles.filter((p) => p.role === "student");
  const examiners = profiles.filter((p) => p.role === "examiner");

  const roomsForSelectedStationSession = rooms.filter(
    (r) => !stationSessionId || r.session_id === stationSessionId
  );

  const selectedAssignSession = sessions.find((s) => s.id === assignSessionId);
  const selectedAssignProgram = selectedAssignSession?.program || "";

  const stationsForSelectedAssignSession = stations.filter(
    (s) => !assignSessionId || s.session_id === assignSessionId
  );

  const roomsForSelectedAssignSession = rooms.filter(
    (r) => !assignSessionId || r.session_id === assignSessionId
  );

  const groupsForSelectedAssignSession = groups.filter(
    (g) => !assignSessionId || g.session_id === assignSessionId
  );

  const rolesForSelectedProgram = getRolesForProgram(selectedAssignProgram, examinerRoles);

  const totalAttendanceHours = attendanceLogs.reduce(
    (sum, item) => sum + Number(item.hours_done || 0),
    0
  );

  function getRolesForProgram(program: string, roles: ExaminerRole[]) {
    if (program === "ESEE") {
      return roles.filter((role) => ["E", "PS", "PSS"].includes(role.code));
    }

    if (program === "Procedural") {
      return roles.filter((role) => ["MONITOR_L1", "MONITOR_L2"].includes(role.code));
    }

    return roles;
  }

  async function handleCreateSession() {
    setMessage("");

    const { error } = await supabase.from("sessions").insert({
      title: sessionTitle,
      description: null,
      session_type: sessionProgram,
      level: sessionLevel,
      program: sessionProgram,
      starts_at: sessionStartsAt,
      ends_at: sessionEndsAt,
      location: sessionLocation,
      max_students: Number(sessionCapacity),
      status: "open",
    });

    if (error) {
      setMessage("Erreur lors de la création de la session.");
      return;
    }

    setSessionTitle("");
    setSessionLocation("");
    setSessionStartsAt("");
    setSessionEndsAt("");
    setSessionCapacity("16");
    setMessage("Session créée avec succès.");
    loadAll();
  }

  async function handleCreateRoom() {
    setMessage("");

    const { error } = await supabase.from("session_rooms").insert({
      session_id: roomSessionId,
      name: roomName,
      station_count: Number(roomStationCount),
      max_students: Number(roomCapacity),
    });

    if (error) {
      setMessage("Erreur lors de la création de la salle.");
      return;
    }

    setRoomName("");
    setRoomStationCount("1");
    setRoomCapacity("8");
    setMessage("Salle créée avec succès.");
    loadAll();
  }

  async function handleCreateStation() {
    setMessage("");

    const { error } = await supabase.from("session_stations").insert({
      session_id: stationSessionId,
      room_id: stationRoomId || null,
      name: stationName,
      station_type: stationType,
      program: stationProgram,
      order_index: Number(stationOrder),
      has_ps: stationHasPs,
      has_pss: stationHasPss,
    });

    if (error) {
      setMessage("Erreur lors de la création de la station.");
      return;
    }

    setStationName("");
    setStationOrder("1");
    setStationHasPs(false);
    setStationHasPss(false);
    setMessage("Station créée avec succès.");
    loadAll();
  }

  async function handleCreateGroup() {
    setMessage("");

    const { error } = await supabase.from("student_groups").insert({
      session_id: groupSessionId,
      name: groupName,
      program: groupProgram,
      level: groupLevel,
    });

    if (error) {
      setMessage("Erreur lors de la création du groupe.");
      return;
    }

    setGroupName("");
    setMessage("Groupe créé avec succès.");
    loadAll();
  }

  async function handleAddStudentToGroup() {
    setMessage("");

    const { error } = await supabase.from("student_group_members").insert({
      group_id: memberGroupId,
      student_profile_id: memberStudentId,
    });

    if (error) {
      setMessage("Erreur lors de l'ajout de l'étudiant au groupe.");
      return;
    }

    setMessage("Étudiant ajouté au groupe.");
    loadAll();
  }

  async function handleAssignExaminerToStation() {
    setMessage("");

    const { error } = await supabase.from("station_examiner_assignments").insert({
      session_id: assignSessionId,
      station_id: assignStationId || null,
      room_id: assignRoomId || null,
      examiner_profile_id: assignExaminerId,
      examiner_role_code: assignRoleCode,
      group_id: assignGroupId || null,
      planned_hours: Number(assignPlannedHours),
    });

    if (error) {
      setMessage("Erreur lors de l'affectation de l'examinateur.");
      return;
    }

    setMessage("Affectation créée avec succès.");
    loadAll();
  }

  async function handleCreateAttendanceLog() {
    setMessage("");

    const { error } = await supabase.from("examiner_attendance_logs").insert({
      examiner_profile_id: attendanceExaminerId,
      session_id: attendanceSessionId,
      station_id: attendanceStationId || null,
      role_code: attendanceRoleCode || null,
      hours_done: Number(attendanceHoursDone),
      validated: attendanceValidated,
    });

    if (error) {
      setMessage("Erreur lors de l’enregistrement des heures.");
      return;
    }

    setMessage("Heures enregistrées avec succès.");
    loadAll();
  }

  function countMembers(groupId: string) {
    return groupMembers.filter((m) => m.group_id === groupId).length;
  }

  if (loading || pageLoading) return <main className="p-10">Chargement...</main>;
  if (!user || !profile || profile.role !== "admin") return <main className="p-10">Redirection...</main>;

  return (
    <DashboardShell
      roleLabel="Admin"
      userName={profile.full_name || "Admin"}
      topColor="#cc3128"
      accentColor="#d74d45"
      lightAccent="#fae3e1"
      avatarUrl={profile.photo_url || null}
      activePath="/admin"
      navItems={[
        { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
        { label: "Sessions", href: "/admin", icon: Calendar },
        { label: "Stations", href: "/admin", icon: ClipboardCheck },
        { label: "Groupes", href: "/admin", icon: Users },
        { label: "Examinateurs", href: "/admin", icon: ShieldCheck },
        { label: "Attestations", href: "/admin", icon: Award },
        { label: "Paramètres", href: "/admin", icon: Settings },
      ]}
    >
      <DashboardTitle
        title="Administration métier"
        subtitle="Gestion sessions, stations, groupes, examinateurs et heures"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sessions" value={String(sessions.length)} subtitle="Créées" />
        <StatCard title="Stations" value={String(stations.length)} subtitle="Configurées" />
        <StatCard title="Groupes" value={String(groups.length)} subtitle="Procédural" />
        <StatCard title="Heures" value={String(totalAttendanceHours)} subtitle="Enregistrées" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Créer une session">
          <div className="grid gap-3">
            <input className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Titre" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
            <input className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Lieu" value={sessionLocation} onChange={(e) => setSessionLocation(e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={sessionLevel} onChange={(e) => setSessionLevel(e.target.value)}>
                <option value="D2">D2</option>
                <option value="D3">D3</option>
                <option value="D4">D4</option>
              </select>

              <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={sessionProgram} onChange={(e) => setSessionProgram(e.target.value)}>
                <option value="ESEE">ESEE</option>
                <option value="Procedural">Procedural</option>
              </select>
            </div>

            <input type="datetime-local" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={sessionStartsAt} onChange={(e) => setSessionStartsAt(e.target.value)} />
            <input type="datetime-local" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={sessionEndsAt} onChange={(e) => setSessionEndsAt(e.target.value)} />
            <input type="number" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={sessionCapacity} onChange={(e) => setSessionCapacity(e.target.value)} />

            <button onClick={handleCreateSession} className="rounded-2xl bg-[#d74d45] px-4 py-3 font-semibold text-white">
              Créer la session
            </button>
          </div>
        </Panel>

        <Panel title="Créer une salle">
          <div className="grid gap-3">
            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={roomSessionId} onChange={(e) => setRoomSessionId(e.target.value)}>
              <option value="">Choisir une session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>

            <input className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Nom de la salle" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            <input type="number" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Nombre de stations" value={roomStationCount} onChange={(e) => setRoomStationCount(e.target.value)} />
            <input type="number" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Capacité salle" value={roomCapacity} onChange={(e) => setRoomCapacity(e.target.value)} />

            <button onClick={handleCreateRoom} className="rounded-2xl bg-[#d74d45] px-4 py-3 font-semibold text-white">
              Créer la salle
            </button>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Créer une station">
          <div className="grid gap-3">
            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={stationSessionId} onChange={(e) => setStationSessionId(e.target.value)}>
              <option value="">Choisir une session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={stationRoomId} onChange={(e) => setStationRoomId(e.target.value)}>
              <option value="">Choisir une salle</option>
              {roomsForSelectedStationSession.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            <input className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Nom station" value={stationName} onChange={(e) => setStationName(e.target.value)} />
            <input className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Type station" value={stationType} onChange={(e) => setStationType(e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={stationProgram} onChange={(e) => setStationProgram(e.target.value)}>
                <option value="ESEE">ESEE</option>
                <option value="Procedural">Procedural</option>
              </select>

              <input type="number" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={stationOrder} onChange={(e) => setStationOrder(e.target.value)} />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={stationHasPs} onChange={(e) => setStationHasPs(e.target.checked)} />
              Cette station a un PS
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={stationHasPss} onChange={(e) => setStationHasPss(e.target.checked)} />
              Cette station a un PSS
            </label>

            <button onClick={handleCreateStation} className="rounded-2xl bg-[#d74d45] px-4 py-3 font-semibold text-white">
              Créer la station
            </button>
          </div>
        </Panel>

        <Panel title="Créer un groupe procédural">
          <div className="grid gap-3">
            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={groupSessionId} onChange={(e) => setGroupSessionId(e.target.value)}>
              <option value="">Choisir une session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>

            <input className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" placeholder="Nom groupe" value={groupName} onChange={(e) => setGroupName(e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={groupProgram} onChange={(e) => setGroupProgram(e.target.value)}>
                <option value="Procedural">Procedural</option>
                <option value="ESEE">ESEE</option>
              </select>

              <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={groupLevel} onChange={(e) => setGroupLevel(e.target.value)}>
                <option value="D2">D2</option>
                <option value="D3">D3</option>
                <option value="D4">D4</option>
              </select>
            </div>

            <button onClick={handleCreateGroup} className="rounded-2xl bg-[#d74d45] px-4 py-3 font-semibold text-white">
              Créer le groupe
            </button>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Ajouter un étudiant dans un groupe">
          <div className="grid gap-3">
            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={memberGroupId} onChange={(e) => setMemberGroupId(e.target.value)}>
              <option value="">Choisir un groupe</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.program}) — {countMembers(g.id)} membre(s)
                </option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={memberStudentId} onChange={(e) => setMemberStudentId(e.target.value)}>
              <option value="">Choisir un étudiant</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.email})
                </option>
              ))}
            </select>

            <button onClick={handleAddStudentToGroup} className="rounded-2xl bg-[#d74d45] px-4 py-3 font-semibold text-white">
              Ajouter au groupe
            </button>
          </div>
        </Panel>

        <Panel title="Affecter un examinateur">
          <div className="grid gap-3">
            <select
              className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none"
              value={assignSessionId}
              onChange={(e) => {
                setAssignSessionId(e.target.value);
                setAssignRoleCode("");
                setAssignStationId("");
                setAssignRoomId("");
                setAssignGroupId("");
              }}
            >
              <option value="">Choisir une session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.program})
                </option>
              ))}
            </select>

            {selectedAssignProgram ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-[#2c2f4a]">
                {selectedAssignProgram === "ESEE" ? (
                  <p>
                    Session ESEE : rôles disponibles — Évaluateur, Patient standardisé,
                    Professionnel de santé standardisé.
                  </p>
                ) : selectedAssignProgram === "Procedural" ? (
                  <p>
                    Session procédurale : rôles disponibles — Moniteur niveau 1 ou Moniteur niveau 2.
                  </p>
                ) : (
                  <p>Choisis un rôle adapté à cette session.</p>
                )}
              </div>
            ) : null}

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={assignStationId} onChange={(e) => setAssignStationId(e.target.value)}>
              <option value="">Choisir une station</option>
              {stationsForSelectedAssignSession.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.program})
                </option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={assignRoomId} onChange={(e) => setAssignRoomId(e.target.value)}>
              <option value="">Choisir une salle</option>
              {roomsForSelectedAssignSession.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={assignExaminerId} onChange={(e) => setAssignExaminerId(e.target.value)}>
              <option value="">Choisir un examinateur</option>
              {examiners.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.email})
                </option>
              ))}
            </select>

            <select
              className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none"
              value={assignRoleCode}
              onChange={(e) => setAssignRoleCode(e.target.value)}
              disabled={!assignSessionId}
            >
              <option value="">
                {assignSessionId ? "Choisir un rôle" : "Choisis d'abord une session"}
              </option>
              {rolesForSelectedProgram.map((r) => (
                <option key={r.id} value={r.code}>
                  {r.label} ({r.code})
                </option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={assignGroupId} onChange={(e) => setAssignGroupId(e.target.value)}>
              <option value="">Choisir un groupe (optionnel)</option>
              {groupsForSelectedAssignSession.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <input type="number" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={assignPlannedHours} onChange={(e) => setAssignPlannedHours(e.target.value)} />

            <button onClick={handleAssignExaminerToStation} className="rounded-2xl bg-[#d74d45] px-4 py-3 font-semibold text-white">
              Créer l'affectation
            </button>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Enregistrer des heures examinateur">
          <div className="grid gap-3">
            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={attendanceExaminerId} onChange={(e) => setAttendanceExaminerId(e.target.value)}>
              <option value="">Choisir un examinateur</option>
              {examiners.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.email})
                </option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={attendanceSessionId} onChange={(e) => setAttendanceSessionId(e.target.value)}>
              <option value="">Choisir une session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={attendanceStationId} onChange={(e) => setAttendanceStationId(e.target.value)}>
              <option value="">Choisir une station (optionnel)</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={attendanceRoleCode} onChange={(e) => setAttendanceRoleCode(e.target.value)}>
              <option value="">Choisir un rôle</option>
              {examinerRoles.map((r) => (
                <option key={r.id} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>

            <input type="number" className="rounded-2xl border border-[#eadccf] bg-white px-4 py-3 outline-none" value={attendanceHoursDone} onChange={(e) => setAttendanceHoursDone(e.target.value)} />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={attendanceValidated} onChange={(e) => setAttendanceValidated(e.target.checked)} />
              Heures validées
            </label>

            <button onClick={handleCreateAttendanceLog} className="rounded-2xl bg-[#d74d45] px-4 py-3 font-semibold text-white">
              Enregistrer les heures
            </button>
          </div>
        </Panel>

        <Panel title="Vue d’ensemble">
          <div className="space-y-3">
            {stationAssignments.slice(0, 6).map((a) => {
              const examiner = profiles.find((p) => p.id === a.examiner_profile_id);
              const station = stations.find((s) => s.id === a.station_id);
              const session = sessions.find((s) => s.id === a.session_id);

              return (
                <div key={a.id} className="rounded-2xl bg-white p-4">
                  <p className="font-semibold">{examiner?.full_name || "Examinateur"}</p>
                  <p className="text-sm text-[#8d8278]">
                    {session?.title || "Session"} · {station?.name || "Sans station"}
                  </p>
                  <p className="text-sm text-[#8d8278]">
                    Rôle : {a.examiner_role_code} · Heures prévues : {a.planned_hours || 0}
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl border border-[#f0d7d4] bg-white px-4 py-3 text-sm text-[#7d4a46]">
          {message}
        </div>
      ) : null}
    </DashboardShell>
  );
}