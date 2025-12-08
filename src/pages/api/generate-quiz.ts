import type { NextApiRequest, NextApiResponse } from 'next';

// Reusing the same utility functions from quiz-from-doc.ts
const STOPWORDS = new Set([
  'the','a','an','and','or','but','of','to','in','on','for','with','as','by','is','are','was','were','be','been',
  'this','that','these','those','it','its','at','from','into','about','after','before','between','during','over',
  'under','again','further','then','once','here','there','when','where','why','how','all','any','both','each',
  'few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can',
  'will','just','don','should','now'
]);

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function splitSentences(text: string) {
  return normalize(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 320);
}

function topKeywords(text: string, max = 20) {
  const counts: Record<string, number> = {};
  for (const raw of text.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []) {
    const w = raw.replace(/^-+|-+$/g, '');
    if (w.length < 3) continue;
    if (STOPWORDS.has(w)) continue;
    counts[w] = (counts[w] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, '') + '…';
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickMany<T>(arr: T[], n: number, avoid?: T): T[] {
  const pool = avoid ? arr.filter((x) => x !== avoid) : arr.slice();
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(pool[i % Math.max(pool.length, 1)] ?? arr[0]);
  return out;
}

function qKeyPoint(sentence: string, others: string[]) {
  const correct = truncate(sentence, 140);
  const distractors = pickMany(others.map((s) => truncate(s, 120)), 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: 'Which option best captures a key point from the document?',
    options,
    answerIndex: options.indexOf(correct),
  };
}

function qCloze(sentence: string, keywords: string[], othersKeywords: string[]) {
  const sWords = sentence.match(/[A-Za-z][A-Za-z-']*/g) ?? [];
  const candidate = sWords.find((w) => keywords.includes(w.toLowerCase()) && w.length >= 4);
  const target = candidate ?? sWords.find((w) => w.length >= 6) ?? sWords[0] ?? '_____';
  const blanked = sentence.replace(new RegExp(`\\b${target}\\b`), '_____');
  const correct = target;
  const poolKw = othersKeywords.filter((k) => k.toLowerCase() !== correct.toLowerCase());
  const distractors = pickMany(poolKw, 3).map((w) => w[0].toUpperCase() + w.slice(1));
  const options = shuffle([correct, ...distractors].map((o) => truncate(o, 40)));
  return {
    question: `Fill in the blank: ${truncate(blanked, 160)}`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

function qBestDescription(term: string, sentences: string[]) {
  const correct = truncate(sentences[0], 130);
  const distractors = pickMany(sentences.slice(1).map((s) => truncate(s, 120)), 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: `Which option best describes "${term}"?`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

function qMatchesTerm(term: string, sentences: string[]) {
  const correct = truncate(sentences[0], 130);
  const distractors = pickMany(sentences.slice(1).map((s) => truncate(s, 120)), 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: `Which sentence from the document best matches the term "${term}"?`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildVariedQuestions(allText: string, minQ = 6, maxQ = 10) {
  const sentences = splitSentences(allText);
  if (!sentences.length) return [] as { question: string; options: string[]; answerIndex: number }[];
  const kws = topKeywords(allText, 25);
  const result: { question: string; options: string[]; answerIndex: number }[] = [];
  let i = 0;
  while (result.length < Math.min(maxQ, Math.max(minQ, sentences.length))) {
    const s = sentences[i % sentences.length];
    const others = sentences.filter((x) => x !== s);
    switch (result.length % 4) {
      case 0: {
        result.push(qKeyPoint(s, others));
        break;
      }
      case 1: {
        const sentKw = topKeywords(s, 8);
        const otherKw = kws.filter((k) => !sentKw.includes(k));
        result.push(qCloze(s, sentKw, otherKw.length ? otherKw : kws));
        break;
      }
      case 2: {
        const term = (topKeywords(s, 1)[0] ?? (s.match(/[A-Za-z][A-Za-z-]{5,}/)?.[0] ?? 'concept')).replace(/^-+|-+$/g, '');
        const pool = [s, ...pickMany(others, 6)];
        result.push(qBestDescription(term, pool));
        break;
      }
      case 3: {
        const term = (kws[(i * 3) % Math.max(1, kws.length)] ?? 'topic').toString();
        const pool = [s, ...pickMany(others, 6)];
        result.push(qMatchesTerm(term, pool));
        break;
      }
    }
    i++;
  }
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Get content from request body - support both 'content' and 'text' parameters
    const { content, text } = req.body;
    const inputText = content || text;
    
    if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if we have the Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'Missing ANTHROPIC_API_KEY in environment variables',
        suggestion: 'Add ANTHROPIC_API_KEY to your .env.local file'
      });
    }
    
    // Import Anthropic
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const numQuestions = req.body.numQuestions || 10;
    
    const prompt = `Based on the following content, generate exactly ${numQuestions} multiple choice quiz questions. Each question should have 4 options (A, B, C, D) with only one correct answer.

Content:
${inputText}

Return the quiz in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctAnswer": "A"
    }
  ]
}

Generate ${numQuestions} questions that test understanding of the key concepts in the content. Make sure the JSON is valid and parseable.`;

    console.log('Sending request to Claude API...');
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from response (Claude sometimes wraps it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz from AI response');
    }
    
    const quizData = JSON.parse(jsonMatch[0]);
    const preview = inputText.length > 800 ? 
      inputText.slice(0, 800).replace(/\s+\S*$/, '') + '…' : 
      inputText;
    
    return res.status(200).json({
      success: true,
      textPreview: preview,
      quiz: quizData,
    });
  } catch (e: unknown) {
    console.error('Generate quiz error:', e);
    return res.status(500).json({ 
      error: 'Failed to generate quiz', 
      details: e instanceof Error ? e.message : String(e) 
    });
  }
}