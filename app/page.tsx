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
  Sparkles,
} from "lucide-react";

const roles = [
  { label: "Admin", href: "/login?role=admin", icon: ShieldCheck, color: "#d63b33" },
  { label: "BR", href: "/login?role=br", icon: Users, color: "#668b4e" },
  { label: "Examinateur", href: "/login?role=examinateur", icon: Stethoscope, color: "#efc24d" },
  { label: "Étudiant", href: "/login?role=etudiant", icon: GraduationCap, color: "#ef9faa" },
  { label: "Faculté", href: "/login?role=faculty", icon: School, color: "#243b63" },
];

const missions = [
  { icon: CalendarDays, color: "#df7f7a", title: "Sessions & inscriptions", text: "Organisation fluide des sessions ECOS et gestion des inscriptions." },
  { icon: Users, color: "#8eab60", title: "Évaluations", text: "Grilles, retours personnalisés et suivi des progrès." },
  { icon: TrendingUp, color: "#efaaa5", title: "Suivi personnalisé", text: "Parcours étudiant, présence, résultats et progression." },
  { icon: MessageCircle, color: "#9db965", title: "Accompagnement", text: "Un outil pensé pour soutenir les externes du D2 au D4." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf1df] text-[#2c2f4a]">
      <Decor />

      <section className="relative z-10 mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10">
        <header className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-5 flex h-36 w-36 animate-[float_5s_ease-in-out_infinite] items-center justify-center rounded-full bg-white shadow-[0_25px_70px_rgba(0,0,0,0.16)] ring-8 ring-white/60 md:h-44 md:w-44">
            <img src="/logo-tct.png" alt="Logo TCT" className="h-28 w-28 object-contain md:h-36 md:w-36" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-bold text-[#6b9159] shadow-sm">
            <Sparkles className="h-4 w-4" />
            Plateforme ECOS · Second Cycle
          </div>

          <p className="mt-5 text-2xl font-black tracking-[0.22em] text-[#6b9159] md:text-4xl">
            PÔLE 2ND CYCLE
          </p>

          <h1 className="mt-2 text-6xl font-semibold italic leading-none text-[#5f8950] md:text-8xl">
            Bienvenue
          </h1>

          <p className="mt-5 max-w-3xl text-xl leading-snug md:text-3xl">
            Plateforme de gestion des ECOS
            <br />
            et de l’accompagnement des externes
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.07fr_0.93fr]">
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-xl">
              <div className="absolute -inset-3 rounded-[48px] bg-gradient-to-br from-[#cf332b]/25 via-white to-[#6b9159]/25 blur-xl" />
              <div className="relative overflow-hidden rounded-[44px] border-8 border-white bg-white shadow-[0_28px_80px_rgba(0,0,0,0.18)] transition duration-500 hover:-translate-y-1 hover:scale-[1.015]">
                <img
                  src="/photo-equipe.jpg"
                  alt="Équipe tutorat"
                  className="h-[360px] w-full object-cover md:h-[430px]"
                />
              </div>
            </div>

            <div className="relative mt-9 w-full max-w-xl">
              <div className="absolute -inset-2 rounded-[38px] bg-white/50 blur" />
              <div className="relative rounded-[36px] border border-[#eadccf] bg-white/95 p-7 shadow-[0_22px_60px_rgba(0,0,0,0.12)] backdrop-blur">
                <h2 className="mb-3 text-2xl font-black text-[#6b9159]">
                  🌿 Notre mission
                </h2>

                <p className="mb-6 text-lg leading-snug">
                  Accompagner les externes du <strong>D2 au D4</strong> vers la réussite aux ECOS.
                </p>

                <div className="space-y-4">
                  {missions.map((m) => (
                    <Mission key={m.title} {...m} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-center lg:pt-12">
            <div className="relative w-full max-w-[480px]">
              <div className="absolute -inset-3 rounded-[42px] bg-gradient-to-br from-[#668b4e]/25 via-white to-[#ef9faa]/25 blur-xl" />

              <div className="relative rounded-[38px] border border-white/80 bg-white/95 p-8 shadow-[0_30px_85px_rgba(0,0,0,0.18)] backdrop-blur">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#668b4e] text-white shadow-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#2c2f4a]">Connexion</h2>
                    <p className="text-sm text-[#8b8177]">Choisissez votre espace</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    disabled
                    placeholder="Identifiant"
                    className="w-full rounded-2xl border border-[#e7dfd4] bg-[#fffaf4] px-4 py-4 text-[#2c2f4a] placeholder:text-[#9a8f85]"
                  />
                  <input
                    disabled
                    placeholder="Mot de passe"
                    className="w-full rounded-2xl border border-[#e7dfd4] bg-[#fffaf4] px-4 py-4 text-[#2c2f4a] placeholder:text-[#9a8f85]"
                  />

                  <Link
                    href="/login?role=etudiant"
                    className="block rounded-2xl bg-[#668b4e] py-4 text-center font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ color: "#ffffff" }}
                  >
                    Se connecter
                  </Link>
                </div>

                <div className="my-7 flex items-center gap-3 text-[#9c9187]">
                  <div className="h-px flex-1 bg-[#e5ddd2]" />
                  <span className="whitespace-nowrap text-sm">Plateforme pour</span>
                  <div className="h-px flex-1 bg-[#e5ddd2]" />
                </div>

                <div className="grid grid-cols-5 gap-3 text-center text-sm">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    return (
                      <Link key={r.label} href={r.href} className="group">
                        <div
                          className="mx-auto flex h-13 w-13 items-center justify-center rounded-full text-white shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-xl"
                          style={{ backgroundColor: r.color, color: "#ffffff" }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className="mt-2 text-xs font-bold text-[#2c2f4a]">
                          {r.label}
                        </p>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link
                    href="/activation"
                    className="rounded-full border border-[#cfe3bf] bg-[#edf5e6] px-5 py-2 text-sm font-black shadow-sm transition hover:scale-105 hover:shadow-md"
                    style={{ color: "#2f4d1f" }}
                  >
                    Activer mon compte étudiant
                  </Link>

                  <Link
                    href="/signup"
                    className="rounded-full px-5 py-3 text-sm font-black shadow-lg transition hover:scale-105 hover:shadow-xl animate-pulse"
                    style={{ backgroundColor: "#cf332b", color: "#ffffff" }}
                  >
                    Demande d’inscription
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-12 pb-8 text-center text-xl italic text-[#6b9159]">
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
        <p className="font-black" style={{ color }}>{title}</p>
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