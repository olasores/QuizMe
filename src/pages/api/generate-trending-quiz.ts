import type { NextApiRequest, NextApiResponse } from 'next';

interface GenerateQuizResponse {
  success?: boolean;
  quiz?: {
    questions: Array<{
      question: string;
      options: Array<{
        id: string;
        text: string;
      }>;
      correctAnswer: string;
    }>;
  };
  error?: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateQuizResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, numQuestions = 10 } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  // Check if we have the Anthropic API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Missing ANTHROPIC_API_KEY in environment variables',
      details: 'Add ANTHROPIC_API_KEY to your .env.local file',
    });
  }

  try {
    console.log('=== STARTING QUIZ GENERATION ===');
    console.log('Topic:', topic);
    console.log('Num Questions:', numQuestions);
    
    // Import Anthropic
    const { default: Anthropic } = await import('@anthropic-ai/sdk');

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create a prompt for Claude to generate quiz questions about the topic
    const prompt = `You are a quiz generator. Generate exactly ${numQuestions} multiple choice quiz questions about "${topic}".

IMPORTANT: Return ONLY valid JSON, nothing else. No markdown, no explanation, just the JSON object.

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
    },
    {
      "question": "Another question?",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctAnswer": "B"
    }
  ]
}

Generate ${numQuestions} questions. Each question must have exactly 4 options with ids A, B, C, D. The correctAnswer must be one of these ids. Vary difficulty from easy to hard. Return ONLY the JSON object, nothing else.`;

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

    console.log('Claude API Response received successfully');
    console.log('Response content type:', message.content[0].type);

    // Extract the text content from the response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('Response text length:', responseText.length);
    console.log('Full response:', responseText);

    // Parse the JSON response from Claude - try multiple approaches
    let quizData;
    
    // First try: find JSON object with curly braces
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to find JSON in response');
      console.error('Full response:', responseText);
      throw new Error('Failed to parse quiz from AI response - no JSON found');
    }

    console.log('JSON extracted:', jsonMatch[0].substring(0, 200));
    
    try {
      quizData = JSON.parse(jsonMatch[0]);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0]);
      // Try to clean up common issues
      const cleanedJson = jsonMatch[0]
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/'/g, '"'); // Replace single quotes with double quotes
      
      console.log('Attempting to parse cleaned JSON:', cleanedJson.substring(0, 200));
      try {
        quizData = JSON.parse(cleanedJson);
        console.log('Cleaned JSON parsed successfully');
      } catch (cleanedParseError) {
        console.error('Cleaned JSON Parse Error:', cleanedParseError);
        throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    // Validate the structure
    if (!Array.isArray(quizData.questions)) {
      console.error('Invalid structure - questions is not an array');
      throw new Error('Invalid quiz structure - questions array missing');
    }

    console.log(`✓ Successfully generated ${quizData.questions.length} questions`);
    console.log('=== QUIZ GENERATION COMPLETE ===');

    return res.status(200).json({
      success: true,
      quiz: quizData,
    });
  } catch (e: unknown) {
    console.error('=== ERROR GENERATING QUIZ ===');
    console.error('Error type:', e instanceof Error ? 'Error' : typeof e);
    if (e instanceof Error) {
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
    } else {
      console.error('Error value:', e);
    }
    console.error('=== END ERROR ===');
    
    return res.status(500).json({
      error: 'Failed to generate quiz',
      details: e instanceof Error ? e.message : String(e),
    });
  }
}
