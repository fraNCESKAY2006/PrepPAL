import React from 'react';
import { HomeIcon, HistoryIcon, SparklesIcon } from './Icons';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => onNavigate(AppView.LANDING)}
            >
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">PrepPal</span>
            </div>
            
            <div className="flex gap-4 sm:gap-6">
              <button 
                onClick={() => onNavigate(AppView.LANDING)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === AppView.LANDING ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button 
                onClick={() => onNavigate(AppView.DASHBOARD)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === AppView.DASHBOARD ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <HistoryIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
};
