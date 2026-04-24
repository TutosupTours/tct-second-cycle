import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Stethoscope,
  GraduationCap,
  School,
  CalendarDays,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

const roles = [
  { label: "Admin", href: "/login?role=admin", icon: ShieldCheck, color: "#d63b33" },
  { label: "BR", href: "/login?role=br", icon: Users, color: "#668b4e" },
  { label: "Examinateur", href: "/login?role=examinateur", icon: Stethoscope, color: "#efc24d" },
  { label: "Étudiant", href: "/login?role=student", icon: GraduationCap, color: "#ef9faa" }, // ✅ corrigé ici
  { label: "Faculté", href: "/login?role=faculty", icon: School, color: "#243b63" },
];

const missions = [
  { icon: CalendarDays, color: "#df7f7a", title: "Sessions & Inscriptions", text: "Consultez les sessions disponibles et inscrivez-vous facilement." },
  { icon: Users, color: "#8eab60", title: "Évaluations", text: "Suivez vos évaluations et vos progrès." },
  { icon: TrendingUp, color: "#efaaa5", title: "Suivi personnalisé", text: "Retrouvez votre parcours et vos résultats." },
  { icon: MessageCircle, color: "#9db965", title: "Accompagnement", text: "Accédez aux ressources et conseils." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf1df] text-[#2c2f4a]">
      <Decor />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="flex flex-col">
          <div className="mb-4 flex justify-center lg:justify-start">
            <div className="flex h-24 w-24 animate-[float_5s_ease-in-out_infinite] items-center justify-center rounded-full bg-white shadow-xl">
              <img src="/logo-tct.png" alt="Logo TCT" className="h-16 w-16 object-contain" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-xl font-bold tracking-[0.18em] text-[#6b9159] md:text-3xl">
              PÔLE 2ND CYCLE
            </p>

            <h1 className="mt-2 text-5xl font-semibold italic text-[#5f8950] md:text-7xl">
              Bienvenue
            </h1>

            <p className="mt-5 text-lg md:text-2xl">
              Plateforme de gestion des ECOS
              <br />
              et de l’accompagnement des externes
            </p>
          </div>

          <div className="mt-6 w-full max-w-md overflow-hidden rounded-[38px] shadow-2xl">
            <img src="/photo-equipe.jpg" alt="Équipe tutorat" className="h-[240px] w-full object-cover" />
          </div>

          <div className="mt-8 rounded-3xl border border-[#eadccf] bg-white/90 p-6 shadow-xl">
            <h2 className="mb-3 text-xl font-bold text-[#6b9159]">
              🌿 NOTRE MISSION
            </h2>

            <p className="mb-5 text-lg">
              Accompagner les externes du <strong>D2 au D4</strong>
              <br />
              vers la réussite aux ECOS.
            </p>

            <div className="space-y-4">
              {missions.map((mission) => (
                <Mission key={mission.title} {...mission} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center pb-20 lg:pb-0">
          <div className="w-full max-w-[470px] rounded-[34px] bg-white p-8 shadow-xl">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#668b4e] text-white">
                <Users className="h-8 w-8" />
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-[#2c2f4a]">
                  Connexion
                </h2>
                <p className="text-sm text-[#8b8177]">
                  Choisissez votre espace
                </p>
              </div>
            </div>

            <Link
              href="/login?role=student" // ✅ corrigé ici aussi
              className="block rounded-xl bg-[#668b4e] py-4 text-center font-semibold text-white"
            >
              Se connecter
            </Link>

            <div className="my-7 flex items-center gap-3 text-[#9c9187]">
              <div className="h-px flex-1 bg-[#e5ddd2]" />
              <span className="text-sm">Plateforme pour</span>
              <div className="h-px flex-1 bg-[#e5ddd2]" />
            </div>

            <div className="grid grid-cols-5 gap-3 text-center text-sm">
              {roles.map((role) => {
                const Icon = role.icon;

                return (
                  <Link key={role.label} href={role.href}>
                    <div
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <p className="mt-2 text-xs font-medium">
                      {role.label}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col items-center gap-3">
              <Link
                href="/activation"
                className="rounded-full border px-5 py-2 text-sm"
              >
                Activer mon compte étudiant
              </Link>

              <Link
                href="/signup"
                className="rounded-full px-5 py-3 text-sm bg-red-500 text-white"
              >
                Demande d’inscription
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Mission({ icon: Icon, color, title, text }: any) {
  return (
    <div className="flex gap-4">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div>
        <p className="font-semibold" style={{ color }}>
          {title}
        </p>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}

function Decor() {
  return null;
}