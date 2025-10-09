"use client";
export function RecentActivity() {
  const items = [
    { text: 'Completed JavaScript Basics quiz', date: '2/2/2025' },
    { text: 'Scored 85% on React Hooks quiz', date: '2/1/2025' },
    { text: 'Started Algorithms practice set', date: '1/30/2025' },
    { text: 'Generated a custom CSS quiz', date: '1/28/2025' }
  ];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-600 mb-4">Recent Activity</h3>
      <ul className="flex-1 space-y-3 text-xs sm:text-sm">
        {items.map((item,i)=> (
          <li key={i} className="flex gap-2 items-start">
            <span className="mt-1 h-2 w-2 rounded-full bg-neutral-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-neutral-700">{item.text}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{item.date}</p>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-4 text-xs underline text-neutral-500 hover:text-black self-start">View all</button>
    </div>
  );
}
