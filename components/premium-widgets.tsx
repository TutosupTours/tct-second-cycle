"use client";

export function PresenceBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    present: "bg-green-100 text-green-700 border-green-200",
    absent: "bg-red-100 text-red-700 border-red-200",
    late: "bg-orange-100 text-orange-700 border-orange-200",
    excused: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const labels: Record<string, string> = {
    present: "Présent",
    absent: "Absent",
    late: "Retard",
    excused: "Excusé",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status || "absent"] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {labels[status || "absent"] || "Non renseigné"}
    </span>
  );
}

export function PlanningCard({
  title,
  date,
  subtitle,
  tag,
}: {
  title: string;
  date?: string;
  subtitle?: string;
  tag?: string;
}) {
  const d = date ? new Date(date) : null;

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-[#eee3d7]">
      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2c2f4a]">
        <span className="text-xs font-semibold uppercase">
          {d ? d.toLocaleDateString("fr-FR", { month: "short" }) : "--"}
        </span>
        <span className="text-2xl font-bold">
          {d ? d.getDate() : "--"}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#2c2f4a]">{title}</p>
        {date ? (
          <p className="text-sm text-[#7c736a]">
            {new Date(date).toLocaleString("fr-FR")}
          </p>
        ) : null}
        {subtitle ? <p className="text-sm text-[#7c736a]">{subtitle}</p> : null}
        {tag ? (
          <span className="mt-2 inline-flex rounded-full bg-[#f5efe6] px-3 py-1 text-xs font-semibold text-[#2c2f4a]">
            {tag}
          </span>
        ) : null}
      </div>
    </div>
  );
}