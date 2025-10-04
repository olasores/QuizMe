"use client";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic"; // ensure no static prerendering

interface Status {
  envUrl: boolean;
  envAnon: boolean;
  session?: string;
  error?: string;
}

export default function DebugAuth() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    (async () => {
      const envUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const envAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      try {
        const supabase = getBrowserSupabase();
        const { data, error } = await supabase.auth.getSession();
        setStatus({
          envUrl,
          envAnon,
          session: JSON.stringify(data.session, null, 2),
          error: error?.message,
        });
      } catch (e: unknown) {
        let message: string;
        if (typeof e === 'string') message = e;
        else if (e && typeof e === 'object' && 'message' in e) {
          const m = (e as { message?: unknown }).message;
          message = typeof m === 'string' ? m : 'Unknown error';
        } else message = 'Unknown error';
        setStatus({ envUrl, envAnon, error: message });
      }
    })();
  }, []);

  return (
    <div className="min-h-screen font-mono p-6 bg-gradient-to-br from-white to-gray-200">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      {!status && <p>Loading…</p>}
      {status && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-white shadow-sm">
            <h2 className="font-semibold mb-2">Env Presence</h2>
            <ul className="text-sm list-disc pl-5">
              <li>NEXT_PUBLIC_SUPABASE_URL: {status.envUrl ? '✅ present' : '❌ missing'}</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {status.envAnon ? '✅ present' : '❌ missing'}</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-white shadow-sm">
            <h2 className="font-semibold mb-2">Session</h2>
            {status.error && <p className="text-red-600 text-sm">Error: {status.error}</p>}
            <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap">{status.session || 'No session'}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
