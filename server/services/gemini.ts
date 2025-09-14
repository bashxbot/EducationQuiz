import { GoogleGenAI } from "@google/genai";
import type { QuizQuestion, ChatResponse } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface QuizGenerationParams {
  class: string;
  subject: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}

export interface ReasoningChallenge {
  question: string;
  answer: string;
}

export async function getChatResponse(userMessage: string): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are an expert educational AI assistant specialized in helping students learn. 
Your responses should be:
- Clear and educational
- Include step-by-step explanations when solving problems
- Encourage learning and critical thinking
- Adapt to the student's level (assume Class 10-12 level)
- Use simple language but be thorough
- Always provide the reasoning behind answers

Focus on subjects like Mathematics, Physics, Chemistry, and general academic topics.
If asked about non-academic topics, gently redirect to educational content.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: userMessage,
    });

    const responseText = response.text || "I'm sorry, I couldn't generate a response. Please try asking your question differently.";

    return {
      response: responseText,
      explanation: "AI-generated educational response",
    };
  } catch (error) {
    console.error("Gemini chat error:", error);
    throw new Error("Failed to get AI response. Please check your connection and try again.");
  }
}

export async function generateQuizQuestions(params: QuizGenerationParams): Promise<QuizQuestion[]> {
  try {
    const { class: className, subject, topic, difficulty = "medium", count = 10 } = params;
    
    const systemPrompt = `You are an expert educational content creator. Generate ${count} multiple choice questions for ${className} ${subject}${topic ? ` focusing on ${topic}` : ""}.

Requirements:
- Questions should be appropriate for ${className} level
- Difficulty: ${difficulty}
- Each question should have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Include a brief explanation for the correct answer
- Cover different aspects of the topic
- Questions should test understanding, not just memorization

Format your response as a JSON array with this exact structure:
[
  {
    "id": "unique_id",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this answer is correct"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              question: { type: "string" },
              options: { 
                type: "array", 
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              },
              correctAnswer: { type: "string" },
              explanation: { type: "string" }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      },
      contents: `Generate ${count} quiz questions for ${className} ${subject}${topic ? ` on ${topic}` : ""} with ${difficulty} difficulty.`,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const questions: QuizQuestion[] = JSON.parse(rawJson);
    
    // Validate and ensure proper structure
    const validQuestions = questions.map((q, index) => ({
      id: q.id || `q_${index + 1}`,
      question: q.question || `Question ${index + 1}`,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : [
        "Option A", "Option B", "Option C", "Option D"
      ],
      correctAnswer: q.correctAnswer || q.options?.[0] || "Option A",
      explanation: q.explanation || "Explanation not provided"
    }));

    return validQuestions.slice(0, count);
  } catch (error) {
    console.error("Quiz generation error:", error);
    
    // Fallback questions if API fails
    const fallbackQuestions: QuizQuestion[] = Array.from({ length: params.count || 10 }, (_, i) => ({
      id: `fallback_${i + 1}`,
      question: `Sample ${params.subject} question ${i + 1} for ${params.class}?`,
      options: [
        "Option A - Sample answer",
        "Option B - Alternative answer", 
        "Option C - Another option",
        "Option D - Final option"
      ],
      correctAnswer: "Option A - Sample answer",
      explanation: "This is a sample question. Please check your Gemini API configuration."
    }));

    return fallbackQuestions;
  }
}

export async function generateReasoningChallenge(difficulty: string, category: string): Promise<ReasoningChallenge> {
  try {
    const difficultyDescriptions = {
      easy: "simple logical reasoning suitable for beginners",
      medium: "intermediate problem-solving requiring some analysis", 
      hard: "advanced critical thinking with complex reasoning"
    };

    const categoryDescriptions = {
      logic: "logic puzzles and deductive reasoning",
      number_series: "number sequences and mathematical patterns",
      pattern_match: "visual or conceptual pattern recognition",
      analytical: "analytical reasoning and problem solving"
    };

    const systemPrompt = `You are an expert puzzle creator. Create a single reasoning challenge with ${difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions] || 'medium difficulty'} focusing on ${categoryDescriptions[category as keyof typeof categoryDescriptions] || 'general reasoning'}.

Requirements:
- The question should be clear and unambiguous
- Provide a single, specific correct answer
- The answer should be concise (1-3 words or a number)
- Difficulty: ${difficulty}
- Category: ${category}

Format your response as JSON:
{
  "question": "Clear question or puzzle statement",
  "answer": "Exact answer (brief)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" }
          },
          required: ["question", "answer"]
        }
      },
      contents: `Create a ${difficulty} ${category} reasoning challenge.`,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const challenge = JSON.parse(rawJson);
    
    return {
      question: challenge.question || "What comes next in the sequence: 2, 4, 8, 16, ?",
      answer: challenge.answer || "32"
    };
  } catch (error) {
    console.error("Reasoning challenge generation error:", error);
    
    // Fallback challenges based on difficulty and category
    const fallbackChallenges = {
      easy: {
        logic: { 
          question: "If all cats are animals, and Fluffy is a cat, what is Fluffy?", 
          answer: "animal" 
        },
        number_series: { 
          question: "What comes next: 2, 4, 6, 8, ?", 
          answer: "10" 
        },
        pattern_match: { 
          question: "What comes next: A, B, C, D, ?", 
          answer: "E" 
        },
        analytical: { 
          question: "If today is Monday, what day will it be in 3 days?", 
          answer: "Thursday" 
        }
      },
      medium: {
        logic: { 
          question: "In a group of 5 people, if everyone shakes hands with everyone else exactly once, how many handshakes occur?", 
          answer: "10" 
        },
        number_series: { 
          question: "What comes next: 1, 1, 2, 3, 5, 8, ?", 
          answer: "13" 
        },
        pattern_match: { 
          question: "What comes next: 2, 6, 12, 20, 30, ?", 
          answer: "42" 
        },
        analytical: { 
          question: "A train leaves at 2 PM traveling at 60 mph. Another leaves at 3 PM from the same station traveling at 80 mph in the same direction. When will the second train catch up?", 
          answer: "8 PM" 
        }
      },
      hard: {
        logic: { 
          question: "Four people need to cross a bridge at night with only one flashlight. The bridge can hold only 2 people at a time. They walk at different speeds: 1, 2, 5, and 10 minutes. What's the minimum time for all to cross?", 
          answer: "17" 
        },
        number_series: { 
          question: "What comes next: 2, 6, 30, 210, 2310, ?", 
          answer: "30030" 
        },
        pattern_match: { 
          question: "If MONDAY is 123456, TEAM is 8564, what is STAY?", 
          answer: "9856" 
        },
        analytical: { 
          question: "You have 12 balls, all identical except one is heavier. Using a balance scale only 3 times, how do you find the heavy ball?", 
          answer: "divide groups" 
        }
      }
    };

    const difficultyLevel = difficulty as keyof typeof fallbackChallenges;
    const categoryType = category as keyof typeof fallbackChallenges.easy;
    
    return fallbackChallenges[difficultyLevel]?.[categoryType] || fallbackChallenges.medium.logic;
  }
}
