"use client";

import { useState, useEffect, useCallback } from "react";
import { ClassCard } from "@/components/teacher/class-card";
import { CreateClassForm } from "@/components/teacher/create-class-form";
import { StatCard } from "@/components/stat-card";

interface ClassData {
  id: string;
  name: string;
  subject: string;
  period?: number | null;
  joinCode: string;
  _count: { enrollments: number; sessions: number };
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const totalStudents = classes.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalSessions = classes.reduce((sum, c) => sum + c._count.sessions, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-[34px] text-text-primary">Teacher Dashboard</h1>
          <p className="text-[15px] text-text-secondary mt-1">Manage your classes and track student progress.</p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[13px] font-semibold rounded-full px-5 py-2.5 transition-colors"
          >
            + Create Class
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard value={classes.length} label="Classes" />
        <StatCard value={totalStudents} label="Students" />
        <StatCard value={totalSessions} label="Sessions" />
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6">
          <CreateClassForm
            onCreated={() => { setShowCreate(false); fetchClasses(); }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Class list */}
      {loading ? (
        <div className="text-center py-12 text-text-muted text-[14px]">Loading...</div>
      ) : classes.length === 0 && !showCreate ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-[14px] mb-4">No classes yet. Create your first class to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[13px] font-semibold rounded-full px-5 py-2.5 transition-colors"
          >
            + Create Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              id={c.id}
              name={c.name}
              subject={c.subject}
              period={c.period}
              joinCode={c.joinCode}
              studentCount={c._count.enrollments}
              sessionCount={c._count.sessions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
