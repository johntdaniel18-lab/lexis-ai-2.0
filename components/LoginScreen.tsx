import React, { useState } from 'react';
import Logo from './icons/Logo';
import AdminKeyModal from './AdminKeyModal';
import Spinner from './common/Spinner';
import { loginUser } from '../services/firebase';
import YoutubeIcon from './icons/YoutubeIcon';

interface LoginScreenProps {
  onLogin: (role: 'student' | 'admin', apiKey?: string) => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLoginClick = () => {
    setIsAdminModalOpen(true);
  };
  
  const handleModalSuccess = () => {
    onLogin('admin');
    setIsAdminModalOpen(false);
  };

  const handleModalClose = () => {
    setIsAdminModalOpen(false);
  };
  
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!apiKey.trim()) {
        setError("Please enter your Gemini API Key.");
        setIsLoading(false);
        return;
    }

    try {
        // 1. Authenticate with Firebase
        await loginUser(email, password);
        
        // 2. Validate Gemini Key and set App State
        await onLogin('student', apiKey);
        
        // On success, App.tsx detects auth change and re-renders
    } catch (err: any) {
        console.error(err);
        let msg: string;

        // Prioritize user-friendly messages from our API validation
        if (err.message && (err.message.includes("API Key") || err.message.includes("rate limit"))) {
            msg = err.message;
        } 
        // Handle specific Firebase auth errors
        else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
             msg = "Access Denied. Your account was not found or the password was incorrect. If you haven't been invited yet, please contact the administrator.";
        } 
        else if (err.code === 'auth/too-many-requests') {
             msg = "Access temporarily disabled due to many failed login attempts. Please wait a few minutes or reset your password to restore access immediately.";
        }
        // Fallback for other errors
        else {
             msg = "An unexpected error occurred during login. Please check your connection and try again.";
        }
        
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-200">
          <div>
            <div className="flex justify-center">
              <Logo className="h-16 w-16" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Welcome to <span className="text-orange-500">Lexis AI</span>
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Your personal AI tutor for IELTS writing mastery.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleStudentLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="api-key" className="sr-only">Gemini API Key</label>
                <input id="api-key" name="api-key" type="password" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Your Gemini API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input id="email-address" name="email" type="email" autoComplete="email" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="text-right -mt-4">
              <a
                href="https://www.youtube.com/watch?v=dEdQOGcpSRg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 font-medium transition-colors"
                aria-label="Watch video tutorial on how to get a Gemini API key"
              >
                <YoutubeIcon className="h-4 w-4" />
                How to get a Gemini API Key?
              </a>
            </div>
            
            {error && (
              <div className="text-center p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                <p>{error}</p>
              </div>
            )}

            <div>
              <button type="submit" 
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-orange-500 disabled:bg-orange-400 disabled:cursor-wait"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : 'Start Practice'}
              </button>
            </div>
          </form>
          <div className="text-center">
              <button
                  onClick={handleAdminLoginClick}
                  className="font-medium text-sm text-orange-600 hover:text-orange-500"
              >
                  Access Admin Portal
              </button>
          </div>
        </div>
      </div>
      <AdminKeyModal
        isOpen={isAdminModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default LoginScreen;