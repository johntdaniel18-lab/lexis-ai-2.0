import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import TestScreen from './components/TestScreen';
import AdminDashboardScreen from './components/admin/AdminDashboardScreen';
import FeedbackViewer from './components/FeedbackViewer';
import { IeltsTest, CompletedTest, DrillCriterion, PracticeMode } from './types';
import { IELTS_TESTS, TESTS_VERSION } from './constants';
import Button from './components/common/Button';
import Logo from './components/icons/Logo';
import { validateApiKey } from './services/geminiService';
import DrillScreen from './components/DrillScreen';
import ProgressHubScreen from './components/ProgressHubScreen';
import LearnScreen from './components/LearnScreen';
import ModeSelectionScreen from './components/ModeSelectionScreen';

const APP_HISTORY_KEY = 'lexis-ai-test-history';
const APP_TESTS_KEY = 'lexis-ai-tests';
const API_KEY_STORAGE_KEY = 'lexis-ai-api-key';

type StudentView = 'dashboard' | 'progress' | 'learn';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');

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
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null);
  const [viewingCompletedTest, setViewingCompletedTest] = useState<CompletedTest | null>(null);
  const [completedTestForRewrite, setCompletedTestForRewrite] = useState<CompletedTest | null>(null);
  const [activeDrill, setActiveDrill] = useState<{criterion: DrillCriterion; topic: string} | null>(null);


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
    setPracticeMode(null);
    setViewingCompletedTest(null);
    setCompletedTestForRewrite(null);
    setActiveDrill(null);
    setCurrentView('dashboard');
    sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  }, []);

  const handleSelectTest = useCallback((test: IeltsTest) => {
    setSelectedTest(test);
    setPracticeMode(null); // Reset mode, user will choose on the next screen
    setCompletedTestForRewrite(null); 
  }, []);

  const handleModeSelected = useCallback((mode: PracticeMode) => {
    setPracticeMode(mode);
  }, []);
  
  const handleViewCompletedTest = useCallback((completedTest: CompletedTest) => {
    setViewingCompletedTest(completedTest);
    setCompletedTestForRewrite(null); // Clear rewrite state
  }, []);

  const handleExit = useCallback(() => {
    setSelectedTest(null);
    setPracticeMode(null);
    setViewingCompletedTest(null);
    setCompletedTestForRewrite(null); 
    setActiveDrill(null);
    setCurrentView('dashboard'); // Always return to the main dashboard
  }, []);

  const handleCompleteTest = useCallback((result: Omit<CompletedTest, 'id' | 'completionDate'>) => {
    const newCompletedTest: CompletedTest = {
      ...result,
      id: `completed-${Date.now()}`,
      completionDate: new Date().toISOString(),
    };
    setCompletedTests(prev => [...prev, newCompletedTest]);
    setSelectedTest(null);
    setPracticeMode(null);
    setViewingCompletedTest(newCompletedTest);
  }, []);

  const handleRewriteTest = useCallback((testToRewrite: CompletedTest) => {
    const originalTest = tests.find(t => t.id === testToRewrite.testId);
    if (originalTest) {
      setCompletedTestForRewrite(testToRewrite);
      setSelectedTest(originalTest);
      setPracticeMode('mock'); // A rewrite is always a full mock test
      setViewingCompletedTest(null);
    } else {
      console.error("Could not find original test to rewrite.");
    }
  }, [tests]);

  const handleStartDrill = useCallback((criterion: DrillCriterion) => {
    const latestTest = completedTests.slice().reverse()[0];
    if (latestTest) {
        const originalTest = tests.find(t => t.id === latestTest.testId);
        const topic = originalTest?.tags?.find(tag => !tag.toLowerCase().includes('graph') && !tag.toLowerCase().includes('chart') && !tag.toLowerCase().includes('diagram') && !tag.toLowerCase().includes('table')) || originalTest?.tags?.[1] || 'general topics';
        setActiveDrill({ criterion, topic });
    }
  }, [completedTests, tests]);
  
  const handleStartFreestyleDrill = useCallback((criterion: DrillCriterion) => {
    // 1. Pick a random test
    const randomTest = tests[Math.floor(Math.random() * tests.length)];
    // 2. Pick a random, valid topic from its tags (excluding chart types)
    const validTopics = randomTest.tags?.filter(tag => 
        !['graph', 'chart', 'diagram', 'table'].some(chartType => tag.toLowerCase().includes(chartType))
    ) || [];
    const topic = validTopics[Math.floor(Math.random() * validTopics.length)] || 'general topics'; // Fallback
    // 3. Set the active drill
    setActiveDrill({ criterion, topic });
  }, [tests]);


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
      if (activeDrill) {
        return <DrillScreen 
            criterion={activeDrill.criterion} 
            topic={activeDrill.topic}
            onExit={handleExit}
        />;
      }
      if (viewingCompletedTest) {
        const originalTest = tests.find(t => t.id === viewingCompletedTest.testId);
        return <FeedbackViewer 
            testResult={viewingCompletedTest} 
            originalTest={originalTest}
            onRewrite={handleRewriteTest} 
            onExit={handleExit} 
            onStartDrill={handleStartDrill}
        />;
      }
      if (selectedTest && practiceMode) {
        return <TestScreen 
          test={selectedTest} 
          practiceMode={practiceMode}
          onExit={handleExit} 
          onCompleteTest={handleCompleteTest}
          completedTestForRewrite={completedTestForRewrite} 
        />;
      }
      if (selectedTest) {
        return <ModeSelectionScreen 
          test={selectedTest}
          onModeSelect={handleModeSelected}
          onExit={handleExit}
        />;
      }
       if (currentView === 'learn') {
          return <LearnScreen onStartFreestyleDrill={handleStartFreestyleDrill} />;
      }
      if (currentView === 'progress') {
          return <ProgressHubScreen 
            completedTests={completedTests} 
            onViewCompletedTest={handleViewCompletedTest}
            onStartDrill={handleStartDrill}
          />
      }
      return <DashboardScreen tests={tests} onSelectTest={handleSelectTest} />;
    }
    return null;
  };
  
  const isWorkspaceView = userRole === 'student' && (selectedTest || viewingCompletedTest || activeDrill);

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
              {isWorkspaceView ? (
                <Button onClick={handleExit} variant="secondary">
                  Back to Dashboard
                </Button>
              ) : (
                <nav className="flex items-center p-0.5 bg-slate-200/80 rounded-lg space-x-1">
                    <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 text-sm font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition-colors ${currentView === 'dashboard' ? 'bg-white text-orange-600 shadow' : 'bg-transparent text-slate-600 hover:bg-white/50'}`}>
                        Dashboard
                    </button>
                     <button onClick={() => setCurrentView('learn')} className={`px-3 py-1 text-sm font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition-colors ${currentView === 'learn' ? 'bg-white text-orange-600 shadow' : 'bg-transparent text-slate-600 hover:bg-white/50'}`}>
                        Learn
                    </button>
                    <button onClick={() => setCurrentView('progress')} className={`px-3 py-1 text-sm font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition-colors ${currentView === 'progress' ? 'bg-white text-orange-600 shadow' : 'bg-transparent text-slate-600 hover:bg-white/50'}`}>
                        My Progress
                    </button>
                </nav>
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
    </div>
  );
};

export default App;