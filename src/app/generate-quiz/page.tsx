"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToggleSwitch } from '@/components/generate/ToggleSwitch';
import { TextInputArea } from '@/components/generate/TextInputArea';
import { FileUpload } from '@/components/generate/FileUpload';
import { GenerateButton } from '@/components/generate/GenerateButton';

type Mode = 'Document' | 'Text';

export default function GenerateQuizPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('Text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let content = '';

      if (mode === 'Text') {
        content = textContent;
      } else {
        // For now, we'll handle only text mode
        // File parsing would need additional implementation
        setError('Document upload coming soon! Please use text mode.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, numQuestions: 10 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      // Redirect to quiz page with quiz data
      const quizData = encodeURIComponent(JSON.stringify(data.quiz));
      router.push(`/quiz?data=${quizData}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = mode === 'Text' ? textContent.trim().length > 0 : selectedFile !== null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Generate a quiz</h1>
          <p className="text-sm text-neutral-600">Upload a document, type a topic or paste notes to generate questions</p>
        </div>

        {/* Toggle Switch */}
        <div className="mb-6">
          <ToggleSwitch
            options={['Document', 'Text']}
            selected={mode}
            onChange={(value) => setMode(value as Mode)}
          />
        </div>

        {/* Input Area */}
        <div className="mb-8">
          {mode === 'Text' ? (
            <TextInputArea
              value={textContent}
              onChange={setTextContent}
              placeholder="Paste in your notes or content"
            />
          ) : (
            <FileUpload onFileSelect={setSelectedFile} />
          )}
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
