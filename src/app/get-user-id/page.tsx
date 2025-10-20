"use client";
import { useState, useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';

export default function GetUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function getUserId() {
      try {
        const supabase = getBrowserSupabase();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError('No active session found. Please log in first.');
          setLoading(false);
          return;
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Could not get user information.');
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
      } catch (e) {
        setError('An error occurred while getting the user ID.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    getUserId();
  }, []);

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4">Your User ID</h1>
      
      {loading && <p className="text-gray-500">Loading...</p>}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {userId && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Use this ID in your sample-data.sql file:</p>
          <div className="flex items-center">
            <code className="bg-gray-100 p-2 rounded text-sm flex-1 overflow-x-auto">{userId}</code>
            <button 
              onClick={copyToClipboard}
              className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Replace the placeholder UUID in sample-data.sql with your actual user ID.
          </p>
        </div>
      )}
    </div>
  );
}