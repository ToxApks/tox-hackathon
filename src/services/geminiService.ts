import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Topic, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const topicExtractionService = async (text: string): Promise<Topic[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract structured learning topics from the following educational text. 
    For each topic, provide a title, a detailed explanation, 3-5 key points, and a practical example.
    Text: ${text.slice(0, 10000)}`, // Limit text for token constraints
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            example: { type: Type.STRING },
          },
          required: ["title", "content", "keyPoints", "example"],
        },
      },
    },
  });

  const topics: any[] = JSON.parse(response.text || "[]");
  return topics.map((t, i) => ({
    ...t,
    id: `topic-${i}`,
    order: i,
    completed: false,
  }));
};

export const explanationGenerator = async (topic: string, simple: boolean = false): Promise<string> => {
  const prompt = simple 
    ? `Explain the topic "${topic}" simply, as if explaining to a 10-year-old.`
    : `Provide a comprehensive academic explanation for the topic "${topic}".`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "No explanation generated.";
};

export const quizGenerator = async (topicTitle: string, topicContent: string): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 3-5 multiple-choice quiz questions for the topic: "${topicTitle}". 
    Context: ${topicContent.slice(0, 2000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer", "explanation"],
        },
      },
    },
  });

  const questions: any[] = JSON.parse(response.text || "[]");
  return questions.map((q, i) => ({ ...q, id: `q-${i}` }));
};

export const mentorChatService = async (
  message: string, 
  history: { role: 'user' | 'model', text: string }[],
  context?: { currentTopic?: string, userProgress?: number }
): Promise<string> => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a helpful AI Mentor for engineering students. 
      Current Context: ${JSON.stringify(context || {})}
      Your goal is to explain concepts, suggest next steps, and identify weak areas based on user performance.
      Be encouraging, precise, and academic yet accessible.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I'm sorry, I couldn't process that.";
};

export interface FileCategorization {
  subject: string;
  category: string;
  suggestedTopics: string[];
}

export const categorizeDocument = async (text: string): Promise<FileCategorization> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this document text and categorize it for educational resources.
Give subject, main category, and 3-5 suggested topic titles.
Text: ${text.slice(0, 5000)}

Return JSON: {
  "subject": "Subject name",
  "category": "e.g. Data Structures, Algorithms, Web Development",
  "suggestedTopics": ["Topic1", "Topic2", "Topic3"]
}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          category: { type: Type.STRING },
          suggestedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["subject", "category", "suggestedTopics"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
};
