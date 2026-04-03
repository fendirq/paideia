import Link from "next/link";

const SUBJECT_COLORS: Record<string, string> = {
  MATHEMATICS: "#5b9bd5",
  ENGLISH: "#c57bdb",
  HISTORY: "#e8a838",
  SCIENCE: "#4a9d5b",
  MANDARIN: "#e87838",
  HUMANITIES: "#d4a574",
  OTHER: "#a39e98",
};

interface ClassItem {
  id: string;
  subject: string;
  unitName: string;
  teacherName: string;
  _count: { sessions: number };
}

interface ClassGridProps {
  classes: ClassItem[];
}

export function ClassGrid({ classes }: ClassGridProps) {
  return (
    <div className="relative z-10">
      {/* Glass scrim over video */}
      <div className="bg-bg-base/55 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-display font-bold text-2xl text-text-primary mb-8">
            Your Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => {
              const color = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.OTHER;
              return (
                <Link
                  key={cls.id}
                  href={`/app/inquiry/${cls.id}`}
                  className="group relative glass rounded-2xl p-6 transition-all hover:-translate-y-0.5"
                >
                  <div
                    className="absolute top-0 left-4 right-4 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-lg">
                        {cls.unitName}
                      </h3>
                      <p className="text-text-secondary text-sm mt-1">
                        {cls.teacherName}
                      </p>
                      <p className="text-text-muted text-xs mt-2">
                        {cls._count.sessions} session{cls._count.sessions !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {classes.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-text-muted mb-3">No classes yet.</p>
              <Link href="/app/upload" className="text-accent text-sm hover:text-accent-light transition-colors">
                Upload coursework to get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
