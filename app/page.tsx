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
  {
    title: "Sessions & Inscriptions",
    text: "Consultez les sessions disponibles et inscrivez-vous facilement.",
    icon: CalendarDays,
    color: "#df7f7a",
  },
  {
    title: "Évaluations",
    text: "Suivez vos évaluations et vos progrès.",
    icon: Users,
    color: "#8eab60",
  },
  {
    title: "Suivi personnalisé",
    text: "Retrouvez votre parcours et vos résultats année après année.",
    icon: TrendingUp,
    color: "#efaaa5",
  },
  {
    title: "Accompagnement",
    text: "Accédez aux ressources et conseils pour progresser.",
    icon: MessageCircle,
    color: "#9db965",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf1df] text-[#2c2f4a]">
      <Decor />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="flex flex-col">
          <div className="mb-6 flex justify-center lg:justify-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md md:h-28 md:w-28">
              <img src="/logo-tct.png" alt="TCT" className="h-16 w-16 object-contain md:h-20 md:w-20" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-xl font-bold tracking-[0.18em] text-[#6b9159] md:text-3xl">
              PÔLE 2ND CYCLE
            </p>
            <h1 className="mt-2 text-5xl font-semibold italic leading-none text-[#5f8950] md:text-7xl">
              Bienvenue
            </h1>
            <p className="mt-5 text-lg leading-snug md:text-2xl">
              Plateforme de gestion des ECOS
              <br />
              et de l’accompagnement des externes
            </p>
          </div>

          <div className="relative mx-auto mt-8 w-full max-w-3xl overflow-hidden rounded-[34px] md:rounded-[42px]">
            <img
              src="/photo-equipe.jpg"
              alt="Équipe tutorat"
              className="h-[230px] w-full object-cover md:h-[340px]"
            />
          </div>

          <div className="mt-8 grid gap-5 pb-24 lg:pb-10">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#6b9159] md:text-2xl">
                <span>🌿</span> NOTRE MISSION
              </h2>
              <p className="mt-3 text-lg leading-snug md:text-2xl">
                Accompagner les externes du <strong>D2 au D4</strong>
                <br />
                vers la réussite aux ECOS.
              </p>
            </div>

            {missions.map((mission) => (
              <Mission key={mission.title} {...mission} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center pb-24 lg:pb-0">
          <div className="w-full max-w-[470px] rounded-[28px] bg-white/95 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur md:p-9">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#668b4e] text-white md:h-16 md:w-16">
                <Users className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              <h2 className="text-2xl font-semibold md:text-3xl">Connexion</h2>
            </div>

            <div className="space-y-4">
              <input
                disabled
                placeholder="Identifiant"
                className="w-full rounded-xl border border-[#e7dfd4] bg-white px-4 py-4 text-[#2c2f4a]"
              />
              <input
                disabled
                placeholder="Mot de passe"
                className="w-full rounded-xl border border-[#e7dfd4] bg-white px-4 py-4 text-[#2c2f4a]"
              />
              <Link
                href="/login?role=etudiant"
                className="mx-auto block w-full rounded-xl bg-[#668b4e] py-4 text-center font-semibold text-white md:w-[70%]"
              >
                Se connecter
              </Link>
            </div>

            <div className="my-8 flex items-center gap-3 text-[#9c9187]">
              <div className="h-px flex-1 bg-[#e5ddd2]" />
              <span className="whitespace-nowrap text-sm">Plateforme pour</span>
              <div className="h-px flex-1 bg-[#e5ddd2]" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm sm:grid-cols-5">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Link key={role.label} href={role.href} className="group">
                    <div
                      className="mx-auto flex h-13 w-13 items-center justify-center rounded-full text-white shadow-sm transition group-hover:scale-105 md:h-14 md:w-14"
                      style={{ backgroundColor: role.color }}
                    >
                      <Icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <p className="mt-2 text-[#2c2f4a]">{role.label}</p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <Link href="/activation" className="text-sm font-medium text-[#668b4e] underline">
                Activer mon compte étudiant
              </Link>
            </div>
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 text-2xl italic text-[#6b9159] md:block">
          Ensemble, vers la réussite. <span className="text-[#cf3a33]">♥</span>
        </p>
      </section>
    </main>
  );
}

function Mission({
  icon: Icon,
  color,
  title,
  text,
}: {
  icon: any;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 md:gap-5">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white md:h-16 md:w-16"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-7 w-7 md:h-8 md:w-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold md:text-xl" style={{ color }}>
          {title}
        </h3>
        <p className="text-base leading-snug text-[#4d4945] md:text-lg">{text}</p>
      </div>
    </div>
  );
}

function Decor() {
  return (
    <>
      <div className="pointer-events-none absolute -left-28 -top-28 z-0 h-72 w-72 rounded-full bg-[#cf3a33]" />
      <div className="pointer-events-none absolute -right-28 -top-28 z-0 h-72 w-72 rounded-full bg-[#cf3a33]" />

      <div className="pointer-events-none absolute bottom-[-160px] left-[-120px] z-0 h-80 w-[520px] rounded-[50%] bg-[#cf3a33]" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-140px] z-0 h-80 w-[560px] rounded-[50%] bg-[#6c8f52]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[36%] z-0 hidden h-56 w-[580px] rounded-[50%] bg-[#eeb0ad]/55 md:block" />
      <div className="pointer-events-none absolute bottom-[-130px] right-[18%] z-0 hidden h-44 w-[420px] rounded-[50%] bg-[#b6cf75]/60 md:block" />
    </>
  );
}