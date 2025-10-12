import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","for","with","as","by","is","are","was","were","be","been",
  "this","that","these","those","it","its","at","from","into","about","after","before","between","during","over",
  "under","again","further","then","once","here","there","when","where","why","how","all","any","both","each",
  "few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","can",
  "will","just","don","should","now"
]);

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string) {
  return normalize(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 40 && s.length <= 320);
}

function topKeywords(text: string, max = 20) {
  const counts: Record<string, number> = {};
  for (const raw of text.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []) {
    const w = raw.replace(/^-+|-+$/g, "");
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
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickMany<T>(arr: T[], n: number, avoid?: T): T[] {
  const pool = avoid ? arr.filter(x => x !== avoid) : arr.slice();
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(pool[i % Math.max(pool.length, 1)] ?? arr[0]);
  return out;
}

function qKeyPoint(sentence: string, others: string[]) {
  const correct = truncate(sentence, 140);
  const distractors = pickMany(others.map(s => truncate(s, 120)), 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: "Which option best captures a key point from the document?",
    options,
    answerIndex: options.indexOf(correct),
  };
}

function qCloze(sentence: string, keywords: string[], othersKeywords: string[]) {
  const sWords = sentence.match(/[A-Za-z][A-Za-z-']*/g) ?? [];
  const candidate = sWords.find(w => keywords.includes(w.toLowerCase()) && w.length >= 4);
  const target = candidate ?? sWords.find(w => w.length >= 6) ?? sWords[0] ?? "_____";
  const blanked = sentence.replace(new RegExp(`\\b${target}\\b`), "_____");
  const correct = target;
  const poolKw = othersKeywords.filter(k => k.toLowerCase() !== correct.toLowerCase());
  const distractors = pickMany(poolKw, 3).map(w => w[0].toUpperCase() + w.slice(1));
  const options = shuffle([correct, ...distractors].map(o => truncate(o, 40)));
  return {
    question: `Fill in the blank: ${truncate(blanked, 160)}`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

function qBestDescription(term: string, sentences: string[]) {
  const correct = truncate(sentences[0], 130);
  const distractors = pickMany(sentences.slice(1).map(s => truncate(s, 120)), 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: `Which option best describes “${term}”?`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

function qMatchesTerm(term: string, sentences: string[]) {
  const correct = truncate(sentences[0], 130);
  const distractors = pickMany(sentences.slice(1).map(s => truncate(s, 120)), 3);
  const options = shuffle([correct, ...distractors]);
  return {
    question: `Which sentence from the document best matches the term “${term}”?`,
    options,
    answerIndex: options.indexOf(correct),
  };
}

function buildVariedQuestions(allText: string, minQ = 6, maxQ = 10) {
  const sentences = splitSentences(allText);
  if (!sentences.length) return [];
  const kws = topKeywords(allText, 25);
  const result: { question: string; options: string[]; answerIndex: number }[] = [];
  let i = 0;
  while (result.length < Math.min(maxQ, Math.max(minQ, sentences.length))) {
    const s = sentences[i % sentences.length];
    const others = sentences.filter(x => x !== s);
    switch (result.length % 4) {
      case 0: {
        result.push(qKeyPoint(s, others));
        break;
      }
      case 1: {
        const sentKw = topKeywords(s, 8);
        const otherKw = kws.filter(k => !sentKw.includes(k));
        result.push(qCloze(s, sentKw, otherKw.length ? otherKw : kws));
        break;
      }
      case 2: {
        const term = (topKeywords(s, 1)[0] ?? (s.match(/[A-Za-z][A-Za-z-]{5,}/)?.[0] ?? "concept")).replace(/^-+|-+$/g,"");
        const pool = [s, ...pickMany(others, 6)];
        result.push(qBestDescription(term, pool));
        break;
      }
      case 3: {
        const term = (kws[(i * 3) % Math.max(1, kws.length)] ?? "topic").toString();
        const pool = [s, ...pickMany(others, 6)];
        result.push(qMatchesTerm(term, pool));
        break;
      }
    }
    i++;
  }
  return result;
}

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return new NextResponse("Missing file", { status: 400 });
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) return new NextResponse("File too large (max 10MB)", { status: 413 });
    const name = file.name.toLowerCase();
    const buf = await bufferFromFile(file);
    let text = "";
    if (name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const out = await pdfParse(buf);
      text = out.text || "";
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const out = await mammoth.extractRawText({ buffer: buf });
      text = out.value || "";
    } else if (name.endsWith(".txt")) {
      text = buf.toString("utf8");
    } else {
      return new NextResponse("Unsupported file type. Use .pdf, .docx, or .txt", { status: 415 });
    }
    const clean = normalize(text);
    if (!clean) return new NextResponse("No extractable text found in the document.", { status: 422 });
    const questions = buildVariedQuestions(clean, 6, 10);
    const preview = truncate(clean, 800);
    return NextResponse.json({ textPreview: preview, questions });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err?.message || "Server error", { status: 500 });
  }
}
