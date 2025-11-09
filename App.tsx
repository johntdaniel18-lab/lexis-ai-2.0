import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import TestScreen from './components/TestScreen';
import AdminDashboardScreen from './components/admin/AdminDashboardScreen';
import FeedbackViewer from './components/FeedbackViewer';
import { IeltsTest, CompletedTest } from './types';
import { IELTS_TESTS, TESTS_VERSION } from './constants';
import Button from './components/common/Button';
import Logo from './components/icons/Logo';
import { validateApiKey } from './services/geminiService';

const APP_HISTORY_KEY = 'lexis-ai-test-history';
const APP_TESTS_KEY = 'lexis-ai-tests';
const API_KEY_STORAGE_KEY = 'lexis-ai-api-key';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [tests, setTests] = useState<IeltsTest[]>(() => {
    try {
      const savedDataString = window.localStorage.getItem(APP_TESTS_KEY);
      if (!savedDataString) {
        return IELTS_TESTS; // No saved data, use defaults
      }

      const savedData = JSON.parse(savedDataString);

      // Check for old format (just an array) or a version mismatch.
      if (Array.isArray(savedData) || savedData.version !== TESTS_VERSION) {
        // Data is outdated, force update to defaults.
        // This will overwrite the old local storage in the useEffect below.
        return IELTS_TESTS;
      }
      
      // Data is valid and the version matches.
      return savedData.tests;

    } catch (error) {
      console.error("Could not load tests from localStorage, using defaults.", error);
      return IELTS_TESTS; // Fallback on any error
    }
  });

  useEffect(() => {
    try {
      const dataToSave = {
        version: TESTS_VERSION,
        tests: tests,
      };
      window.localStorage.setItem(APP_TESTS_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Could not save tests to localStorage", error);
    }
  }, [tests]);

  const [selectedTest, setSelectedTest] = useState<IeltsTest | null>(null);
  const [viewingCompletedTest, setViewingCompletedTest] = useState<CompletedTest | null>(null);

  const [completedTests, setCompletedTests] = useState<CompletedTest[]>(() => {
    try {
      const savedHistory = window.localStorage.getItem(APP_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Could not load test history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(completedTests));
    } catch (error) {
      console.error("Could not save test history to localStorage", error);
    }
  }, [completedTests]);

  const controlHeader = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.scrollY < lastScrollY || window.scrollY < 10) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(false);
      }
      setLastScrollY(window.scrollY);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [controlHeader]);


  const handleLogin = useCallback(async (role: 'student' | 'admin', apiKey?: string) => {
    if (role === 'student') {
        if (!apiKey) {
            throw new Error("API Key is required to log in as a student.");
        }
        await validateApiKey(apiKey);
        sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }
    setUserRole(role);
  }, []);

  const handleLogout = useCallback(() => {
    setUserRole(null);
    setSelectedTest(null);
    setViewingCompletedTest(null);
    sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  }, []);

  const handleSelectTest = useCallback((test: IeltsTest) => {
    setSelectedTest(test);
  }, []);
  
  const handleViewCompletedTest = useCallback((completedTest: CompletedTest) => {
    setViewingCompletedTest(completedTest);
  }, []);

  const handleExit = useCallback(() => {
    setSelectedTest(null);
    setViewingCompletedTest(null);
  }, []);

  const handleSaveTestResult = useCallback((result: Omit<CompletedTest, 'id' | 'completionDate'>) => {
    const newCompletedTest: CompletedTest = {
      ...result,
      id: `completed-${Date.now()}`,
      completionDate: new Date().toISOString(),
    };
    setCompletedTests(prev => [...prev, newCompletedTest]);
  }, []);

  const handleAddNewTest = useCallback((newTest: Omit<IeltsTest, 'id'>) => {
    setTests(prevTests => [
        ...prevTests,
        { ...newTest, id: prevTests.length > 0 ? Math.max(...prevTests.map(t => t.id)) + 1 : 1 }
    ]);
  }, []);

  const handleUpdateTest = useCallback((updatedTest: IeltsTest) => {
    setTests(prevTests => prevTests.map(test => 
      test.id === updatedTest.id ? updatedTest : test
    ));
  }, []);


  const renderContent = () => {
    if (!userRole) {
      return <LoginScreen onLogin={handleLogin} />;
    }
    if (userRole === 'admin') {
      return <AdminDashboardScreen tests={tests} onAddNewTest={handleAddNewTest} onUpdateTest={handleUpdateTest} />;
    }
    if (userRole === 'student') {
      if (viewingCompletedTest) {
        return <FeedbackViewer testResult={viewingCompletedTest} />;
      }
      if (selectedTest) {
        return <TestScreen test={selectedTest} onExit={handleExit} onSaveTestResult={handleSaveTestResult} />;
      }
      return <DashboardScreen tests={tests} onSelectTest={handleSelectTest} completedTests={completedTests} onViewCompletedTest={handleViewCompletedTest} />;
    }
    return null;
  };
  
  const isWorkspaceView = userRole === 'student' && (selectedTest || viewingCompletedTest);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
      <header className={`bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200 transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`${isWorkspaceView ? '' : 'max-w-7xl'} mx-auto py-2 px-4 sm:px-6 lg:px-8 flex items-center justify-between`}>
           <h1 className="flex items-center gap-2 text-xl tracking-tight text-slate-800">
            <Logo className="h-10 w-10" />
            <span className="font-bold">Lexis<span className="font-extrabold text-orange-500 ml-1">AI</span></span>
          </h1>
          {userRole && (
            <div className="flex items-center gap-4">
              {isWorkspaceView && (
                <Button onClick={handleExit} variant="secondary">
                  Back to Dashboard
                </Button>
              )}
               <Button onClick={handleLogout} variant="primary">
                  Logout
                </Button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow">
        <div className={`${isWorkspaceView ? '' : 'max-w-7xl'} mx-auto sm:px-6 lg:px-8 py-8`}>
          {renderContent()}
        </div>
      </main>
      <footer className="w-full py-6 text-center text-sm text-slate-400 border-t border-slate-200">
        © 2025 John Vũ. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
