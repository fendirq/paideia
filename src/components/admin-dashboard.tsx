"use client";

interface WaitlistEntry {
  id: string;
  phone: string;
  createdAt: string;
}

interface UserEntry {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  createdAt: string;
}

interface AdminDashboardProps {
  waitlistEntries: WaitlistEntry[];
  users: UserEntry[];
}

function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: string | null }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-red-500/20 text-red-300",
    TEACHER: "bg-blue-500/20 text-blue-300",
    STUDENT: "bg-accent/20 text-accent-light",
  };
  const cls = role ? styles[role] ?? "bg-[rgba(168,152,128,0.08)] text-text-muted" : "bg-[rgba(168,152,128,0.08)] text-text-muted";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {role ?? "—"}
    </span>
  );
}

export function AdminDashboard({ waitlistEntries, users }: AdminDashboardProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Admin Dashboard
        </h1>

        {/* Waitlist */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold text-text-primary">Waitlist</h2>
            <span className="text-xs text-text-muted bg-[rgba(168,152,128,0.14)] px-2.5 py-0.5 rounded-full">
              {waitlistEntries.length}
            </span>
          </div>

          {waitlistEntries.length === 0 ? (
            <p className="text-text-muted text-sm">No waitlist entries yet.</p>
          ) : (
            <div className="bg-bg-surface border border-bg-elevated rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(168,152,128,0.12)]">
                    <th className="text-left px-5 py-3 text-text-muted font-display text-xs uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="text-left px-5 py-3 text-text-muted font-display text-xs uppercase tracking-wide">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-[rgba(168,152,128,0.12)] last:border-0">
                      <td className="px-5 py-3 text-sm text-text-secondary font-mono">
                        {formatPhone(entry.phone)}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-muted">
                        {formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Users */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold text-text-primary">Users</h2>
            <span className="text-xs text-text-muted bg-[rgba(168,152,128,0.14)] px-2.5 py-0.5 rounded-full">
              {users.length}
            </span>
          </div>

          {users.length === 0 ? (
            <p className="text-text-muted text-sm">No users yet.</p>
          ) : (
            <div className="bg-bg-surface border border-bg-elevated rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[rgba(168,152,128,0.12)]">
                    <th className="text-left px-5 py-3 text-text-muted font-display text-xs uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left px-5 py-3 text-text-muted font-display text-xs uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-left px-5 py-3 text-text-muted font-display text-xs uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="text-left px-5 py-3 text-text-muted font-display text-xs uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-left px-5 py-3 text-text-muted font-display text-xs uppercase tracking-wide">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[rgba(168,152,128,0.12)] last:border-0">
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        {user.name || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        {user.email}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary font-mono">
                        {user.phone ? formatPhone(user.phone) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-3 text-sm text-text-muted">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
