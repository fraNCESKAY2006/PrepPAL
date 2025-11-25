
import React, { useState, useEffect, useRef } from 'react';
import { Session, Message } from '../types';
import { generateInitialQuestion, generateFeedbackAndNextQuestion } from '../services/geminiService';
import { saveSession } from '../services/storage';
import { SendIcon, SparklesIcon, MessageSquareIcon, CheckCircleIcon } from '../components/Icons';

interface InterviewSessionProps {
  session: Session;
  onUpdateSession: (updatedSession: Session) => void;
  onEndSession: () => void;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ session, onUpdateSession, onEndSession }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [expandedExamples, setExpandedExamples] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize session with a greeting if empty
  useEffect(() => {
    const init = async () => {
      if (session.messages.length === 0 && !initialized) {
        setLoading(true);
        setInitialized(true);
        const firstQuestion = await generateInitialQuestion(session.preferences);
        const newMessage: Message = {
          id: crypto.randomUUID(),
          role: 'ai',
          text: firstQuestion,
          timestamp: Date.now(),
        };
        const updatedSession = { ...session, messages: [newMessage], lastUpdated: Date.now() };
        onUpdateSession(updatedSession);
        saveSession(updatedSession);
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setLoading(true);

    // 1. Add User Answer
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };
    
    let updatedMessages = [...session.messages, userMsg];
    let updatedSession = { ...session, messages: updatedMessages, lastUpdated: Date.now() };
    onUpdateSession(updatedSession);

    // 2. Call AI for Feedback & Next Question
    try {
      const { feedback, nextQuestion } = await generateFeedbackAndNextQuestion(
        session.preferences,
        updatedMessages,
        userText
      );

      // 3. Add AI Response (Structured)
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        data: {
          feedback: feedback,
          nextQuestion: nextQuestion
        },
        timestamp: Date.now(),
      };

      updatedMessages = [...updatedMessages, aiMsg];
      updatedSession = { ...session, messages: updatedMessages, lastUpdated: Date.now() };
      
      onUpdateSession(updatedSession);
      saveSession(updatedSession);

    } catch (error) {
      console.error("Failed to generate response", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this session? Your progress will be saved.")) {
        const completedSession = { ...session, status: 'completed' as const, lastUpdated: Date.now() };
        onUpdateSession(completedSession);
        saveSession(completedSession);
        onEndSession();
    }
  };

  const toggleExample = (id: string) => {
    setExpandedExamples(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const questionCount = session.messages.filter(m => m.role === 'user').length;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">{session.preferences.jobRole}</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            {session.preferences.experienceLevel}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
             <div className="flex flex-col items-end hidden sm:flex">
                 <div className="text-xs text-slate-500 font-medium mb-1">
                    Answered: <span className="text-indigo-600 font-bold">{questionCount}</span>
                </div>
                 <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{ width: `${Math.min((questionCount / 5) * 100, 100)}%` }}
                    />
                </div>
            </div>
            
            <button 
                onClick={handleEndSession}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-slate-200 rounded-lg transition-all"
            >
                End Session
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
        {session.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto w-full'}`}>
              
              {/* User Message */}
              {msg.role === 'user' && (
                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-6 py-4 shadow-sm text-base leading-relaxed">
                  {msg.text}
                </div>
              )}

              {/* AI Message */}
              {msg.role === 'ai' && (
                <div className="space-y-4">
                  {/* Initial text question (if simple text) */}
                  {msg.text && (
                    <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none px-6 py-5 shadow-sm text-base leading-relaxed">
                      {msg.text}
                    </div>
                  )}

                  {/* Feedback Card */}
                  {msg.data?.feedback && (
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none overflow-hidden shadow-sm animate-fade-in-up">
                      {/* Praise & Score Section */}
                      <div className="bg-green-50/50 p-4 border-b border-green-100/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1 bg-green-100 rounded-full">
                             <SparklesIcon className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wider block mb-1">Nice Work</span>
                            <p className="text-slate-700 text-sm">{msg.data.feedback.praise}</p>
                          </div>
                        </div>
                        {/* Score Badge */}
                        <div className="flex-shrink-0">
                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full border-4 border-white shadow-sm"
                                 style={{ backgroundColor: msg.data.feedback.score >= 80 ? '#dcfce7' : msg.data.feedback.score >= 60 ? '#fef3c7' : '#fee2e2' }}>
                                <span className={`text-sm font-bold ${msg.data.feedback.score >= 80 ? 'text-green-700' : msg.data.feedback.score >= 60 ? 'text-amber-700' : 'text-red-700'}`}>
                                    {msg.data.feedback.score}
                                </span>
                                <span className="text-[9px] text-slate-500 uppercase font-bold">Score</span>
                            </div>
                        </div>
                      </div>

                      {/* Critique & Tip Section */}
                      <div className="p-4 space-y-4">
                         <div className="flex items-start gap-3">
                            <div className="mt-1 min-w-[20px]">
                                <span className="text-amber-500 text-lg leading-none">💡</span>
                            </div>
                            <p className="text-slate-600 text-sm italic">"{msg.data.feedback.critique}"</p>
                         </div>
                         
                         <div className="pl-8 space-y-4">
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                 <span className="text-xs font-bold text-indigo-600 block mb-1">PRO TIP</span>
                                 <p className="text-slate-700 text-sm font-medium">{msg.data.feedback.improvementTip}</p>
                             </div>

                             {/* Expandable Example Answer */}
                             <div className="border border-indigo-100 rounded-lg overflow-hidden">
                                <button 
                                    onClick={() => toggleExample(msg.id)}
                                    className="w-full flex items-center justify-between p-3 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-left"
                                >
                                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        SEE EXAMPLE ANSWER
                                    </span>
                                    <span className={`transform transition-transform ${expandedExamples[msg.id] ? 'rotate-180' : ''} text-indigo-400`}>▼</span>
                                </button>
                                {expandedExamples[msg.id] && (
                                    <div className="p-4 bg-indigo-50/20 text-sm text-slate-700 border-t border-indigo-100 animate-fade-in">
                                        <p className="italic leading-relaxed">{msg.data.feedback.exampleAnswer}</p>
                                    </div>
                                )}
                             </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Next Question */}
                  {msg.data?.nextQuestion && (
                    <div className="flex gap-3 animate-fade-in-up delay-100">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                            <MessageSquareIcon className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none px-6 py-5 shadow-sm text-base font-medium leading-relaxed">
                        {msg.data.nextQuestion}
                        </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white animate-pulse">
               <SparklesIcon className="w-4 h-4" />
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-end gap-2">
            <div className="relative flex-1">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder={loading ? "Waiting for coach..." : "Type your answer here..."}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[56px] max-h-32 text-slate-800 placeholder-slate-400 transition-all"
                    rows={1}
                    disabled={loading}
                    style={{ height: 'auto', minHeight: '56px' }}
                />
            </div>
            <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="h-[56px] w-[56px] flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">Press Enter to send • Shift + Enter for new line</p>
      </div>
    </div>
  );
};
