"use client";
export function TrendingTopics() {
  const topics = ['JavaScript','React','Next.js','CSS','Databases','APIs','TypeScript','Algorithms'];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-600">Trending Topics</h3>
        <button className="text-xs underline text-neutral-500 hover:text-black">View all</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {topics.map(t => (
          <button key={t} className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-white hover:shadow-sm hover:border-neutral-300 transition">{t}</button>
        ))}
      </div>
    </div>
  );
}
