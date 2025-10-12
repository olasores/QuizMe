"use client";

import React, { useState } from "react";

type QuizResponse = {
  textPreview: string;
  questions: { question: string; options: string[]; answerIndex: number }[];
};

export default function GenerateFromDocPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) return setError("Please choose a .pdf, .docx, or .txt file.");

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      const res = await fetch("/api/quiz-from-doc", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data: QuizResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-300">
      <section className="mt-16 w-full max-w-4xl scroll-mt-24">
        <div className="bg-white rounded-2xl shadow-md p-8 border border-black">
          <h1 className="text-3xl font-bold text-black">Generate Quiz from Document</h1>
          <p className="mt-3 text-gray-600">
            Upload a <span className="font-semibold text-black">.pdf</span>,{" "}
            <span className="font-semibold text-black">.docx</span>, or{" "}
            <span className="font-semibold text-black">.txt</span> file to create draft quiz questions.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <input
              id="file"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-gray-600 file:mr-4 file:rounded-lg file:border file:border-black file:bg-white file:px-4 file:py-2 file:text-black file:shadow-sm file:cursor-pointer"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-black bg-white px-5 py-2.5 text-black shadow-md hover:translate-y-[-1px] transition"
            >
              {loading ? "Generating…" : "Generate Quiz"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-black bg-white p-4 text-red-600">
              {error}
            </div>
          )}
        </div>
      </section>

      {result && (
        <>
          <section className="mt-8 w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-black">
              <h2 className="text-2xl font-bold text-black">Text Preview</h2>
              <p className="mt-3 whitespace-pre-wrap text-gray-600">{result.textPreview}</p>
            </div>
          </section>

          <section className="mt-8 w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-black">
              <h2 className="text-2xl font-bold text-black">Draft Questions</h2>
              <ol className="mt-4 space-y-4 list-decimal list-inside">
                {result.questions.map((q, idx) => (
                  <li key={idx} className="text-gray-600">
                    <div className="text-black font-semibold">{q.question}</div>
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, i) => (
                        <li key={i} className="rounded-xl border border-black bg-white px-3 py-2 shadow-sm">
                          {String.fromCharCode(65 + i)}. {opt}
                          {i === q.answerIndex && (
                            <span className="ml-2 text-green-700 font-semibold">(answer)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
