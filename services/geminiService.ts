
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, Message } from "../types";

const createClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

// Response schema for the "Magic Loop"
const INTERVIEW_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    feedback: {
      type: Type.OBJECT,
      properties: {
        praise: { type: Type.STRING, description: "A short, encouraging sentence highlighting what was good." },
        critique: { type: Type.STRING, description: "A gentle, constructive observation on what could be improved." },
        improvementTip: { type: Type.STRING, description: "Actionable advice for the next answer." },
        exampleAnswer: { type: Type.STRING, description: "A concrete example of how a strong candidate would answer the previous question, incorporating the improvement tip." },
        score: { type: Type.INTEGER, description: "A score from 0 to 100 rating the quality of the answer." },
      },
      required: ["praise", "critique", "improvementTip", "exampleAnswer", "score"],
    },
    nextQuestion: {
      type: Type.STRING,
      description: "The next interview question to ask the user.",
    },
  },
  required: ["feedback", "nextQuestion"],
};

export const generateInitialQuestion = async (prefs: UserPreferences): Promise<string> => {
  const ai = createClient();
  
  const prompt = `
    You are a friendly, encouraging, and professional interview coach. 
    The user is preparing for a ${prefs.jobRole} role.
    Their experience level is: ${prefs.experienceLevel}.

    Start the session by welcoming them warmly (keep it brief) and asking the FIRST interview question.
    CRITICAL: The question MUST be strictly relevant to the job role: ${prefs.jobRole}. 
    Do not ask a generic question if it doesn't fit the role (e.g., don't ask a teacher about system design unless it's relevant).
    
    Return ONLY the welcome message combined with the question as a plain string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          temperature: 0.7
      }
    });
    return response.text || "Hello! Let's get started. Tell me a little about yourself.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the interview server. Let's try again. Tell me about yourself.";
  }
};

export const generateFeedbackAndNextQuestion = async (
  prefs: UserPreferences,
  history: Message[],
  latestAnswer: string
): Promise<{ feedback: any; nextQuestion: string }> => {
  const ai = createClient();

  // Construct history context
  const conversationContext = history.map(msg => 
    `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text || (msg.data ? msg.data.nextQuestion : '')}`
  ).join('\n');

  const prompt = `
    You are a supportive interview coach.
    Context:
    Role: ${prefs.jobRole}
    Experience: ${prefs.experienceLevel}

    Conversation History:
    ${conversationContext}

    Candidate's Latest Answer:
    "${latestAnswer}"

    Task:
    1. Analyze the answer based on the role (${prefs.jobRole}) and experience level.
    2. Provide a Score (0-100). Be fair but encouraging.
    3. Provide friendly, constructive feedback (Praise, Critique, Tip).
    4. Provide an 'exampleAnswer' - a corrected or "ideal" version of how they could have answered.
    5. Generate the NEXT question based on the context.
    
    CRITICAL: The NEXT question must be highly relevant to the role of ${prefs.jobRole}.
    If the user is a Teacher, ask about classroom management, curriculum, or students.
    If the user is a Developer, ask about code, systems, or projects.
    Do not drift into irrelevant topics.

    Tone: Casual, motivating, professional. Like a helpful mentor.
    Format: JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: INTERVIEW_RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Loop Error:", error);
    // Fallback if JSON parsing fails
    return {
        feedback: {
            praise: "Good effort!",
            critique: "Let's try to be more specific.",
            improvementTip: "Use the STAR method.",
            exampleAnswer: "A better answer would focus on specific metrics and outcomes.",
            score: 70
        },
        nextQuestion: `Could you elaborate on your experience relevant to the ${prefs.jobRole} position?`
    };
  }
};
