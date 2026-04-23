import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Stethoscope,
  GraduationCap,
  School,
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

export default function HomePage() {
  const roles = [
    { label: "Admin", href: "/login?role=admin", icon: ShieldCheck, color: "#d63b33" },
    { label: "BR", href: "/login?role=br", icon: Users, color: "#668b4e" },
    { label: "Examinateur", href: "/login?role=examinateur", icon: Stethoscope, color: "#efc24d" },
    { label: "Étudiant", href: "/login?role=etudiant", icon: GraduationCap, color: "#ef9faa" },
    { label: "Faculté", href: "/login?role=faculty", icon: School, color: "#243b63" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf1df] text-[#2c2f4a]">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#cf3a33]" />
      <div className="absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-[#cf3a33]" />
      <div className="absolute bottom-[-90px] left-[-60px] h-72 w-[460px] rounded-[100%] bg-[#cf3a33]" />
      <div className="absolute bottom-[-110px] right-[-80px] h-72 w-[520px] rounded-[100%] bg-[#6c8f52]" />
      <div className="absolute bottom-[-60px] left-[30%] h-40 w-[520px] rounded-[100%] bg-[#eeb0ad]/60" />

      <section className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-8 px-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-8 flex justify-center lg:justify-start">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-md">
              <img src="/logo-tct.png" alt="TCT" className="h-20 w-20 object-contain" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-3xl font-bold tracking-[0.2em] text-[#6b9159]">
              PÔLE 2ND CYCLE
            </p>
            <h1 className="mt-2 text-7xl font-semibold italic leading-none text-[#5f8950]">
              Bienvenue
            </h1>
            <p className="mt-6 text-2xl leading-snug text-[#2c2f4a]">
              Plateforme de gestion des ECOS
              <br />
              et de l’accompagnement des externes
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-[42%_58%_45%_55%/48%_45%_55%_52%]">
            <img
              src="/photo-equipe.jpg"
              alt="Équipe tutorat"
              className="h-[360px] w-full object-cover"
            />
          </div>

          <div className="mt-10 grid gap-5">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#6b9159]">
                <span>🌿</span> NOTRE MISSION
              </h2>
              <p className="mt-3 text-xl leading-snug">
                Accompagner les externes du <strong>D2 au D4</strong>
                <br />
                vers la réussite aux ECOS.
              </p>
            </div>

            <Mission icon={CalendarDays} color="#df7f7a" title="Sessions & Inscriptions">
              Consultez les sessions disponibles et inscrivez-vous facilement.
            </Mission>
            <Mission icon={Users} color="#8eab60" title="Évaluations">
              Suivez vos évaluations et vos progrès.
            </Mission>
            <Mission icon={TrendingUp} color="#efaaa5" title="Suivi personnalisé">
              Retrouvez votre parcours et vos résultats année après année.
            </Mission>
            <Mission icon={MessageCircle} color="#9db965" title="Accompagnement">
              Accédez aux ressources et conseils pour progresser.
            </Mission>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[470px] rounded-[28px] bg-white/90 p-9 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#668b4e] text-white">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-semibold">Connexion</h2>
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
                className="mx-auto block w-[70%] rounded-xl bg-[#668b4e] py-4 text-center font-semibold text-white"
              >
                Se connecter
              </Link>
            </div>

            <div className="my-8 flex items-center gap-3 text-[#9c9187]">
              <div className="h-px flex-1 bg-[#e5ddd2]" />
              <span>Plateforme pour</span>
              <div className="h-px flex-1 bg-[#e5ddd2]" />
            </div>

            <div className="grid grid-cols-5 gap-4 text-center text-sm">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Link key={role.label} href={role.href} className="group">
                    <div
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm transition group-hover:scale-105"
                      style={{ backgroundColor: role.color }}
                    >
                      <Icon className="h-7 w-7" />
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

        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-2xl italic text-[#6b9159]">
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
  children,
}: {
  icon: any;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold" style={{ color }}>
          {title}
        </h3>
        <p className="text-base leading-snug text-[#4d4945]">{children}</p>
      </div>
    </div>
  );
}