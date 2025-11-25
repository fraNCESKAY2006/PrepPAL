
export interface UserPreferences {
  jobRole: string;
  company?: string;
  experienceLevel: string;
  focusAreas?: string;
}

export interface FeedbackData {
  praise: string;
  critique: string;
  improvementTip: string;
  exampleAnswer: string;
  score: number;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  text?: string; // For simple text
  data?: {
    feedback?: FeedbackData;
    nextQuestion?: string;
  }; // For structured AI responses
  timestamp: number;
}

export interface Session {
  id: string;
  userId: string;
  preferences: UserPreferences;
  messages: Message[];
  createdAt: number;
  lastUpdated: number;
  status: 'active' | 'completed';
}

export interface User {
  id: string;
  email: string;
  password?: string; // Optional to handle legacy mock users if any
  name: string;
  joinedAt: number;
}

export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  SETUP = 'SETUP',
  INTERVIEW = 'INTERVIEW',
  DASHBOARD = 'DASHBOARD',
}