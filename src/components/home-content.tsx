"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VideoHero } from "@/components/video-hero";
import { AddClassForm } from "@/components/add-class-form";

interface ClassItem {
  id: string;
  name: string;
}

interface HomeContentProps {
  userName?: string | null;
  existingClasses?: ClassItem[];
}

export function HomeContent({ userName, existingClasses = [] }: HomeContentProps) {
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>(existingClasses);

  // Fetch classes from API on mount to get accurate filtered list
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes.map((c: { id: string; unitName: string }) => ({
            id: c.id,
            name: c.unitName,
          })));
        }
      })
      .catch(() => {});
  }, []);

  function handleCreated(cls: ClassItem) {
    setClasses((prev) => [cls, ...prev]);
    setShowForm(false);
  }

  return (
    <div>
      <VideoHero userName={userName} />

      {/* Spacer so the hero occupies the full first screen */}
      <div className="h-screen" />

      {/* Scroll-down section */}
      <div className="relative z-10 min-h-screen border-t border-white/[0.1] rounded-t-3xl">
        <div className="flex flex-col items-center py-20 gap-6">
          {/* Add class button */}
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-full bg-accent border-2 border-accent-light flex items-center justify-center shadow-[0_0_20px_rgba(74,157,91,0.3)] group-hover:bg-accent-light transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 text-[13px] font-medium text-white hover:bg-black/40 transition-colors">
                Add a Class
              </span>
            </button>
          )}

          {/* Inline form */}
          {showForm && (
            <AddClassForm onCancel={() => setShowForm(false)} onCreated={handleCreated} />
          )}

          {/* Classes created via Add a Class */}
          {classes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4 max-w-2xl px-6">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/app/class/${cls.id}`}
                  className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 text-[13px] font-medium text-white hover:bg-black/40 transition-colors"
                >
                  {cls.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
