import React, { useState } from 'react';
import Logo from './icons/Logo';
import AdminKeyModal from './AdminKeyModal';
import Spinner from './common/Spinner';

interface LoginScreenProps {
  onLogin: (role: 'student' | 'admin', apiKey?: string) => Promise<void>;
}

const allowedStudents = [
  { email: 'daongoclinh@gmail.com', password: '123456' },
  { email: 'johntdaniel18@gmail.com', password: 'trung123' },
];

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

    const isValidStudent = allowedStudents.some(
      student => student.email === email && student.password === password
    );

    if (!isValidStudent) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    if (!apiKey.trim()) {
        setError("Please enter your Gemini API Key.");
        return;
    }
    setIsLoading(true);
    
    try {
        await onLogin('student', apiKey);
        // On success, the parent component re-renders, and this screen is unmounted.
    } catch (err: any) {
        setError(err.message || "An unknown error occurred during login.");
        setIsLoading(false); // Only set loading to false on error
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