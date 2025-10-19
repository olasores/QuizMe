"use client";
import { useState } from 'react';
import Link from 'next/link';

interface TopBarProps { userEmail?: string | null; onSignOut?: () => void; }

export function TopBar({ userEmail, onSignOut }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="h-14 border-b border-neutral-200 flex items-center px-4 gap-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <button className="md:hidden inline-flex flex-col justify-center gap-[5px] w-8 h-8" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
        <span className="h-[2px] w-5 bg-black" />
        <span className="h-[2px] w-5 bg-black" />
        <span className="h-[2px] w-5 bg-black" />
      </button>
      <div className="flex-1" />
      {userEmail ? (
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-neutral-600">{userEmail}</span>
          <button onClick={onSignOut} className="text-xs font-medium underline underline-offset-4 hover:text-black">Sign out</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-xs font-medium">
          <Link href="/Login" className="underline">Login</Link>
          <Link href="Signup" className="underline">Signup</Link>
        </div>
      )}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 md:hidden bg-white border-t border-neutral-200 shadow-sm z-40 animate-fade-in">
          <nav className="px-4 py-3 flex flex-col gap-2 text-sm">
            <Link href="/dashboard" className="underline">Overview</Link>
            <Link href="/dashboard/quizzes" className="underline">Quizzes</Link>
            <Link href="/dashboard/activity" className="underline">Activity</Link>
            <Link href="/dashboard/settings" className="underline">Settings</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
