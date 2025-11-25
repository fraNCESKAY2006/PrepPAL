
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { EXPERIENCE_LEVELS } from '../constants';
import { ArrowRightIcon, UserIcon } from '../components/Icons';

interface SetupProps {
  onComplete: (prefs: UserPreferences) => void;
}

export const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [role, setRole] = useState('');
  const [exp, setExp] = useState(EXPERIENCE_LEVELS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      onComplete({
        jobRole: role,
        company: '', 
        experienceLevel: exp,
        focusAreas: '',
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-800">Setup Your Session</h2>
          <p className="text-slate-500 mt-2">Tell us the role you are applying for.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Job Role <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  required
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow placeholder-slate-400"
                  placeholder="e.g. Teacher, Nurse, Marketing Manager"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Experience Level</label>
              <select 
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
              >
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={!role}
              className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Start Practice Session
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
