"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoadingState {
  topic: string | null;
  isLoading: boolean;
}

export function TrendingTopics() {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    topic: null,
    isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);

  const topics = ['JavaScript', 'React', 'Next.js', 'CSS', 'Databases', 'APIs', 'TypeScript', 'Algorithms'];

  const handleTopicClick = async (topic: string) => {
    setLoadingState({ topic, isLoading: true });
    setError(null);

    try {
      // Call the API to generate a quiz for this topic
      const response = await fetch('/api/generate-trending-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          numQuestions: 10,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to generate quiz';
        console.error('API Error:', errorMsg, data.details);
        setError(errorMsg);
        setLoadingState({ topic: null, isLoading: false });
        return;
      }

      if (data.success && data.quiz) {
        console.log('Quiz data received:', data.quiz);
        // Encode quiz data and pass it via URL parameter
        const quizDataString = encodeURIComponent(JSON.stringify(data.quiz));
        router.push(`/quiz?data=${quizDataString}`);
      } else {
        console.error('Missing quiz data in response');
        setError('Failed to generate quiz');
        setLoadingState({ topic: null, isLoading: false });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('Fetch error:', errorMsg);
      setError(errorMsg);
      setLoadingState({ topic: null, isLoading: false });
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-600">Trending Topics</h3>
        <button className="text-xs underline text-neutral-500 hover:text-black">View all</button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {topics.map(t => (
          <button
            key={t}
            onClick={() => handleTopicClick(t)}
            disabled={loadingState.isLoading}
            className={`rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 transition ${
              loadingState.topic === t && loadingState.isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-white hover:shadow-sm hover:border-neutral-300 cursor-pointer'
            }`}
          >
            {loadingState.topic === t && loadingState.isLoading ? (
              <span className="flex items-center gap-1 justify-center">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
              </span>
            ) : (
              t
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
