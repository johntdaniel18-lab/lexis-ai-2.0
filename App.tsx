import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import TestScreen from './components/TestScreen';
import AdminDashboardScreen from './components/admin/AdminDashboardScreen';
import FeedbackViewer from './components/FeedbackViewer';
import { IeltsTest, CompletedTest, DrillCriterion, PracticeMode } from './types';
import Button from './components/common/Button';
import Logo from './components/icons/Logo';
import { validateApiKey } from './services/geminiService';
import DrillScreen from './components/DrillScreen';
import ProgressHubScreen from './components/ProgressHubScreen';
import LearnScreen from './components/LearnScreen';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import Spinner from './components/common/Spinner';
import ConfirmationModal from './components/common/ConfirmationModal';

// Firebase imports
import { auth } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  fetchTests, 
  fetchUserHistory, 
  saveTestResult, 
  saveNewTest, 
  updateExistingTest,
  logoutUser,
  deleteTestResult
} from './services/firebase';

const API_KEY_STORAGE_KEY = 'lexis-ai-api-key';
const API_KEY_VALIDATED_KEY = 'lexis-ai-api-key-validated';

type StudentView = 'dashboard' | 'progress' | 'learn';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [appLoading, setAppLoading] = useState(true);

  // Data State
  const [tests, setTests] = useState<IeltsTest[]>([]);
  const [completedTests, setCompletedTests] = useState<CompletedTest[]>([]);

  // Navigation State
  const [selectedTest, setSelectedTest] = useState<IeltsTest | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null);
  const [viewingCompletedTest, setViewingCompletedTest] = useState<CompletedTest | null>(null);
  const [completedTestForRewrite, setCompletedTestForRewrite] = useState<CompletedTest | null>(null);
  const [activeDrill, setActiveDrill] = useState<{criterion: DrillCriterion; topic: string} | null>(null);

  // Deletion State
  const [testToDelete, setTestToDelete] = useState<CompletedTest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAppLoading(true);
      if (user) {
        setCurrentUser(user);
        
        // Parallel data fetching
        try {
          const [loadedTests, loadedHistory] = await Promise.all([
            fetchTests(),
            fetchUserHistory(user.uid)
          ]);
          setTests(loadedTests);
          setCompletedTests(loadedHistory);
          
          // If we haven't explicitly set a role yet (e.g. fresh reload), default to student
          // The LoginScreen handles the explicit 'admin' flow.
          if (!userRole) setUserRole('student'); 
        } catch (error) {
          console.error("Error loading data:", error);
        }
      } else {
        setCurrentUser(null);
        setCompletedTests([]);
        
        // FIX: Only clear userRole if it was 'student'. 
        // If 'admin', we preserve the session since admins don't use Firebase Auth.
        // If null, it stays null.
        if (userRole === 'student') {
            setUserRole(null);
        }
      }
      setAppLoading(false);
    });

    return () => unsubscribe();
  }, [userRole]);

  // Scroll handler
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
    // Note: The actual Firebase login happens inside LoginScreen. 
    // This callback sets the *app state* role and API key.
    if (role === 'student') {
        if (!apiKey) {
            throw new Error("API Key is required to log in as a student.");
        }
        
        // STRATEGY 1: Smart Caching - Skip validation if key is unchanged and already validated this session.
        const isAlreadyValidated = sessionStorage.getItem(API_KEY_VALIDATED_KEY) === 'true';
        const storedApiKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);

        if (!isAlreadyValidated || storedApiKey !== apiKey) {
          await validateApiKey(apiKey);
          sessionStorage.setItem(API_KEY_VALIDATED_KEY, 'true');
        }

        sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }
    
    setUserRole(role);

    // FIX: If admin, manually fetch tests since onAuthStateChanged won't trigger (no user)
    if (role === 'admin') {
        setAppLoading(true);
        try {
            const loadedTests = await fetchTests();
            setTests(loadedTests);
        } catch (e) {
            console.error("Failed to load tests for admin", e);
        } finally {
            setAppLoading(false);
        }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutUser(); // Firebase logout
    setUserRole(null);
    setCurrentUser(null);
    setSelectedTest(null);
    setPracticeMode(null);
    setViewingCompletedTest(null);
    setCompletedTestForRewrite(null);
    setActiveDrill(null);
    setCurrentView('dashboard');
    setTestToDelete(null); // Clear any pending deletions
    sessionStorage.removeItem(API_KEY_STORAGE_KEY);
    sessionStorage.removeItem(API_KEY_VALIDATED_KEY);
  }, []);

  const handleSelectTest = useCallback((test: IeltsTest) => {
    setSelectedTest(test);
    setPracticeMode(null); 
    setCompletedTestForRewrite(null); 
  }, []);

  const handleModeSelected = useCallback((mode: PracticeMode) => {
    setPracticeMode(mode);
  }, []);
  
  const handleViewCompletedTest = useCallback((completedTest: CompletedTest) => {
    setViewingCompletedTest(completedTest);
    setCompletedTestForRewrite(null); 
  }, []);

  const handleExit = useCallback(() => {
    setSelectedTest(null);
    setPracticeMode(null);
    setViewingCompletedTest(null);
    setCompletedTestForRewrite(null); 
    setActiveDrill(null);
    setCurrentView('dashboard'); 
  }, []);

  const handleCompleteTest = useCallback(async (result: Omit<CompletedTest, 'id' | 'completionDate'>) => {
    if (!currentUser) return;

    const newCompletedTest: CompletedTest = {
      ...result,
      id: `completed-${Date.now()}`,
      completionDate: new Date().toISOString(),
    };

    // Optimistic Update
    setCompletedTests(prev => [...prev, newCompletedTest]);
    setSelectedTest(null);
    setPracticeMode(null);
    setViewingCompletedTest(newCompletedTest);

    // Save to Cloud
    try {
      await saveTestResult(currentUser.uid, newCompletedTest);
    } catch (e) {
      console.error("Failed to save result to cloud", e);
      // In a real app, show a toast here.
    }
  }, [currentUser]);

  const handleRewriteTest = useCallback((testToRewrite: CompletedTest) => {
    const originalTest = tests.find(t => t.id === testToRewrite.testId);
    if (originalTest) {
      setCompletedTestForRewrite(testToRewrite);
      setSelectedTest(originalTest);
      setPracticeMode('mock');
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
    if (tests.length === 0) return;
    const randomTest = tests[Math.floor(Math.random() * tests.length)];
    // 2. Pick a random, valid topic
    const validTopics = randomTest.tags?.filter(tag => 
        !['graph', 'chart', 'diagram', 'table'].some(chartType => tag.toLowerCase().includes(chartType))
    ) || [];
    const topic = validTopics[Math.floor(Math.random() * validTopics.length)] || 'general topics'; 
    // 3. Set the active drill
    setActiveDrill({ criterion, topic });
  }, [tests]);

  const handleAddNewTest = useCallback(async (newTest: Omit<IeltsTest, 'id'>) => {
    const nextId = tests.length > 0 ? Math.max(...tests.map(t => t.id)) + 1 : 1;
    const testWithId = { ...newTest, id: nextId };
    
    // Optimistic Update
    setTests(prevTests => [...prevTests, testWithId]);
    
    // Cloud Save
    try {
      await saveNewTest(testWithId);
    } catch (e) {
      console.error("Failed to save new test", e);
    }
  }, [tests]);

  const handleUpdateTest = useCallback(async (updatedTest: IeltsTest) => {
    setTests(prevTests => prevTests.map(test => 
      test.id === updatedTest.id ? updatedTest : test
    ));
    // Cloud Update
    try {
      await updateExistingTest(updatedTest);
    } catch (e) {
      console.error("Failed to update test", e);
    }
  }, []);

  // --- Deletion Handlers ---
  const handleInitiateDeleteTest = useCallback((test: CompletedTest) => {
    setTestToDelete(test);
  }, []);

  const handleCancelDelete = useCallback(() => {
      setTestToDelete(null);
  }, []);

  const handleConfirmDeleteTest = useCallback(async () => {
      if (!currentUser || !testToDelete) return;

      setIsDeleting(true);
      try {
          // Backend-first deletion for safety
          await deleteTestResult(currentUser.uid, testToDelete.id);
          // Local update on success
          setCompletedTests(prev => prev.filter(t => t.id !== testToDelete.id));
          setTestToDelete(null);
      } catch (e) {
          console.error("Failed to delete test history", e);
          // TODO: Show an error toast to the user
          setTestToDelete(null); // Close modal even on error for better UX
      } finally {
          setIsDeleting(false);
      }
  }, [currentUser, testToDelete]);


  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-slate-500">Connecting to Lexis Cloud...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // FIX: Allow admin access even if currentUser is null (since admin uses key, not firebase auth)
    if (!userRole) {
      return <LoginScreen onLogin={handleLogin} />;
    }
    
    if (userRole === 'student' && !currentUser) {
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
          onSaveTestResult={handleCompleteTest}
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
            onInitiateDeleteTest={handleInitiateDeleteTest}
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
            <span className="font-extrabold">Lexis<span className="font-extrabold text-orange-500 ml-1">AI</span></span>
          </h1>
          {(currentUser || userRole === 'admin') && (
            <div className="flex items-center gap-4">
              {isWorkspaceView ? (
                <Button onClick={handleExit} variant="secondary">
                  Back to Dashboard
                </Button>
              ) : (
                userRole === 'student' && (
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
                )
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

      {testToDelete && (
        <ConfirmationModal
            isOpen={!!testToDelete}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDeleteTest}
            title="Delete Test History?"
            confirmText="Delete Permanently"
            confirmVariant="danger"
            isConfirming={isDeleting}
        >
            <p>You are about to permanently delete your history for <strong>{testToDelete.testTitle}</strong>. This action cannot be undone. All associated data will be lost.</p>
        </ConfirmationModal>
      )}
    </div>
  );
};

export default App;