import { ReactNode } from 'react';

interface StatCardProps { label: string; value: string | number; icon?: ReactNode; foot?: string; }
export function StatCard({ label, value, icon, foot }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col gap-2 shadow-sm hover:shadow transition">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</p>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {foot && <p className="text-[11px] text-neutral-500">{foot}</p>}
    </div>
  );
}
