"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

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

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  role: string | null;
  subjectsTaught: string[];
  hasSubscription: boolean;
  hasBillingPortal: boolean;
  hasPassword: boolean;
  createdAt: string;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  studentCount?: number;
}

interface ProfileFormProps {
  initialData: ProfileData;
  enrolledClasses: ClassInfo[];
  teacherClasses: ClassInfo[];
}

export function ProfileForm({ initialData, enrolledClasses, teacherClasses }: ProfileFormProps) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [school, setSchool] = useState(initialData.school);
  const [grade, setGrade] = useState(initialData.grade);
  const [subjects, setSubjects] = useState<string[]>(initialData.subjectsTaught);
  const isStudent = initialData.role === "STUDENT";
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Password change
  const [showPassword, setShowPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  // Billing
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  function toggleSubject(value: string) {
    setSubjects((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isStudent ? { email, grade } : { name, school, subjectsTaught: subjects }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMessage("Passwords don't match");
      return;
    }
    if (newPw.length < 8) {
      setPwMessage("Password must be at least 8 characters");
      return;
    }

    setPwLoading(true);
    setPwMessage("");

    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPwMessage(data.error || "Failed to change password");
      } else {
        setPwMessage("Password changed successfully");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setShowPassword(false);
      }
    } catch {
      setPwMessage("Something went wrong");
    } finally {
      setPwLoading(false);
    }
  }

  async function openBillingPortal() {
    setBillingLoading(true);
    setBillingError("");
    try {
      const res = await fetch("/api/profile/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBillingError(data.error || "Failed to open billing portal");
      }
    } catch {
      setBillingError("Something went wrong. Please try again.");
    } finally {
      setBillingLoading(false);
    }
  }

  const roleLabel = initialData.role
    ? initialData.role.charAt(0) + initialData.role.slice(1).toLowerCase()
    : "Unknown";

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <section className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5 space-y-4">
        <h2 className="font-display font-semibold text-[15px] text-text-primary">Account</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-text-muted mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isStudent}
              className={`w-full rounded-[10px] px-3 py-2.5 text-[14px] transition-colors ${
                isStudent
                  ? "bg-bg-surface/30 border border-[rgba(168,152,128,0.12)] text-text-muted cursor-not-allowed"
                  : "bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] text-text-primary focus:outline-none focus:border-accent/50"
              }`}
            />
          </div>
          <div>
            <label className="text-[12px] text-text-muted mb-1 block">Email</label>
            <input
              type="email"
              value={isStudent ? email : initialData.email}
              onChange={isStudent ? (e) => setEmail(e.target.value) : undefined}
              disabled={!isStudent}
              className={`w-full rounded-[10px] px-3 py-2.5 text-[14px] transition-colors ${
                isStudent
                  ? "bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] text-text-primary focus:outline-none focus:border-accent/50"
                  : "bg-bg-surface/30 border border-[rgba(168,152,128,0.12)] text-text-muted cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-text-muted mb-1 block">School</label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              disabled={isStudent}
              className={`w-full rounded-[10px] px-3 py-2.5 text-[14px] transition-colors ${
                isStudent
                  ? "bg-bg-surface/30 border border-[rgba(168,152,128,0.12)] text-text-muted cursor-not-allowed"
                  : "bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] text-text-primary focus:outline-none focus:border-accent/50"
              }`}
            />
          </div>
          <div>
            <label className="text-[12px] text-text-muted mb-1 block">Role</label>
            <input
              type="text"
              value={roleLabel}
              disabled
              className="w-full bg-bg-surface/30 border border-[rgba(168,152,128,0.12)] rounded-[10px] px-3 py-2.5 text-[14px] text-text-muted cursor-not-allowed"
            />
          </div>
        </div>

        {initialData.role === "STUDENT" && (
          <div>
            <label className="text-[12px] text-text-muted mb-1 block">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] px-3 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors appearance-none"
            >
              <option value="">Select grade</option>
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        )}

        {initialData.role === "TEACHER" && (
          <div>
            <label className="text-[12px] text-text-muted mb-1 block">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleSubject(s.value)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
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

        {error && <p className="text-red-400 text-[13px]">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[13px] font-semibold rounded-[10px] px-5 py-2.5 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </section>

      {/* Classes */}
      {initialData.role === "STUDENT" && enrolledClasses.length > 0 && (
        <section className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5">
          <h2 className="font-display font-semibold text-[15px] text-text-primary mb-3">Enrolled Classes</h2>
          <div className="space-y-2">
            {enrolledClasses.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[rgba(168,152,128,0.12)] last:border-0">
                <span className="text-[14px] text-text-primary">{c.name}</span>
                <span className="text-[12px] text-text-muted">
                  {c.subject.charAt(0) + c.subject.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {initialData.role === "TEACHER" && teacherClasses.length > 0 && (
        <section className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5">
          <h2 className="font-display font-semibold text-[15px] text-text-primary mb-3">Your Classes</h2>
          <div className="space-y-2">
            {teacherClasses.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[rgba(168,152,128,0.12)] last:border-0">
                <span className="text-[14px] text-text-primary">{c.name}</span>
                <span className="text-[12px] text-text-muted">{c.studentCount} students</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Password */}
      {initialData.hasPassword && (
        <section className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5">
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="font-display font-semibold text-[15px] text-text-primary flex items-center gap-2"
          >
            Change Password
            <svg className={`w-4 h-4 transition-transform ${showPassword ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showPassword && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current password"
                className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                required
              />
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                required
              />
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                required
              />
              {pwMessage && (
                <p className={`text-[13px] ${pwMessage.includes("success") ? "text-accent" : "text-red-400"}`}>
                  {pwMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                className="bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[13px] font-semibold rounded-[10px] px-5 py-2.5 transition-colors disabled:opacity-50"
              >
                {pwLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          )}
        </section>
      )}

      {/* Subscription — hidden for students */}
      {!isStudent && (
        <section className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5">
          <h2 className="font-display font-semibold text-[15px] text-text-primary mb-3">Subscription</h2>
          {initialData.hasSubscription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-accent/[0.12] text-accent-light text-[12px] font-display font-medium">
                  Active
                </span>
                <span className="text-[14px] text-text-secondary">Level 2 — $35/month</span>
              </div>
              {initialData.hasBillingPortal && (
                <button
                  onClick={openBillingPortal}
                  disabled={billingLoading}
                  className="text-[13px] text-accent hover:text-accent-light transition-colors disabled:opacity-50"
                >
                  {billingLoading ? "Opening..." : "Manage Subscription"}
                </button>
              )}
              {billingError && <p className="text-red-400 text-[13px] mt-2">{billingError}</p>}
            </div>
          ) : (
            <p className="text-[14px] text-text-muted">No active subscription.</p>
          )}
        </section>
      )}

      {/* Sign out */}
      <button
        onClick={() => {
          signOut({ callbackUrl: "/api/auth/signout-cleanup" });
        }}
        className="w-full text-center py-3 text-[14px] text-text-muted hover:text-red-400 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
