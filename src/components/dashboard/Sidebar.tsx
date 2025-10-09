"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/quizzes', label: 'Quizzes' },
  { href: '/dashboard/activity', label: 'Activity' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-52 shrink-0 border-r border-neutral-200 bg-neutral-50/40 backdrop-blur-sm">
      <div className="h-14 flex items-center px-5 font-semibold tracking-tight text-sm">QuizMe</div>
      <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
        {items.map(item => {
          const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 transition font-medium ${active ? 'bg-black text-white shadow' : 'text-neutral-700 hover:bg-neutral-200/70'}`}
              >
                {item.label}
              </Link>
            );
        })}
      </nav>
      <div className="px-4 py-4 text-[10px] text-neutral-400">v0.1.0</div>
    </aside>
  );
}
