
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Landing } from './views/Landing';
import { Setup } from './views/Setup';
import { Dashboard } from './views/Dashboard';
import { InterviewSession } from './views/InterviewSession';
import { Auth } from './views/Auth';
import { AppView, Session, UserPreferences, User } from './types';
import { createNewSession } from './services/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const handleStart = () => {
    if (!currentUser) {
      setCurrentView(AppView.AUTH);
    } else {
      setCurrentView(AppView.SETUP);
    }
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setCurrentView(AppView.LANDING);
      setActiveSession(null);
  };

  const handleSetupComplete = (prefs: UserPreferences) => {
    if (!currentUser) return;
    const newSession = createNewSession(prefs, currentUser.id);
    setActiveSession(newSession);
    setCurrentView(AppView.INTERVIEW);
  };

  const handleResumeSession = (session: Session) => {
    setActiveSession(session);
    setCurrentView(AppView.INTERVIEW);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setActiveSession(updatedSession);
  };

  const handleNavigate = (view: AppView) => {
    if (view === AppView.DASHBOARD && !currentUser) {
        setCurrentView(AppView.AUTH);
        return;
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <Landing onStart={handleStart} />;
      case AppView.AUTH:
        return <Auth onLogin={handleLogin} />;
      case AppView.SETUP:
        return <Setup onComplete={handleSetupComplete} />;
      case AppView.DASHBOARD:
        if (!currentUser) return <Auth onLogin={handleLogin} />;
        return <Dashboard userId={currentUser.id} onResume={handleResumeSession} onNew={handleStart} />;
      case AppView.INTERVIEW:
        if (!activeSession) return <Setup onComplete={handleSetupComplete} />;
        return (
          <InterviewSession 
            session={activeSession} 
            onUpdateSession={handleUpdateSession}
            onEndSession={() => handleNavigate(AppView.DASHBOARD)} 
          />
        );
      default:
        return <Landing onStart={handleStart} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
        {currentUser && currentView !== AppView.INTERVIEW && (
            <div className="absolute top-4 right-4 z-50 sm:top-5 sm:right-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 hidden sm:inline">Hi, {currentUser.name.split(' ')[0]}</span>
                    <button 
                        onClick={handleLogout}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        )}
      {renderContent()}
    </Layout>
  );
}
