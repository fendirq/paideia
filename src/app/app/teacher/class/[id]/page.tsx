"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentTable } from "@/components/teacher/student-table";
import { StatCard } from "@/components/stat-card";
import { BackButton } from "@/components/back-button";
import { AddMaterialForm } from "@/components/teacher/add-material-form";
import { MaterialCard } from "@/components/teacher/material-card";

interface StudentData {
  id: string;
  name: string | null;
  email: string;
  grade: string | null;
  sessionCount: number;
  totalDuration: number;
  totalMessages: number;
  lastActive: string | null;
}

interface ClassDetail {
  id: string;
  name: string;
  subject: string;
  period?: number | null;
  description: string | null;
  joinCode: string;
  _count: { enrollments: number; sessions: number };
}

export interface MaterialData {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  files: { id: string; fileName: string; fileType: string }[];
  _count: { sessions: number };
  createdAt: string;
}

export default function TeacherClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  const fetchMaterials = useCallback(async () => {
    const res = await fetch(`/api/teacher/classes/${classId}/materials`);
    if (res.ok) setMaterials(await res.json());
  }, [classId]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classRes, studentsRes] = await Promise.all([
          fetch(`/api/teacher/classes/${classId}`),
          fetch(`/api/teacher/classes/${classId}/students`),
        ]);

        if (!classRes.ok) {
          router.push("/app/teacher");
          return;
        }

        setClassData(await classRes.json());
        if (studentsRes.ok) setStudents(await studentsRes.json());
        await fetchMaterials();
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [classId, router, fetchMaterials]);

  async function copyCode() {
    if (!classData) return;
    try {
      await navigator.clipboard.writeText(classData.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this class? This will remove all student enrollments.")) return;
    setDeleting(true);
    const res = await fetch(`/api/teacher/classes/${classId}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete class. Please try again.");
      setDeleting(false);
      return;
    }
    router.push("/app/teacher");
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 mt-4">
        <div className="text-center py-12 text-text-muted text-[14px]">Loading...</div>
      </div>
    );
  }

  if (!classData) return null;

  const subjectLabel = classData.subject.charAt(0) + classData.subject.slice(1).toLowerCase();
  const totalDuration = students.reduce((sum, s) => sum + s.totalDuration, 0);
  const totalMessages = students.reduce((sum, s) => sum + s.totalMessages, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app/teacher" />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-[34px] text-text-primary">{classData.name}</h1>
          <p className="text-[15px] text-text-secondary mt-1">{subjectLabel}</p>
          {classData.description && (
            <p className="text-[13px] text-text-muted mt-2">{classData.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] text-[13px] font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            {classData.joinCode}
            <span className="text-[11px] text-text-muted">
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2 text-[13px] text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard value={classData._count.enrollments} label="Students" />
        <StatCard value={classData._count.sessions} label="Sessions" />
        <StatCard value={Math.round(totalDuration / 60)} label="Total mins" />
        <StatCard value={totalMessages} label="Messages" />
      </div>

      {/* Materials */}
      <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[15px] text-text-primary">
            Materials
          </h2>
          {!showAddMaterial && (
            <button
              onClick={() => setShowAddMaterial(true)}
              className="text-[12px] text-accent hover:text-accent-light transition-colors font-display"
            >
              + Add Material
            </button>
          )}
        </div>

        {showAddMaterial && (
          <AddMaterialForm
            classId={classId}
            onCreated={() => { setShowAddMaterial(false); fetchMaterials(); }}
            onCancel={() => setShowAddMaterial(false)}
          />
        )}

        {materials.length === 0 && !showAddMaterial && (
          <p className="text-text-muted text-[13px] text-center py-6">
            No materials yet. Add assignments and files for your students.
          </p>
        )}
        {materials.length > 0 && (
          <div className="space-y-3 mt-3">
            {materials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                classId={classId}
                onDeleted={fetchMaterials}
              />
            ))}
          </div>
        )}
      </div>

      {/* Student table */}
      <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5">
        <h2 className="font-display font-semibold text-[15px] text-text-primary mb-4">
          Enrolled Students
        </h2>
        <StudentTable students={students} />
      </div>
    </div>
  );
}
