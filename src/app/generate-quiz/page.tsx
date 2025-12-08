"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { TextInputArea } from '@/components/generate/TextInputArea';
import { GenerateButton } from '@/components/generate/GenerateButton';

/**
 * Helper function to detect a topic from the text content
 */
function detectTopic(text: string): string {
  const topics = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
    'HTML', 'CSS', 'Python', 'Java', 'C#', 'Go', 'Rust',
    'Machine Learning', 'AI', 'Data Science', 'Databases',
    'Frontend', 'Backend', 'DevOps', 'Security',
    'Computer Science', 'Programming', 'Web Development'
  ];
  
  // Find the first topic that appears in the text
  const lowerText = text.toLowerCase();
  for (const topic of topics) {
    if (lowerText.includes(topic.toLowerCase())) {
      return topic;
    }
  }
  
  // Default topic if none is found
  return 'General Knowledge';
}

export default function GenerateQuizPage() {
  const router = useRouter();
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const content = textContent.trim();
      if (!content) {
        setError('Please enter some text to generate a quiz.');
        return;
      }

      // Text flow -> call Claude-backed endpoint
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, numQuestions: 10 }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      
      // Save the generated quiz to database
      const { data: userData } = await getBrowserSupabase().auth.getUser();
      const userId = userData?.user?.id;
      
      // Prepare quiz data for saving
      const quizTitle = `Quiz on ${content.slice(0, 30)}...`;
      const saveResponse = await fetch('/api/save-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: {
            title: quizTitle,
            description: `Generated from text content: ${content.slice(0, 100)}...`,
            user_id: userId,
            topic: detectTopic(content),
            source_type: 'text',
            source_name: 'Manual text input'
          },
          questions: data.quiz.questions
        })
      });
      
      const savedQuizData = await saveResponse.json();
      const quizId = savedQuizData.id;
      
      const quizData = encodeURIComponent(JSON.stringify(data.quiz));
      router.push(`/quiz?data=${quizData}&id=${quizId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = textContent.trim().length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            <span className="text-lg">←</span>
            Back to dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Generate a quiz</h1>
            <p className="text-sm text-neutral-600">Type a topic or paste notes to generate questions</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-8">
          <TextInputArea
            value={textContent}
            onChange={setTextContent}
            placeholder="Paste in your notes or content"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center">
          <GenerateButton
            onClick={handleGenerate}
            disabled={!canGenerate}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
