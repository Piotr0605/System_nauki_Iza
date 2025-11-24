export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface DayStrategy {
  methodName: string;
  description: string;
  actionableStep: string;
}

export interface DayPlan {
  dayLabel: string; // e.g., "Day 0: Fundamentals"
  topicSummary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  strategy: DayStrategy;
}

export interface StudyPlan {
  title: string;
  days: DayPlan[];
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
}

export enum StudyMode {
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ',
  STRATEGY = 'STRATEGY',
  TUTOR = 'TUTOR',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}