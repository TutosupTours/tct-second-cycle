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
  { label: "Étudiant", href: "/login?role=etudiant", icon: GraduationCap, color: "#ef9faa" },
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

          <div className="mt-6 w-full max-w-md overflow-hidden rounded-[38px] shadow-2xl transition duration-500 hover:-translate-y-1 hover:scale-[1.02]">
            <img
              src="/photo-equipe.jpg"
              alt="Équipe tutorat"
              className="h-[240px] w-full object-cover"
            />
          </div>

          <div className="mt-8 rounded-3xl border border-[#eadccf] bg-white/90 p-6 shadow-xl backdrop-blur">
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
          <div className="w-full max-w-[470px] rounded-[34px] border border-white/70 bg-white/95 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur transition duration-500 hover:-translate-y-1">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#668b4e] text-white shadow-lg">
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

            <div className="space-y-4">
              <input
                disabled
                value=""
                aria-label="Identifiant"
                placeholder="Identifiant"
                className="w-full rounded-xl border border-[#e7dfd4] bg-white px-4 py-4 text-[#2c2f4a] placeholder:text-[#8b8177]"
              />

              <input
                disabled
                value=""
                aria-label="Mot de passe"
                placeholder="Mot de passe"
                className="w-full rounded-xl border border-[#e7dfd4] bg-white px-4 py-4 text-[#2c2f4a] placeholder:text-[#8b8177]"
              />

              <Link
                href="/login?role=etudiant"
                className="block rounded-xl bg-[#668b4e] py-4 text-center font-semibold shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{ color: "#ffffff" }}
              >
                Se connecter
              </Link>
            </div>

            <div className="my-7 flex items-center gap-3 text-[#9c9187]">
              <div className="h-px flex-1 bg-[#e5ddd2]" />
              <span className="whitespace-nowrap text-sm">
                Plateforme pour
              </span>
              <div className="h-px flex-1 bg-[#e5ddd2]" />
            </div>

            <div className="grid grid-cols-5 gap-3 text-center text-sm">
              {roles.map((role) => {
                const Icon = role.icon;

                return (
                  <Link key={role.label} href={role.href} className="group">
                    <div
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-xl"
                      style={{ backgroundColor: role.color, color: "#ffffff" }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <p className="mt-2 text-xs font-medium text-[#2c2f4a]">
                      {role.label}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col items-center gap-3 text-center">
              <Link
                href="/activation"
                className="rounded-full border border-[#cfe3bf] bg-[#edf5e6] px-5 py-2 text-sm font-bold shadow-sm transition hover:scale-105 hover:shadow-md"
                style={{ color: "#2f4d1f" }}
              >
                Activer mon compte étudiant
              </Link>

              <Link
                href="/signup"
                className="rounded-full px-5 py-3 text-sm font-bold shadow-lg animate-pulse transition hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: "#cf332b", color: "#ffffff" }}
              >
                Demande d’inscription
              </Link>
            </div>
          </div>
        </div>

        <p className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-xl italic text-[#6b9159] md:block">
          Ensemble, vers la réussite <span className="text-[#cf3a33]">♥</span>
        </p>
      </section>
    </main>
  );
}

function Mission({ icon: Icon, color, title, text }: any) {
  return (
    <div className="group flex gap-4 rounded-2xl p-2 transition hover:bg-[#fbf1df]">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md transition group-hover:scale-110"
        style={{ backgroundColor: color, color: "#ffffff" }}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div>
        <p className="font-semibold" style={{ color }}>
          {title}
        </p>
        <p className="text-sm leading-snug text-[#4d4945]">{text}</p>
      </div>
    </div>
  );
}

function Decor() {
  return (
    <>
      <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#cf3a33] opacity-90" />
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#cf3a33] opacity-90" />
      <div className="pointer-events-none absolute bottom-[-150px] left-[-120px] h-80 w-[540px] rounded-[50%] bg-[#cf3a33] opacity-90" />
      <div className="pointer-events-none absolute bottom-[-170px] right-[-130px] h-80 w-[580px] rounded-[50%] bg-[#6c8f52] opacity-90" />
      <div className="pointer-events-none absolute bottom-[-105px] left-[34%] hidden h-52 w-[600px] rounded-[50%] bg-[#eeb0ad]/60 md:block" />
      <div className="pointer-events-none absolute bottom-[-125px] right-[20%] hidden h-44 w-[430px] rounded-[50%] bg-[#b6cf75]/55 md:block" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
}