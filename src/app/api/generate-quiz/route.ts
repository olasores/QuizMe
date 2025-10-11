import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { content, numQuestions = 10 } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const prompt = `Based on the following content, generate exactly ${numQuestions} multiple choice quiz questions. Each question should have 4 options (A, B, C, D) with only one correct answer.

Content:
${content}

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

    return NextResponse.json({
      success: true,
      quiz: quizData,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
