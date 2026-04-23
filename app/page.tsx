import Link from "next/link";

export default function HomePage() {
  const roles = [
    { label: "Étudiant", href: "/login?role=etudiant" },
    { label: "BR", href: "/login?role=br" },
    { label: "Examinateur", href: "/login?role=examinateur" },
    { label: "Admin", href: "/login?role=admin" },
    { label: "Faculté", href: "/login?role=faculty" },
  ];

  return (
    <main className="min-h-screen bg-[#f5efe6] flex items-center justify-center p-6">

      <div className="text-center w-full max-w-4xl">

        <h1 className="text-4xl font-bold mb-3">
          TCT Second Cycle
        </h1>

        <p className="mb-10 text-[#7c736a]">
          Plateforme ECOS – gestion des sessions, évaluations et suivi étudiant
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {roles.map((role) => (
            <Link
              key={role.label}
              href={role.href}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              {role.label}
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}