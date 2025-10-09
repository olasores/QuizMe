"use client";
export function QuizLauncher() {
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-black text-white p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
      <div className="relative">
        <h2 className="text-xl font-semibold tracking-tight">Quiz Me</h2>
        <p className="text-sm text-neutral-300 mt-1">Generate a new quiz instantly.</p>
      </div>
      
      <div className="relative">
        <button className="inline-flex items-center gap-2 rounded-lg bg-white text-black text-sm font-medium px-4 py-2 shadow hover:shadow-md transition">
          <span>Generate Quiz</span>
        </button>
      </div>
    </div>
  );
}
