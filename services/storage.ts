
import { Session, User, UserPreferences } from '../types';
import { MOCK_SESSIONS_KEY } from '../constants';

const USERS_KEY = 'preppal_users';
const CURRENT_USER_KEY = 'preppal_current_user';

// --- User Management (Simulated) ---

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

export const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return null;
  
  // Simple check for mock environment. 
  // In a real app, never store passwords in plain text; use hashing (e.g., bcrypt)
  if (user.password && user.password !== password) {
    return null; 
  }
  
  return user;
};

export const registerUser = (name: string, email: string, password: string): User => {
  const existing = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error("User already exists");
  
  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    password, // Storing simply for this mock demo
    joinedAt: Date.now()
  };
  saveUser(newUser);
  return newUser;
};

// --- Session Management ---

export const getSessions = (userId?: string): Session[] => {
  try {
    const stored = localStorage.getItem(MOCK_SESSIONS_KEY);
    const allSessions: Session[] = stored ? JSON.parse(stored) : [];
    if (userId) {
      return allSessions.filter(s => s.userId === userId);
    }
    return allSessions;
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

export const saveSession = (session: Session) => {
  try {
    const stored = localStorage.getItem(MOCK_SESSIONS_KEY);
    const allSessions: Session[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = allSessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      allSessions[existingIndex] = session;
    } else {
      allSessions.unshift(session);
    }
    
    localStorage.setItem(MOCK_SESSIONS_KEY, JSON.stringify(allSessions));
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const createNewSession = (preferences: UserPreferences, userId: string): Session => {
  const newSession: Session = {
    id: crypto.randomUUID(),
    userId,
    preferences,
    messages: [],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    status: 'active',
  };
  saveSession(newSession);
  return newSession;
};

export const getSessionById = (id: string): Session | undefined => {
  const stored = localStorage.getItem(MOCK_SESSIONS_KEY);
  const allSessions: Session[] = stored ? JSON.parse(stored) : [];
  return allSessions.find(s => s.id === id);
};