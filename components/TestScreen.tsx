import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IeltsTest, TestPhase, CompletedTest, VocabularyItem, ChatMessage, PracticeMode, EssayFeedback } from '../types';
import TargetScoreSelectionPhase from './TargetScoreSelectionPhase';
import PreparationPhase from './PreparationPhase';
import WritingPhase from './WritingPhase';
import FeedbackPhase from './FeedbackPhase';
import OutlineReviewPhase from './OutlineReviewPhase';
import TimeSelectionPhase from './TimeSelectionPhase';
import Spinner from './common/Spinner';
import { getEssayFeedback, startPreparationChat, continuePreparationChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import Button from './common/Button';

interface TestScreenProps {
  test: IeltsTest;
  practiceMode: PracticeMode;
  onExit: () => void;
  onSaveTestResult: (result: Omit<CompletedTest, 'id' | 'completionDate'>) => void;
  completedTestForRewrite?: CompletedTest | null;
}

const TestScreen: React.FC<TestScreenProps> = ({ test, practiceMode, onExit, onSaveTestResult, completedTestForRewrite }) => {
  const [phase, setPhase] = useState<TestPhase>(TestPhase.TARGET_SCORE_SELECTION);
  
  const [targetScore, setTargetScore] = useState<number | null>(() => 
    completedTestForRewrite ? completedTestForRewrite.targetScore : null
  );
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [writingDuration, setWritingDuration] = useState<number | null>(null);

  const [messagesTask1, setMessagesTask1] = useState<ChatMessage[]>(() =>
    completedTestForRewrite ? completedTestForRewrite.chatHistoryTask1 : []
  );
  const [messagesTask2, setMessagesTask2] = useState<ChatMessage[]>(() =>
    completedTestForRewrite ? completedTestForRewrite.chatHistoryTask2 : []
  );
  const [sessionTask1, setSessionTask1] = useState<Chat | null>(null);
  const [sessionTask2, setSessionTask2] = useState<Chat | null>(null);
  
  const [vocabularyTask1, setVocabularyTask1] = useState<VocabularyItem[]>(() =>
    completedTestForRewrite ? completedTestForRewrite.vocabulary : []
  );
  const [vocabularyTask2, setVocabularyTask2] = useState<VocabularyItem[]>([]);
  
  const [suggestionsTask1, setSuggestionsTask1] = useState<string[]>([]);
  const [suggestionsTask2, setSuggestionsTask2] = useState<string[]>([]);

  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);
  const isTask2Initialized = useRef(false);
  
  const [outlines, setOutlines] = useState<{ task1Outline?: string; task2Outline?: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [submittedEssay1, setSubmittedEssay1] = useState<string>('');
  const [submittedEssay2, setSubmittedEssay2] = useState<string>('');
  
  const [activeWritingTask, setActiveWritingTask] = useState<'task1' | 'task2'>(practiceMode === 'task2' ? 'task2' : 'task1');

  const handleGoalsSet = useCallback((goals: { score: number, language: 'en' | 'vi' }) => {
    setTargetScore(goals.score);
    setLanguage(goals.language);
    if (practiceMode === 'mock') {
      setPhase(TestPhase.TIME_SELECTION);
    } else {
      setPhase(TestPhase.PREPARATION);
    }
  }, [practiceMode]);

  const handlePreparationComplete = useCallback(() => {
    setPhase(TestPhase.OUTLINE_REVIEW);
  }, []);
  
  const handleOutlinesGenerated = useCallback((generatedOutlines: { task1Outline?: string; task2Outline?: string }) => {
    setOutlines(generatedOutlines);
  }, []);

  const handleProceedToWriting = useCallback(() => {
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
          errorSetter("The AI is currently busy and could not provide feedback (API Rate Limit Reached). Don't worry, your essays have been saved. Please wait a moment and try submitting again.");
      } else {
          errorSetter("An unexpected error occurred while communicating with the AI. Your essays have been saved locally. Please try again.");
      }
  };

  const handleSubmission = useCallback(async (essay1: string, essay2: string) => {
    if (targetScore === null) {
      setError("Target score not set. Please restart the test.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSubmittedEssay1(essay1);
    setSubmittedEssay2(essay2);
    
    const combinedVocabulary = [...vocabularyTask1, ...vocabularyTask2].reduce((acc, current) => {
        if (!acc.find(item => item.word.toLowerCase() === current.word.toLowerCase())) {
            acc.push(current);
        }
        return acc;
    }, [] as VocabularyItem[]);

    try {
      const result = await getEssayFeedback(test, essay1, essay2, targetScore, language);
      setFeedback(result);
      
      const testResultPayload = {
        testId: test.id,
        testTitle: completedTestForRewrite ? `${test.title} (Rewrite)` : test.title,
        targetScore,
        essay1,
        essay2,
        feedback: result,
        vocabulary: combinedVocabulary,
        chatHistoryTask1: messagesTask1,
        chatHistoryTask2: messagesTask2,
      };

      onSaveTestResult(testResultPayload);
      setPhase(TestPhase.FEEDBACK);

      // SUCCESS-ONLY DELETION: Only remove the autosave after a successful submission.
      const autoSaveKey = `lexis-ai-autosave-test-${test.id}-${practiceMode}`;
      localStorage.removeItem(autoSaveKey);

    } catch (err: any) {
      handleError(err, setError);
      setIsLoading(false);
    }
  }, [test, targetScore, vocabularyTask1, vocabularyTask2, onSaveTestResult, language, completedTestForRewrite, messagesTask1, messagesTask2, practiceMode]);
  
  const handleInitializeTask = useCallback(async (taskNumber: 1 | 2) => {
    if (targetScore === null) return;
    
    if (taskNumber === 2 && isTask2Initialized.current) return;
    if (taskNumber === 1 && messagesTask1.length > 0) return; 
    if (taskNumber === 2) isTask2Initialized.current = true;
    
    setPrepError(null);
    setIsPrepLoading(true);

    try {
      const { session, firstMessage, vocabulary, suggestions } = await startPreparationChat(test, taskNumber, targetScore, language);
      if (taskNumber === 1) {
        setSessionTask1(session);
        setMessagesTask1([{ sender: 'ai', text: firstMessage }]);
        if (vocabulary.length > 0) setVocabularyTask1(prev => [...prev, ...vocabulary]);
        setSuggestionsTask1(suggestions || []);
      } else {
        setSessionTask2(session);
        setMessagesTask2([{ sender: 'ai', text: firstMessage }]);
        if (vocabulary.length > 0) setVocabularyTask2(prev => [...prev, ...vocabulary]);
        setSuggestionsTask2(suggestions || []);
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
    const setSuggestions = taskNumber === 1 ? setSuggestionsTask1 : setSuggestionsTask2;

    if (!session) {
      setPrepError("Chat session is not ready.");
      return;
    }

    const newMessages: ChatMessage[] = [...currentMessages, { sender: 'user', text: message }];
    setMessages(newMessages);

    // --- START: Intelligent Chat Termination ---
    const lastAiMessage = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;
    const isFinalPrepStep = lastAiMessage && lastAiMessage.sender === 'ai' && (lastAiMessage.text.toLowerCase().includes('ready to write') || lastAiMessage.text.includes('Proceed to Writing'));

    const affirmativeResponses = ['ok', 'okay', 'yes', 'sure', 'got it', 'i am ready', "i'm ready", 'thanks', 'thank you', 'da', 'roi', 'roi a', 'da roi', 'vâng', 'được', 'hiểu rồi'];
    const isAffirmative = affirmativeResponses.includes(message.trim().toLowerCase());

    if (isFinalPrepStep && isAffirmative) {
        const confirmationText = language === 'vi' 
            ? "Tuyệt vời! Bất cứ khi nào bạn sẵn sàng, hãy nhấp vào nút 'Proceed to Writing' để chuyển sang bước tiếp theo."
            : "Great! Whenever you're ready, click the 'Proceed to Writing' button to move to the next step.";
        
        setTimeout(() => {
            setMessages([...newMessages, { sender: 'ai', text: confirmationText }]);
            setSuggestions([]); // Clear suggestions as the next step is to proceed
        }, 300); // Small delay to simulate AI "thinking"
        
        return; // Bypass the API call
    }
    // --- END: Intelligent Chat Termination ---

    setIsPrepLoading(true);
    setPrepError(null);

    try {
      const { text: aiResponse, vocabulary, suggestions } = await continuePreparationChat(session, message);
      setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
      if (vocabulary.length > 0) {
        setVocabulary(prev => {
          const existingWords = new Set(prev.map(item => item.word.toLowerCase()));
          const newItems = vocabulary.filter(item => !existingWords.has(item.word.toLowerCase()));
          return [...prev, ...newItems];
        });
      }
      if (suggestions && suggestions.length > 0) {
        setSuggestions(suggestions);
      }
    } catch (err: any) {
      handleError(err, setPrepError);
      setMessages(newMessages); 
    } finally {
      setIsPrepLoading(false);
    }
  }, [sessionTask1, sessionTask2, messagesTask1, messagesTask2, language]);

  // FIX: Centralize initialization logic here. This effect triggers the AI chat
  // only when the component enters the PREPARATION phase, ensuring all state
  // (like 'language') is consistent.
  useEffect(() => {
    if (phase === TestPhase.PREPARATION) {
      const tasksToPractice = practiceMode === 'task1' ? ['task1'] : practiceMode === 'task2' ? ['task2'] : ['task1', 'task2'];
      const taskNumToInit = tasksToPractice[0] === 'task1' ? 1 : 2;
      const messages = taskNumToInit === 1 ? messagesTask1 : messagesTask2;

      // Only initialize if the chat is empty. This prevents re-initialization on re-renders.
      if (messages.length === 0) {
        handleInitializeTask(taskNumToInit);
      }
    }
  }, [phase, practiceMode, messagesTask1, messagesTask2, handleInitializeTask]);


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

    const tasksToPractice = practiceMode === 'task1' ? ['task1'] : practiceMode === 'task2' ? ['task2'] : ['task1', 'task2'];

    switch (phase) {
      case TestPhase.TARGET_SCORE_SELECTION:
        return <TargetScoreSelectionPhase onGoalsSet={handleGoalsSet} practiceMode={practiceMode} />;
      case TestPhase.PREPARATION:
        if (targetScore === null) return <div className="text-center">Error: Target score not set. Please go back and select a test again.</div>;
        return <PreparationPhase 
            test={test} 
            targetScore={targetScore} 
            onComplete={handlePreparationComplete}
            mode="interactive"
            language={language}
            tasksToPractice={tasksToPractice as any}
            messagesTask1={messagesTask1}
            messagesTask2={messagesTask2}
            vocabularyTask1={vocabularyTask1}
            vocabularyTask2={vocabularyTask2}
            suggestionsTask1={suggestionsTask1}
            suggestionsTask2={suggestionsTask2}
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
          onProceedToWriting={handleProceedToWriting}
          onOutlinesGenerated={handleOutlinesGenerated}
        />;
      case TestPhase.TIME_SELECTION:
        return <TimeSelectionPhase onConfirm={handleTimeSelected} practiceMode={practiceMode} />;
      case TestPhase.WRITING:
        const getDefaultDuration = () => {
            switch(practiceMode) {
                case 'task1': return 1200; // 20 mins
                case 'task2': return 2400; // 40 mins
                case 'mock':
                default:      return 3600; // 60 mins
            }
        };
        const duration = writingDuration ?? getDefaultDuration();
        const isGuidedPractice = practiceMode !== 'mock';
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className={`${isGuidedPractice ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-12'} h-auto lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto rounded-lg`}>
              <WritingPhase 
                test={test} 
                onSubmit={handleSubmission} 
                durationInSeconds={duration}
                practiceMode={practiceMode}
                activeTask={activeWritingTask}
                onTaskChange={setActiveWritingTask}
              />
            </div>
            {isGuidedPractice && (
              <aside className="lg:col-span-5 xl:col-span-5">
                <PreparationPhase
                    test={test}
                    targetScore={targetScore!}
                    onComplete={() => {}} 
                    mode="review"
                    language={language}
                    tasksToPractice={tasksToPractice as any}
                    messagesTask1={messagesTask1}
                    messagesTask2={messagesTask2}
                    vocabularyTask1={vocabularyTask1}
                    vocabularyTask2={vocabularyTask2}
                    suggestionsTask1={suggestionsTask1}
                    suggestionsTask2={suggestionsTask2}
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
        );
      case TestPhase.FEEDBACK:
        return feedback ? (
          <FeedbackPhase 
            feedback={feedback} 
            essay1={submittedEssay1} 
            essay2={submittedEssay2} 
            originalTestPrompt1={test.tasks[0].prompt}
            originalTestPrompt2={test.tasks[1].prompt}
            onGenerateModelAnswer={() => {}} // Placeholder as TestScreen manages feedback now
            modelAnswers={{ task1: null, task2: null }}
            isModelAnswerLoading={false}
          />
        ) : <div className="text-center">Generating your feedback...</div>;
      default:
        return <div>Invalid phase.</div>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-slate-900">{test.title}</h2>
         <div className="flex items-center gap-4">
            {phase === TestPhase.PREPARATION && (
                <Button onClick={handlePreparationComplete} variant="primary">
                    Proceed to Writing
                </Button>
            )}
            <Button onClick={onExit} variant="secondary">Exit Test</Button>
        </div>
      </div>
      <div className={phase === TestPhase.PREPARATION ? "h-[calc(100vh-13rem)]" : ""}>
        {renderPhase()}
      </div>
    </div>
  );
};

export default TestScreen;