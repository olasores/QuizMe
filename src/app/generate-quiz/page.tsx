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
      if (mode === 'Text') {
        // Text flow -> call Claude-backed endpoint
        const content = textContent;
        const response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, numQuestions: 10 }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate quiz');
        }

        const quizData = encodeURIComponent(JSON.stringify(data.quiz));
        router.push(`/quiz?data=${quizData}`);
        return;
      }

      // Document flow -> upload file to parsing endpoint, then normalize to quiz shape
      if (!selectedFile) {
        setError('Please select a document to upload.');
        return;
      }

      const lower = selectedFile.name.toLowerCase();
      if (lower.endsWith('.doc')) {
        setError('Unsupported .doc file. Please upload PDF, DOCX, or TXT.');
        return;
      }

      // Build form data and call the document parsing endpoint
      const form = new FormData();
      form.append('file', selectedFile);

      const res = await fetch('/api/quiz-from-doc', { method: 'POST', body: form });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to parse document');
      }

      type DocQuestion = { question: string; options: string[]; answerIndex: number };
      type DocQuizResponse = { textPreview: string; questions: DocQuestion[] };
      const parsed: DocQuizResponse = await res.json();

      // Normalize to the quiz shape used by /quiz page
      const normalized = {
        questions: (parsed.questions || []).map((q) => {
          const opts = (q.options || []).slice(0, 4);
          const letters = ['A', 'B', 'C', 'D'] as const;
          const options = opts.map((text, i) => ({ id: letters[i] || String(i + 1), text }));
          const idx = Math.max(0, Math.min(q.answerIndex ?? 0, options.length - 1));
          const correctAnswer = options[idx]?.id || 'A';
          return { question: q.question, options, correctAnswer };
        }),
      };

      if (!normalized.questions.length) {
        throw new Error('No questions could be generated from the document.');
      }

      const quizData = encodeURIComponent(JSON.stringify(normalized));
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
