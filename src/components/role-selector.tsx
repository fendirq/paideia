"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const SUBJECTS = [
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "ENGLISH", label: "English" },
  { value: "HISTORY", label: "History" },
  { value: "SCIENCE", label: "Science" },
  { value: "MANDARIN", label: "Mandarin" },
  { value: "HUMANITIES", label: "Humanities" },
  { value: "OTHER", label: "Other" },
] as const;

const GRADES = [
  { value: "11", label: "Grade 11" },
  { value: "12", label: "Grade 12" },
  { value: "Freshman", label: "Freshman" },
  { value: "Sophomore", label: "Sophomore" },
  { value: "Junior", label: "Junior" },
  { value: "Senior", label: "Senior" },
] as const;

export function RoleSelector() {
  const { update: updateSession } = useSession();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | null>(null);
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleSubject(value: string) {
    setSubjects((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSubmit() {
    if (!selectedRole) return;
    if (!school.trim()) {
      setError("School name is required");
      return;
    }
    if (selectedRole === "STUDENT" && !grade) {
      setError("Please select your grade");
      return;
    }
    if (selectedRole === "TEACHER" && subjects.length === 0) {
      setError("Select at least one subject");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          school: school.trim(),
          ...(selectedRole === "STUDENT" ? { grade } : { subjectsTaught: subjects }),
        }),
      });

      if (res.ok || res.status === 409) {
        // Trigger the JWT callback with `trigger="update"` so auth.ts
        // bypasses the null-role cooldown and picks up the freshly-
        // saved role. A plain GET to /api/auth/session passes
        // `trigger=undefined` and would land inside the cooldown,
        // bouncing fast onboarders back here for up to 10s.
        await updateSession();
        window.location.href = selectedRole === "TEACHER" ? "/app/teacher" : "/app";
      } else {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // Step 1: Role selection
  if (!selectedRole) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="grid grid-cols-2 gap-5 w-full">
          <button
            onClick={() => setSelectedRole("STUDENT")}
            className="bg-[rgba(40,32,24,0.55)] backdrop-blur-[20px] border border-[rgba(168,152,128,0.15)] rounded-[20px] p-8 text-center transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] group"
            style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <svg
              className="w-12 h-12 mx-auto mb-4 text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
              />
            </svg>
            <span className="font-display font-semibold text-[16px] text-text-primary">
              Student
            </span>
          </button>

          <button
            onClick={() => setSelectedRole("TEACHER")}
            className="bg-[rgba(40,32,24,0.55)] backdrop-blur-[20px] border border-[rgba(168,152,128,0.15)] rounded-[20px] p-8 text-center transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] group"
            style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <svg
              className="w-12 h-12 mx-auto mb-4 text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span className="font-display font-semibold text-[16px] text-text-primary">
              Teacher
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Role-specific details
  return (
    <div className="w-full max-w-md space-y-5">
      <button
        onClick={() => { setSelectedRole(null); setError(""); }}
        className="text-text-muted hover:text-text-primary text-sm transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      <div className="bg-[rgba(40,32,24,0.55)] backdrop-blur-[20px] border border-[rgba(168,152,128,0.15)] rounded-[20px] p-8 space-y-5">
        <h3 className="font-display font-semibold text-lg text-text-primary">
          {selectedRole === "STUDENT" ? "Student Details" : "Teacher Details"}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="School name"
            className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />

          {selectedRole === "STUDENT" && (
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors appearance-none"
            >
              <option value="" className="bg-bg-surface text-text-muted">Select grade</option>
              {GRADES.map((g) => (
                <option key={g.value} value={g.value} className="bg-bg-surface text-text-primary">
                  {g.label}
                </option>
              ))}
            </select>
          )}

          {selectedRole === "TEACHER" && (
            <div className="space-y-2">
              <p className="text-text-secondary text-[13px]">Subjects you teach</p>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSubject(s.value)}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                      subjects.includes(s.value)
                        ? "bg-accent/20 border-accent/40 text-accent-light"
                        : "bg-[rgba(35,28,20,0.50)] border-[rgba(168,152,128,0.15)] text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-[13px]">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-light text-[#281c14] font-display text-[14px] font-semibold rounded-xl px-5 py-3.5 transition-colors disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
