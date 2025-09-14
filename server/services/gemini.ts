
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || 'your-api-key-here';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateQuiz(params: {
  class: string;
  subject: string;
  topic?: string;
  difficulty: string;
  count: number;
}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Generate a quiz for ${params.class} students on ${params.subject}${params.topic ? ` focusing on ${params.topic}` : ''} with ${params.difficulty} difficulty level. Create exactly ${params.count} multiple choice questions.

Format the response as a JSON object with this structure:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text with proper formatting for math (use LaTeX syntax like $x^2$ for math expressions)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option",
      "explanation": "Detailed explanation with LaTeX math formatting where needed",
      "difficulty": "${params.difficulty}",
      "topic": "Specific topic name"
    }
  ]
}

Make questions educational, accurate, and age-appropriate. Use LaTeX syntax for mathematical expressions (e.g., $\\frac{1}{2}$, $x^2 + y^2 = z^2$).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const quiz = JSON.parse(text);
      
      // Ensure questions have proper IDs
      if (quiz.questions) {
        quiz.questions.forEach((q: any, index: number) => {
          if (!q.id) {
            q.id = `q_${Date.now()}_${index}`;
          }
        });
      }
      
      return quiz;
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', parseError);
      throw new Error('Invalid quiz format generated');
    }
  } catch (error) {
    console.error('Gemini quiz generation error:', error);
    throw error;
  }
}

export async function generateChat(message: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a helpful educational AI assistant for students. Answer this question clearly and educationally, using proper formatting including:
- **Bold text** for emphasis
- *Italic text* for definitions
- LaTeX syntax for math (e.g., $x^2$, $\\frac{a}{b}$, $\\sqrt{x}$)
- Code blocks for programming concepts
- Lists for step-by-step explanations

Keep responses concise but informative. Always be encouraging and supportive.

Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw error;
  }
}

export async function generateReasoning(params: {
  difficulty: string;
  category: string;
}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const categoryMap: Record<string, string> = {
      'logic': 'logical reasoning and deduction',
      'number_series': 'number patterns and sequences',
      'pattern_match': 'visual and abstract patterns',
      'analytical': 'analytical and critical thinking'
    };
    
    const categoryDesc = categoryMap[params.category] || 'logical reasoning';
    
    const prompt = `Create a ${params.difficulty} difficulty reasoning challenge focused on ${categoryDesc}.

Format the response as a JSON object:
{
  "id": "unique_id",
  "question": "Clear, concise reasoning question",
  "answer": "Correct answer (keep it brief)",
  "explanation": "Step-by-step explanation of the solution",
  "difficulty": "${params.difficulty}",
  "category": "${categoryDesc}",
  "points": ${params.difficulty === 'easy' ? 10 : params.difficulty === 'hard' ? 30 : 20}
}

Make the question challenging but fair, appropriate for high school students.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const challenge = JSON.parse(text);
      
      // Ensure challenge has proper ID and timestamp
      if (!challenge.id) {
        challenge.id = `reasoning_${Date.now()}`;
      }
      challenge.createdAt = new Date().toISOString();
      
      return challenge;
    } catch (parseError) {
      console.error('Failed to parse reasoning JSON:', parseError);
      throw new Error('Invalid reasoning format generated');
    }
  } catch (error) {
    console.error('Gemini reasoning generation error:', error);
    throw error;
  }
}
