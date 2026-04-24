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

      <section className="relative z-10 mx-auto min-h-screen max-w-7xl px-6 py-8">

        {/* HEADER */}
        <header className="flex flex-col items-center text-center">

          <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-2xl">
            <img src="/logo-tct.png" className="h-24 w-24 object-contain" />
          </div>

          <p className="text-3xl font-bold tracking-[0.22em] text-[#6b9159]">
            PÔLE 2ND CYCLE
          </p>

          <h1 className="mt-2 text-6xl font-semibold italic text-[#5f8950]">
            Bienvenue
          </h1>

          <p className="mt-4 text-xl">
            Plateforme de gestion des ECOS
            <br />
            et de l’accompagnement des externes
          </p>

        </header>

        {/* CONTENU */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">

          {/* GAUCHE */}
          <div className="flex flex-col items-center lg:items-start">

            <div className="w-full max-w-xl overflow-hidden rounded-[40px] border-8 border-white shadow-2xl transition hover:scale-[1.02]">
              <img src="/photo-equipe.jpg" className="h-[340px] w-full object-cover" />
            </div>

            <div className="mt-8 w-full max-w-xl bg-white/95 p-6 rounded-3xl shadow-xl">

              <h2 className="text-xl font-bold text-[#6b9159] mb-3">
                🌿 NOTRE MISSION
              </h2>

              <p className="mb-4">
                Accompagner les externes du <strong>D2 au D4</strong> vers la réussite aux ECOS.
              </p>

              <div className="space-y-3">
                {missions.map((m) => (
                  <Mission key={m.title} {...m} />
                ))}
              </div>

            </div>

          </div>

          {/* DROITE */}
          <div className="flex items-center justify-center">

            <div className="w-full max-w-md bg-white/95 p-8 rounded-3xl shadow-2xl">

              <h2 className="text-2xl font-semibold mb-6 text-[#2c2f4a]">
                Connexion
              </h2>

              <div className="space-y-4">
                <input disabled placeholder="Identifiant" className="w-full p-3 border rounded-xl text-[#2c2f4a]" />
                <input disabled placeholder="Mot de passe" className="w-full p-3 border rounded-xl text-[#2c2f4a]" />

                <Link
                  href="/login?role=etudiant"
                  className="block text-center bg-[#668b4e] text-white p-3 rounded-xl font-semibold"
                  style={{ color: "#ffffff" }}
                >
                  Se connecter
                </Link>
              </div>

              <div className="my-6 flex items-center gap-3 text-[#9c9187]">
                <div className="h-px flex-1 bg-[#e5ddd2]" />
                Plateforme pour
                <div className="h-px flex-1 bg-[#e5ddd2]" />
              </div>

              {/* PASTILLES */}
              <div className="grid grid-cols-5 gap-3 text-center text-sm">
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <Link key={r.label} href={r.href}>
                      <div
                        className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white shadow-md"
                        style={{ background: r.color, color: "#ffffff" }}
                      >
                        <Icon size={18} />
                      </div>
                      <p className="mt-1 text-[#2c2f4a]">{r.label}</p>
                    </Link>
                  );
                })}
              </div>

              {/* BOUTONS CORRIGÉS */}
              <div className="mt-6 flex flex-col items-center gap-3">

                <Link
                  href="/activation"
                  className="home-link-green px-4 py-2 rounded-full bg-[#edf5e6] border border-[#cfe3bf] font-semibold shadow-sm"
                >
                  Activer mon compte étudiant
                </Link>

                <Link
                  href="/signup"
                  className="home-link-red px-4 py-2 rounded-full font-semibold animate-pulse shadow-lg"
                  style={{ backgroundColor: "#cf332b" }}
                >
                  Demande d’inscription
                </Link>

              </div>

            </div>

          </div>

        </div>

        <p className="mt-10 text-center text-lg italic text-[#6b9159]">
          Ensemble, vers la réussite ❤️
        </p>

      </section>
    </main>
  );
}

/* COMPONENT */

function Mission({ icon: Icon, color, title, text }: any) {
  return (
    <div className="flex gap-3">
      <div
        className="w-10 h-10 flex items-center justify-center rounded-full text-white"
        style={{ background: color, color: "#ffffff" }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="font-semibold" style={{ color }}>{title}</p>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}

function Decor() {
  return (
    <>
      <div className="absolute -left-28 -top-28 h-72 w-72 bg-[#cf3a33] rounded-full" />
      <div className="absolute -right-28 -top-28 h-72 w-72 bg-[#cf3a33] rounded-full" />
      <div className="absolute bottom-[-150px] left-[-120px] h-80 w-[540px] bg-[#cf3a33] rounded-full" />
      <div className="absolute bottom-[-170px] right-[-130px] h-80 w-[580px] bg-[#6c8f52] rounded-full" />
    </>
  );
}