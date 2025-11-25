
import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/storage';
import { ArrowRightIcon, SparklesIcon } from '../components/Icons';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    try {
      if (isLogin) {
        const user = loginUser(email, password);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        if (!name) {
            setError('Name is required');
            return;
        }
        const newUser = registerUser(name, email, password);
        onLogin(newUser);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-md w-full">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-xl mb-4 text-indigo-600">
                <SparklesIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 mt-2">
                {isLogin ? 'Sign in to access your practice history.' : 'Start your journey to interview mastery.'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Jane Doe"
                    />
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="name@example.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-4 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRightIcon className="ml-2 w-5 h-5" />
            </button>
        </form>

        <div className="mt-6 text-center">
            <button
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                }}
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
        </div>
      </div>
    </div>
  );
};