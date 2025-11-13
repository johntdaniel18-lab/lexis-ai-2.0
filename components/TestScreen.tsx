import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IeltsTest, TestPhase, CompletedTest, VocabularyItem, ChatMessage, TestMode } from '../types';
import TargetScoreSelectionPhase from './TargetScoreSelectionPhase';
import PreparationPhase from './PreparationPhase';
import WritingPhase from './WritingPhase';
import OutlineReviewPhase from './OutlineReviewPhase';
import TimeSelectionPhase from './TimeSelectionPhase';
import Spinner from './common/Spinner';
import { getEssayFeedback, startPreparationChat, continuePreparationChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface TestScreenProps {
  test: IeltsTest;
  testMode: TestMode;
  onExit: () => void;
  onCompleteTest: (result: Omit<CompletedTest, 'id' | 'completionDate'>) => void;
  completedTestForRewrite?: CompletedTest | null;
}

const TestScreen: React.FC<TestScreenProps> = ({ test, testMode, onExit, onCompleteTest, completedTestForRewrite }) => {
  const isMockTest = testMode === 'MOCK_TEST';
  
  const [phase, setPhase] = useState<TestPhase>(() => {
    if (completedTestForRewrite) {
      return isMockTest ? TestPhase.TIME_SELECTION : TestPhase.OUTLINE_REVIEW;
    }
    return isMockTest ? TestPhase.TIME_SELECTION : TestPhase.TARGET_SCORE_SELECTION;
  });

  const [targetScore, setTargetScore] = useState<number | null>(() => 
    completedTestForRewrite ? completedTestForRewrite.targetScore : (isMockTest ? 7.0 : null)
  );
  
  const [language, setLanguage] = useState<'en' | 'vi'>(() =>
    completedTestForRewrite ? (['en', 'vi'].includes('en') ? 'en' : 'en') : 'en'
  );
  const [writingDuration, setWritingDuration] = useState<number | null>(null);

  const [messagesTask1, setMessagesTask1] = useState<ChatMessage[]>(() =>
    completedTestForRewrite && !isMockTest ? completedTestForRewrite.chatHistoryTask1 : []
  );
  const [messagesTask2, setMessagesTask2] = useState<ChatMessage[]>(() =>
    completedTestForRewrite && !isMockTest ? completedTestForRewrite.chatHistoryTask2 : []
  );
  const [sessionTask1, setSessionTask1] = useState<Chat | null>(null);
  const [sessionTask2, setSessionTask2] = useState<Chat | null>(null);
  
  const [vocabularyTask1, setVocabularyTask1] = useState<VocabularyItem[]>([]);
  const [vocabularyTask2, setVocabularyTask2] = useState<VocabularyItem[]>([]);
  
  useEffect(() => {
    if (completedTestForRewrite && !isMockTest && completedTestForRewrite.vocabulary) {
        // Simple heuristic to split vocabulary for rewrites. Not perfect.
        const vocab = completedTestForRewrite.vocabulary;
        const t1Vocab = vocab.filter(v => test.tasks[0].prompt.toLowerCase().includes(v.word.toLowerCase()));
        const t2Vocab = vocab.filter(v => test.tasks[1].prompt.toLowerCase().includes(v.word.toLowerCase()));
        setVocabularyTask1(t1Vocab);
        setVocabularyTask2(t2Vocab);
    }
  }, [completedTestForRewrite, isMockTest, test.tasks]);


  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);
  const isTaskInitialized = useRef<{[key: number]: boolean}>({});
  
  const [outlines, setOutlines] = useState<{ task1Outline?: string; task2Outline?: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeWritingTask, setActiveWritingTask] = useState<'task1' | 'task2'>(testMode === 'TASK_2' ? 'task2' : 'task1');

  const handleGoalsSet = useCallback((goals: { score: number, language: 'en' | 'vi' }) => {
    setTargetScore(goals.score);
    setLanguage(goals.language);
    setPhase(TestPhase.PREPARATION);
  }, []);

  const handlePreparationComplete = useCallback(() => {
    setPhase(TestPhase.OUTLINE_REVIEW);
  }, []);
  
  const handleOutlinesGenerated = useCallback((generatedOutlines: { task1Outline?: string; task2Outline?: string }) => {
    setOutlines(generatedOutlines);
  }, []);

  const handleProceedToTimeSelection = useCallback(() => {
    setPhase(TestPhase.TIME_SELECTION);
  }, []);
  
  const handleTimeSelected = useCallback((durationInSeconds: number) => {
    setWritingDuration(durationInSeconds);
    setPhase(TestPhase.WRITING);
  }, []);
  
  const handleError = (err: any, errorSetter: React.Dispatch<React.SetStateAction<string | null>>) => {
      console.error("API Error:", err);
      const errorMessage = (err.toString() as string).toLowerCase();
      if (errorMessage.includes("api key not valid") || errorMessage.includes("permission denied") || (err.message && err.message.includes('403'))) {
          errorSetter("Your Gemini API Key is invalid or has insufficient permissions. Please log out and enter a valid key.");
      } else if (errorMessage.includes("api key not found")) {
          errorSetter("API Key is missing. Please log out and re-enter your key to continue.");
      } else if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
          errorSetter("The AI is currently busy. Please try again in a few moments.");
      } else {
          errorSetter("An unexpected error occurred while communicating with the AI. Please try again.");
      }
  };

  const handleSubmission = useCallback(async (essay1: string, essay2: string) => {
    if (targetScore === null) {
      setError("Target score not set. Please restart the test.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    const combinedVocabulary = [...vocabularyTask1, ...vocabularyTask2].reduce((acc, current) => {
        if (!acc.find(item => item.word.toLowerCase() === current.word.toLowerCase())) {
            acc.push(current);
        }
        return acc;
    }, [] as VocabularyItem[]);

    try {
      const result = await getEssayFeedback(test, essay1, essay2, targetScore, language);
      
      const testResultPayload: Omit<CompletedTest, 'id' | 'completionDate'> = {
        testId: test.id,
        testTitle: completedTestForRewrite ? `${test.title} (Rewrite)` : test.title,
        targetScore,
        essay1,
        essay2,
        feedback: result,
        vocabulary: combinedVocabulary,
        chatHistoryTask1: messagesTask1,
        chatHistoryTask2: messagesTask2,
        testMode: testMode,
      };

      onCompleteTest(testResultPayload);
    } catch (err: any) {
      handleError(err, setError);
      setIsLoading(false); // Only stop loading on error, as success unmounts the component
    }
  }, [test, targetScore, vocabularyTask1, vocabularyTask2, onCompleteTest, language, completedTestForRewrite, messagesTask1, messagesTask2, testMode]);
  
  const handleInitializeTask = useCallback(async (taskNumber: 1 | 2) => {
    if (targetScore === null || isTaskInitialized.current[taskNumber]) return;
    isTaskInitialized.current[taskNumber] = true;
    
    setPrepError(null);
    setIsPrepLoading(true);

    try {
      const { session, firstMessage, vocabulary } = await startPreparationChat(test, taskNumber, targetScore, language);
      if (taskNumber === 1) {
        setSessionTask1(session);
        setMessagesTask1([{ sender: 'ai', text: firstMessage }]);
        if (vocabulary.length > 0) setVocabularyTask1(prev => [...prev, ...vocabulary]);
      } else {
        setSessionTask2(session);
        setMessagesTask2([{ sender: 'ai', text: firstMessage }]);
        if (vocabulary.length > 0) setVocabularyTask2(prev => [...prev, ...vocabulary]);
      }
    } catch (err: any) {
      handleError(err, setPrepError);
    } finally {
      setIsPrepLoading(false);
    }
  }, [test, targetScore, language]);

  const handleSendMessage = useCallback(async (message: string, taskNumber: 1 | 2) => {
    const session = taskNumber === 1 ? sessionTask1 : sessionTask2;
    const currentMessages = taskNumber === 1 ? messagesTask1 : messagesTask2;
    const setMessages = taskNumber === 1 ? setMessagesTask1 : setMessagesTask2;
    const setVocabulary = taskNumber === 1 ? setVocabularyTask1 : setVocabularyTask2;

    if (!session) {
      setPrepError("Chat session is not ready.");
      return;
    }

    const newMessages: ChatMessage[] = [...currentMessages, { sender: 'user', text: message }];
    setMessages(newMessages);
    setIsPrepLoading(true);
    setPrepError(null);

    try {
      const { text: aiResponse, vocabulary } = await continuePreparationChat(session, message);
      setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
      if (vocabulary.length > 0) {
        setVocabulary(prev => {
          const existingWords = new Set(prev.map(item => item.word.toLowerCase()));
          const newItems = vocabulary.filter(item => !existingWords.has(item.word.toLowerCase()));
          return [...prev, ...newItems];
        });
      }
    } catch (err: any) {
      handleError(err, setPrepError);
      setMessages(newMessages); 
    } finally {
      setIsPrepLoading(false);
    }
  }, [sessionTask1, sessionTask2, messagesTask1, messagesTask2]);

  const renderPhase = () => {
    if (isLoading) {
      return (
        <div className="text-center p-12 bg-white rounded-lg shadow-lg border border-slate-200">
          <Spinner />
          <h3 className="mt-4 text-xl font-semibold text-slate-700">Your AI tutor is analyzing your essays...</h3>
          <p className="text-slate-500 mt-2">This may take a moment. Please wait.</p>
        </div>
      );
    }

    if (error) {
       return <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>;
    }

    switch (phase) {
      case TestPhase.TARGET_SCORE_SELECTION:
        return <TargetScoreSelectionPhase onGoalsSet={handleGoalsSet} />;
      
      case TestPhase.PREPARATION:
        if (targetScore === null) return <div className="text-center">Error: Target score not set. Please go back and select a test again.</div>;
        return <PreparationPhase 
            test={test} 
            targetScore={targetScore} 
            onComplete={handlePreparationComplete}
            viewMode="interactive"
            testMode={testMode}
            language={language}
            messagesTask1={messagesTask1}
            messagesTask2={messagesTask2}
            vocabularyTask1={vocabularyTask1}
            vocabularyTask2={vocabularyTask2}
            isLoading={isPrepLoading}
            error={prepError}
            onInitializeTask={handleInitializeTask}
            onSendMessage={handleSendMessage}
        />;
      
      case TestPhase.OUTLINE_REVIEW:
        if (targetScore === null) return <div className="text-center">Error: Target score not set. Please go back and select a test again.</div>;
        return <OutlineReviewPhase 
          test={test}
          chatHistoryTask1={messagesTask1}
          chatHistoryTask2={messagesTask2}
          targetScore={targetScore}
          language={language}
          onStartWriting={handleProceedToTimeSelection}
          onOutlinesGenerated={handleOutlinesGenerated}
          testMode={testMode}
        />;
      
      case TestPhase.TIME_SELECTION:
          // FIX: Pass testMode to TimeSelectionPhase to enable context-specific time recommendations.
          return <TimeSelectionPhase onConfirm={handleTimeSelected} defaultDuration={isMockTest ? 60 : (testMode === 'TASK_1' ? 20 : 40)} testMode={testMode} />;
      
      case TestPhase.WRITING:
        return (
          <div className={`grid grid-cols-1 ${!isMockTest ? 'lg:grid-cols-12' : ''} gap-8 items-start`}>
            <div className={`${!isMockTest ? 'lg:col-span-7 xl:col-span-7' : 'col-span-1'} h-auto lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto rounded-lg`}>
              <WritingPhase 
                test={test} 
                onSubmit={handleSubmission} 
                durationInSeconds={writingDuration ?? (isMockTest ? 3600 : (testMode === 'TASK_1' ? 1200 : 2400))}
                activeTask={activeWritingTask}
                onTaskChange={setActiveWritingTask}
                testMode={testMode}
              />
            </div>
            {!isMockTest && (
              <aside className="lg:col-span-5 xl:col-span-5">
                <PreparationPhase
                    test={test}
                    targetScore={targetScore!}
                    onComplete={() => {}} 
                    viewMode="review"
                    testMode={testMode}
                    language={language}
                    messagesTask1={messagesTask1}
                    messagesTask2={messagesTask2}
                    vocabularyTask1={vocabularyTask1}
                    vocabularyTask2={vocabularyTask2}
                    isLoading={false} 
                    error={null} 
                    onInitializeTask={() => {}} 
                    onSendMessage={() => {}} 
                    outlines={outlines}
                    activeWritingTask={activeWritingTask}
                />
              </aside>
            )}
          </div>
        )
      default:
        return <div>Invalid phase.</div>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">{test.title}</h2>
      </div>
      {renderPhase()}
    </div>
  );
};

export default TestScreen;