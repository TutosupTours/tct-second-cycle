"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell from "@/components/dashboard-shell";
import { GraduationCap, Plus, Search, UserCheck, UserX } from "lucide-react";
import Alert from "@/components/Alert";

type Student = {
  login_id: string;
  prenom: string;
  nom: string;
  email: string;
  phone: string;
  is_active: boolean;
  promotion: string;
  niveau: string;
};

const navItems = [
  { label: "Sessions", href: "/admin/sessions", icon: GraduationCap },
  { label: "Étudiants", href: "/admin/students", icon: UserCheck },
  { label: "Examinateurs", href: "/admin/examiners", icon: UserCheck },
  { label: "Faculté", href: "/admin/faculty", icon: UserCheck },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("nom");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      setMessage("Erreur lors du chargement des étudiants");
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStudentStatus(loginId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("students")
        .update({ is_active: !currentStatus })
        .eq("login_id", loginId);

      if (error) throw error;

      setStudents(students.map(student =>
        student.login_id === loginId
          ? { ...student, is_active: !currentStatus }
          : student
      ));

      setMessage(`Étudiant ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      setAlertType('success');
    } catch (error) {
      setMessage("Erreur lors de la mise à jour du statut");
      setAlertType('error');
    }
  }

  const filteredStudents = students.filter(student =>
    student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.login_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardShell
        roleLabel="Admin"
        userName="Admin"
        topColor="#d63b33"
        accentColor="#d63b33"
        lightAccent="#f8c9c7"
        navItems={navItems}
        activePath="/admin/students"
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Chargement...</div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      roleLabel="Admin"
      userName="Admin"
      topColor="#d63b33"
      accentColor="#d63b33"
      lightAccent="#f8c9c7"
      navItems={navItems}
      activePath="/admin/students"
    >
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2c2f4a]">Gestion des Étudiants</h1>
          <button className="flex items-center gap-2 rounded-lg bg-[#d63b33] px-4 py-2 text-white hover:bg-[#b82e26]">
            <Plus className="h-4 w-4" />
            Ajouter un étudiant
          </button>
        </div>

        {message && (
          <Alert
            type={alertType}
            message={message}
            onClose={() => setMessage("")}
          />
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#d63b33]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse rounded-lg bg-white shadow">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Prénom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Login ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Téléphone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Promotion</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.login_id} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-sm">{student.nom}</td>
                  <td className="px-4 py-3 text-sm">{student.prenom}</td>
                  <td className="px-4 py-3 text-sm font-mono">{student.login_id}</td>
                  <td className="px-4 py-3 text-sm">{student.email}</td>
                  <td className="px-4 py-3 text-sm">{student.phone}</td>
                  <td className="px-4 py-3 text-sm">{student.promotion}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      student.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {student.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => toggleStudentStatus(student.login_id, student.is_active)}
                      className={`rounded px-3 py-1 text-xs font-medium ${
                        student.is_active
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {student.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            Aucun étudiant trouvé
          </div>
        )}
      </div>
    </DashboardShell>
  );
}