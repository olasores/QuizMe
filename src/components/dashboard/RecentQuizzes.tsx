"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz } from '@/types/database';

interface RecentQuizzesProps {
  userId?: string;
  quizzes?: Quiz[];
}

export function RecentQuizzes({ userId, quizzes = [] }: RecentQuizzesProps) {
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>(quizzes);
  const [isLoading, setIsLoading] = useState(!quizzes.length);
  
  useEffect(() => {
    if (quizzes.length) {
      setRecentQuizzes(quizzes);
      return;
    }
    
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/quizzes?userId=${userId || ''}`);
        
        if (response.ok) {
          const data = await response.json();
          setRecentQuizzes(data.quizzes || []);
        }
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [quizzes, userId]);
  
  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Recent Quizzes</h2>
        <div className="text-sm text-neutral-500">Loading quizzes...</div>
      </div>
    );
  }
  
  if (recentQuizzes.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Recent Quizzes</h2>
        <div className="text-sm text-neutral-500">No quizzes yet. Generate your first quiz above!</div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-medium mb-4">Recent Quizzes</h2>
      <ul className="space-y-3">
        {recentQuizzes.map(quiz => (
          <li key={quiz.id} className="group">
            <Link 
              href={`/quiz?id=${quiz.id}`}
              className="flex items-start gap-3 p-2 -mx-2 rounded hover:bg-neutral-50 transition"
            >
              <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center text-neutral-500 text-xs">
                Q
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-neutral-900 truncate group-hover:text-blue-600 transition">
                  {quiz.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                  <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                  {quiz.topic && (
                    <>
                      <span className="inline-block w-1 h-1 bg-neutral-300 rounded-full"></span>
                      <span>{quiz.topic}</span>
                    </>
                  )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}