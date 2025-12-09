import React, { useState, useCallback, useRef } from 'react';
import { IeltsTest, TestPhase, EssayFeedback, CompletedTest, VocabularyItem, ChatMessage } from '../types';
import TargetScoreSelectionPhase from './TargetScoreSelectionPhase';
import PreparationPhase from './PreparationPhase';
import WritingPhase from './WritingPhase';
import FeedbackPhase from './FeedbackPhase';
import OutlineReviewPhase from './OutlineReviewPhase';
import TimeSelectionPhase from './TimeSelectionPhase';
import Spinner from './common/Spinner';
import { getEssayFeedback, startPreparationChat, continuePreparationChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface TestScreenProps {
  test: IeltsTest;
  onExit: () => void;
  onSaveTestResult: (result: Omit<CompletedTest, 'id' | 'completionDate'>) => void;
}

const TestScreen: React.FC<TestScreenProps> = ({ test, onSaveTestResult }) => {
  const [phase, setPhase] = useState<TestPhase>(TestPhase.TARGET_SCORE_SELECTION);
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [writingDuration, setWritingDuration] = useState<number | null>(null);

  // --- State lifted from PreparationPhase ---
  const [messagesTask1, setMessagesTask1] = useState<ChatMessage[]>([]);
  const [messagesTask2, setMessagesTask2] = useState<ChatMessage[]>([]);
  const [sessionTask1, setSessionTask1] = useState<Chat | null>(null);
  const [sessionTask2, setSessionTask2] = useState<Chat | null>(null);
  const [vocabularyTask1, setVocabularyTask1] = useState<VocabularyItem[]>([]);
  const [vocabularyTask2, setVocabularyTask2] = useState<VocabularyItem[]>([]);
  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);
  const isTask2Initialized = useRef(false);
  // --- End of lifted state ---
  
  // --- State for outlines ---
  const [outlines, setOutlines] = useState<{ task1Outline?: string; task2Outline?: string } | null>(null);


  const [isLoading, setIsLoading] = useState(false);
  // FIX: Add loadingStatus state to display progress messages.
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [submittedEssay1, setSubmittedEssay1] = useState<string>('');
  const [submittedEssay2, setSubmittedEssay2] = useState<string>('');

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
    // FIX: Set initial loading status message.
    setLoadingStatus('Initializing AI analysis...');
    setSubmittedEssay1(essay1);
    setSubmittedEssay2(essay2);
    
    const combinedVocabulary = [...vocabularyTask1, ...vocabularyTask2].reduce((acc, current) => {
        if (!acc.find(item => item.word.toLowerCase() === current.word.toLowerCase())) {
            acc.push(current);
        }
        return acc;
    }, [] as VocabularyItem[]);

    try {
      // FIX: Pass setLoadingStatus as the 6th argument to getEssayFeedback.
      const result = await getEssayFeedback(test, essay1, essay2, targetScore, language, setLoadingStatus);
      setFeedback(result);
      // FIX: Add missing chat history properties to the payload for onSaveTestResult.
      onSaveTestResult({
        testId: test.id,
        testTitle: test.title,
        targetScore,
        essay1,
        essay2,
        feedback: result,
        vocabulary: combinedVocabulary,
        chatHistoryTask1: messagesTask1,
        chatHistoryTask2: messagesTask2,
      });
      setPhase(TestPhase.FEEDBACK); 
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setIsLoading(false);
    }
    // FIX: Add missing dependencies to the useCallback hook.
  }, [test, targetScore, vocabularyTask1, vocabularyTask2, onSaveTestResult, language, messagesTask1, messagesTask2]);
  
    // --- Chat logic moved from PreparationPhase ---
  const handleInitializeTask = useCallback(async (taskNumber: 1 | 2) => {
    if (targetScore === null) return;
    if (taskNumber === 2 && isTask2Initialized.current) return;
    if (taskNumber === 1 && messagesTask1.length > 0) return; // Already initialized
    if (taskNumber === 2) isTask2Initialized.current = true;
    
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
  }, [test, targetScore, messagesTask1.length, language]);

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
      setMessages(newMessages); // Revert to user message only
    } finally {
      setIsPrepLoading(false);
    }
  }, [sessionTask1, sessionTask2, messagesTask1, messagesTask2]);
  // --- End of chat logic ---

  const renderPhase = () => {
    if (isLoading) {
      return (
        <div className="text-center p-12 bg-white rounded-lg shadow-lg border border-slate-200">
          <Spinner />
          {/* FIX: Use loadingStatus state for more informative messages. */}
          <h3 className="mt-4 text-xl font-semibold text-slate-700">{loadingStatus || 'Your AI tutor is analyzing your essays...'}</h3>
          <p className="text-slate-500 mt-2">This is a multi-step process and may take up to 2 minutes. Please do not close this window.</p>
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
            mode="interactive"
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
        />;
      case TestPhase.TIME_SELECTION:
          return <TimeSelectionPhase onConfirm={handleTimeSelected} />;
      case TestPhase.WRITING:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 xl:col-span-7 h-auto lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto rounded-lg">
              <WritingPhase test={test} onSubmit={handleSubmission} durationInSeconds={writingDuration ?? 3600} />
            </div>
            <aside className="lg:col-span-5 xl:col-span-5">
              <PreparationPhase
                  test={test}
                  targetScore={targetScore!}
                  onComplete={() => {}} // No-op in review mode
                  mode="review"
                  language={language}
                  messagesTask1={messagesTask1}
                  messagesTask2={messagesTask2}
                  vocabularyTask1={vocabularyTask1}
                  vocabularyTask2={vocabularyTask2}
                  isLoading={false} // No loading in review mode
                  error={null} // No errors in review mode
                  onInitializeTask={() => {}} // No-op in review mode
                  onSendMessage={() => {}} // No-op in review mode
                  outlines={outlines}
              />
            </aside>
          </div>
        )
      case TestPhase.FEEDBACK:
        // After submission, the feedback report is displayed here.
        return feedback ? (
          <FeedbackPhase 
            feedback={feedback} 
            essay1={submittedEssay1} 
            essay2={submittedEssay2} 
          />
        ) : <div className="text-center">Generating and saving your feedback...</div>;
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
