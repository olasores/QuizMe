import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '12mb', // allow larger multipart bodies (route still enforces 10MB file size)
  },
};

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
    question: `Which option best describes “${term}”?`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

function qMatchesTerm(term: string, sentences: string[]) {
  const correct = truncate(sentences[0], 130);
  const distractors = pickMany(sentences.slice(1).map((s) => truncate(s, 120)), 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: `Which sentence from the document best matches the term “${term}”?`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

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

type UploadedFile = { filepath: string; originalFilename?: string | null; size?: number; mimetype?: string | null };

async function parseMultipart(req: NextApiRequest): Promise<{ file: UploadedFile }> {
  const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 }); // 10MB
  return new Promise((resolve, reject) => {
    form.parse(req, (err: unknown, _fields: unknown, files: unknown) => {
      if (err) return reject(err);
      const dict = (files as Record<string, unknown>) || {};
      const candidate = dict.file as unknown;
      let f: UploadedFile | undefined;
      if (Array.isArray(candidate)) f = candidate[0] as UploadedFile;
      else f = candidate as UploadedFile;
      if (!f || typeof f.filepath !== 'string') return reject(new Error('Missing file'));
      resolve({ file: f });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }
  try {
    const { file } = await parseMultipart(req);
    const name = (file.originalFilename || '').toLowerCase();
    if (!name) return res.status(400).send('Missing filename');
    if (name.endsWith('.doc')) return res.status(415).send('Unsupported file type .doc. Use .pdf, .docx, or .txt');

  const buf = await fs.readFile(file.filepath);
    let text = '';
    if (name.endsWith('.pdf')) {
      try {
        // Try a more reliable approach with pdf-lib
        console.log('Using pdf-lib for PDF parsing...');
        const { PDFDocument } = require('pdf-lib');
        
        // Parse the PDF
        const pdfDoc = await PDFDocument.load(buf.buffer);
        const numberOfPages = pdfDoc.getPageCount();
        
        // Fallback to pdf-parse only if needed
        console.log(`PDF has ${numberOfPages} pages`);
        
        // We'll use a more direct extraction approach
        const pdfParse = require('pdf-parse');
        let extractedText = '';
        
        // Process page by page to avoid corruption issues
        for (let i = 0; i < Math.min(numberOfPages, 50); i++) {
          try {
            // Create a new document with just this page
            const singlePageDoc = await PDFDocument.create();
            const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
            singlePageDoc.addPage(copiedPage);
            
            // Convert to buffer
            const pageBuffer = Buffer.from(await singlePageDoc.save());
            
            // Parse this page
            const pageData = await pdfParse(pageBuffer);
            extractedText += pageData.text + '\n\n';
          } catch (pageError) {
            console.warn(`Error extracting page ${i}, skipping: ${pageError.message}`);
            // Continue to next page even if this one fails
          }
        }
        
        text = extractedText.trim();
        
        if (!text) {
          throw new Error('No text content could be extracted from the PDF');
        }
        
        console.log('PDF parsing successful, text length:', text.length);
      } catch (error) {
        console.error('PDF parse error detail:', error);
        
        // Try pdf-parse one last time with minimal options
        try {
          console.log('Trying one more approach with pdf-parse...');
          const pdfParse = require('pdf-parse');
          const data = await pdfParse(buf, { max: 50 });
          text = data.text || '';
          
          if (text.trim()) {
            console.log('Alternate PDF parsing successful, text length:', text.length);
          } else {
            return res.status(422).json({ 
              error: 'Unable to extract text from this PDF file',
              suggestion: 'Please try a different PDF file or convert to text/docx format'
            });
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (fallbackError) {
          return res.status(422).json({ 
            error: 'Unable to parse this PDF file',
            details: error instanceof Error ? error.message : String(error),
            suggestion: 'Try saving your PDF with a different tool or convert it to text/docx format'
          });
        }
      }
    } else if (name.endsWith('.docx')) {
      const mammoth = (await import('mammoth')) as unknown as { 
        extractRawText: (opts: { buffer: Buffer }) => Promise<{ value?: string }> 
      };
      const out = await mammoth.extractRawText({ buffer: buf });
      text = out.value || '';
    } else if (name.endsWith('.txt')) {
      text = buf.toString('utf8');
    } else {
      return res.status(415).send('Unsupported file type. Use .pdf, .docx, or .txt');
    }

    const clean = normalize(text);
    if (!clean) return res.status(422).send('No extractable text found in the document.');
    
    try {
      // Use Anthropic Claude to generate quiz
      console.log('Using Claude to generate quiz...');
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Missing ANTHROPIC_API_KEY in environment variables');
      }
      
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      
      const numQuestions = 10;
      
      const prompt = `Based on the following content, generate exactly ${numQuestions} multiple choice quiz questions. Each question should have 4 options (A, B, C, D) with only one correct answer.

Content:
${clean}

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
      const preview = truncate(clean, 800);
      
      return res.status(200).json({
        success: true,
        textPreview: preview,
        quiz: quizData,
      });
    } catch (aiError) {
      console.error('Claude API error:', aiError);
      // Fall back to local generation if Claude fails
      console.log('Falling back to local quiz generation...');
      const questions = buildVariedQuestions(clean, 6, 10);
      const preview = truncate(clean, 800);
      return res.status(200).json({ textPreview: preview, questions });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error';
    console.error('upload error:', e);
    return res.status(500).send(msg);
  }
}
