export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  progress: number; // 0-100
  lastTopicId?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'note';
  uploadDate: string;
  topics: Topic[];
  pdfUrl?: string;
  url?: string;
  fileSize?: number;
  fileName?: string;
  subject?: string;
  category?: string;
  folder?: string; // optional folder/category grouping
  userId?: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  example: string;
  order: number;
  completed: boolean;
  score?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
