
import React, { useEffect, useState } from 'react';
import { Session } from '../types';
import { getSessions } from '../services/storage';
import { MessageSquareIcon, HistoryIcon, ArrowRightIcon, SparklesIcon } from '../components/Icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  userId: string;
  onResume: (session: Session) => void;
  onNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, onResume, onNew }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(getSessions(userId));
  }, [userId]);

  // Simple stats
  const totalSessions = sessions.length;
  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);
  const questionsAnswered = Math.floor(totalMessages / 2);

  // Calculate Average Score
  let totalScore = 0;
  let scoredAnswers = 0;
  
  sessions.forEach(s => {
      s.messages.forEach(m => {
          if (m.data?.feedback?.score) {
              totalScore += m.data.feedback.score;
              scoredAnswers++;
          }
      });
  });

  const averageScore = scoredAnswers > 0 ? Math.round(totalScore / scoredAnswers) : 0;
  
  // Data for chart: Average score per session over time
  const chartData = sessions
    .filter(s => s.messages.some(m => m.data?.feedback?.score)) // Only sessions with scores
    .slice(0, 10) // Last 10
    .map(s => {
        const scores = s.messages.map(m => m.data?.feedback?.score || 0).filter(s => s > 0);
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        return {
            name: new Date(s.lastUpdated).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
            score: avg,
            role: s.preferences.jobRole
        };
    }).reverse();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Progress</h1>
          <p className="text-slate-500">Welcome back! Ready to continue your prep?</p>
        </div>
        <button 
            onClick={onNew}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
            New Practice Session
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <HistoryIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Total Sessions</p>
                    <p className="text-2xl font-bold text-slate-900">{totalSessions}</p>
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <MessageSquareIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Questions Answered</p>
                    <p className="text-2xl font-bold text-slate-900">{questionsAnswered}</p>
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Avg. Score</p>
                    <p className="text-2xl font-bold text-slate-900">{averageScore > 0 ? averageScore : '-'}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hidden lg:block">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h3>
            <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{stroke: '#6366f1', strokeWidth: 2}}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* Recent Sessions List */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 mb-4">No sessions yet.</p>
            <button onClick={onNew} className="text-indigo-600 font-medium hover:underline">Start your first one!</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => onResume(session)}
                className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                            {session.preferences.jobRole}
                        </h3>
                        {session.messages.length > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                                {Math.floor(session.messages.length / 2)} Qs
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                        {session.preferences.company || "General"} • {new Date(session.lastUpdated).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
