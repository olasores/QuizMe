"use client";

import { useState } from 'react';

interface Option {
  id: string;
  text: string;
}

interface Question {
  question: string;
  options: Option[];
  correctAnswer: string;
}

interface QuizData {
  questions: Question[];
}

export default function TextQuizGenerator() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      
      setTextPreview(data.textPreview || null);
      setQuiz(data.quiz || null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Quiz from Text</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="content" className="block mb-2 font-medium">
            Enter text content
          </label>
          <textarea
            id="content"
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type content here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {textPreview && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Content Preview</h2>
          <div className="p-4 bg-gray-50 rounded-md">
            {textPreview}
          </div>
        </div>
      )}
      
      {quiz && (
        <div>
          <h2 className="text-xl font-bold mb-4">Generated Quiz</h2>
          
          <div className="space-y-6">
            {quiz.questions.map((q, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium mb-2">
                  {i + 1}. {q.question}
                </h3>
                <ul className="space-y-2">
                  {q.options.map((option) => (
                    <li
                      key={option.id}
                      className={`p-2 rounded-md ${
                        q.correctAnswer === option.id
                          ? 'bg-green-50 border border-green-200'
                          : ''
                      }`}
                    >
                      {option.id}: {option.text}
                      {q.correctAnswer === option.id && (
                        <span className="ml-2 text-green-600 font-medium">✓</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
