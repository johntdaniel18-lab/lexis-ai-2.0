import React, { useState, useEffect, useRef } from 'react';
import { IeltsTest, ChatMessage, VocabularyItem } from '../types';
import Spinner from './common/Spinner';
import Button from './common/Button';
import RobotIcon from './icons/RobotIcon';
import UserIcon from './icons/UserIcon';
import MarkdownRenderer from './common/MarkdownRenderer';
import VocabularyCard from './VocabularyCard';

interface PreparationPhaseProps {
  test: IeltsTest;
  targetScore: number;
  onComplete: () => void;
  mode: 'interactive' | 'review';
  language: 'en' | 'vi';
  tasksToPractice: ('task1' | 'task2')[];
  messagesTask1: ChatMessage[];
  messagesTask2: ChatMessage[];
  vocabularyTask1: VocabularyItem[];
  vocabularyTask2: VocabularyItem[];
  suggestionsTask1: string[];
  suggestionsTask2: string[];
  isLoading: boolean;
  error: string | null;
  onInitializeTask: (taskNumber: 1 | 2) => void;
  onSendMessage: (message: string, taskNumber: 1 | 2) => void;
  outlines?: { task1Outline?: string; task2Outline?: string } | null;
  activeWritingTask?: 'task1' | 'task2';
}

type ActiveTab = 'task1' | 'task2' | 'vocabulary' | 'outlines';

const PreparationPhase: React.FC<PreparationPhaseProps> = ({ 
  test, 
  onComplete, 
  mode,
  language,
  tasksToPractice,
  messagesTask1,
  messagesTask2,
  vocabularyTask1,
  vocabularyTask2,
  suggestionsTask1,
  suggestionsTask2,
  isLoading,
  error,
  onInitializeTask,
  onSendMessage,
  outlines,
  activeWritingTask,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(tasksToPractice[0]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [unseenVocabCount, setUnseenVocabCount] = useState(0);
  const vocabCountRef = useRef(vocabularyTask1.length + vocabularyTask2.length);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [lastViewedTaskTab, setLastViewedTaskTab] = useState<'task1' | 'task2'>(tasksToPractice[0]);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  
  const isInteractive = mode === 'interactive';
  const currentTaskContext = mode === 'review' ? activeWritingTask : lastViewedTaskTab;

  const translations = {
    en: {
      think: 'Let me think',
    },
    vi: {
      think: 'Để tôi suy nghĩ',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (activeTab === 'task1' || activeTab === 'task2') {
      setLastViewedTaskTab(activeTab);
    }
  }, [activeTab]);
  
  // Effect to sync review tab with writing task
  useEffect(() => {
    if (mode === 'review' && activeWritingTask) {
        // Only switch if the user is looking at a task prep tab.
        // This allows them to stay on Vocab or Outlines if they click it.
        if ((activeTab === 'task1' || activeTab === 'task2') && activeTab !== activeWritingTask) {
            setActiveTab(activeWritingTask);
        }
    }
  }, [activeWritingTask, activeTab, mode]);


  useEffect(() => {
    const newVocabCount = vocabularyTask1.length + vocabularyTask2.length;
    if (isInteractive && newVocabCount > vocabCountRef.current) {
        const difference = newVocabCount - vocabCountRef.current;
        setUnseenVocabCount(prev => prev + difference);
    }
    vocabCountRef.current = newVocabCount;
  }, [vocabularyTask1, vocabularyTask2, isInteractive]);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'task1' || activeTab === 'task2') {
        scrollToBottom();
        const activeMessages = activeTab === 'task1' ? messagesTask1 : messagesTask2;
        // Show buttons only in interactive mode, when not loading, and after an AI message.
        if (isInteractive && !isLoading && activeMessages.length > 0 && activeMessages[activeMessages.length - 1].sender === 'ai') {
            setShowActionButtons(true);
        } else {
            // Hide buttons if loading, if user sent last message, or if in review mode
            setShowActionButtons(false);
        }
    } else {
        // Hide buttons on vocab tab
        setShowActionButtons(false);
    }
  }, [messagesTask1, messagesTask2, activeTab, isLoading, isInteractive]);
  
  // FIX: Removed the problematic initialization useEffect. Logic is now handled by the parent TestScreen.

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'vocabulary') {
        setUnseenVocabCount(0);
    }
    setActiveTab(tab);
    if (tab === 'task2' && isInteractive) {
      onInitializeTask(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    setShowActionButtons(false);
    const taskNumber = activeTab === 'task1' ? 1 : 2;
    onSendMessage(userInput, taskNumber);
    setUserInput('');
  };

  const handleSuggestionClick = (prompt: string) => {
    const taskNumber = activeTab === 'task1' ? 1 : 2;
    onSendMessage(prompt, taskNumber);
    setShowActionButtons(false);
  };

  const handleUserThinking = () => {
      setShowActionButtons(false);
  };

  
  const renderChatInterface = () => {
    const activeMessages = activeTab === 'task1' ? messagesTask1 : messagesTask2;
    const activeSuggestions = activeTab === 'task1' ? suggestionsTask1 : suggestionsTask2;
    const hasMessages = activeMessages.length > 0;

    return (
      <div className={`flex flex-col h-full ${isInteractive ? '' : 'bg-slate-50'}`}>
        <div className="flex-grow p-6 overflow-y-auto bg-slate-50 space-y-4">
          {!hasMessages && mode === 'review' && (
             <div className="flex h-full items-center justify-center">
              <p className="text-center text-slate-400">Preparation for this task was skipped.</p>
            </div>
          )}
          {activeMessages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <RobotIcon />}
              <div className={`max-w-xl p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-orange-500 text-white font-medium' : 'bg-white text-slate-700 border border-slate-200'}`}>
                {msg.sender === 'ai' ? <MarkdownRenderer text={msg.text} /> : <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
              </div>
              {msg.sender === 'user' && <UserIcon />}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              {(activeMessages.length > 0 || activeTab === 'task1' || activeTab === 'task2') && <RobotIcon />}
              <div className={`max-w-md p-3 rounded-lg bg-white border border-slate-200 shadow-sm ${activeMessages.length === 0 ? 'mx-auto' : ''}`}>
                <Spinner />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* DYNAMIC SUGGESTION BAR */}
        {isInteractive && showActionButtons && (
            <div className="p-3 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {activeSuggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex-shrink-0 px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors whitespace-nowrap"
                            title={suggestion}
                        >
                            {suggestion}
                        </button>
                    ))}
                    <button
                        onClick={handleUserThinking}
                        className="flex-shrink-0 px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap"
                    >
                        {t.think}
                    </button>
                </div>
            </div>
        )}

        {error && isInteractive && <p className="p-4 text-sm text-red-700 bg-red-50 border-t border-slate-200">{error}</p>}
        {isInteractive && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white flex items-center gap-4 flex-shrink-0">
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (showActionButtons) {
                    setShowActionButtons(false);
                }
              }}
              placeholder={isLoading ? "AI is thinking..." : "Type your response..."}
              disabled={isLoading}
              className="flex-grow px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-100 text-slate-900"
            />
            <Button type="submit" disabled={isLoading || !userInput.trim()}>Send</Button>
          </form>
        )}
      </div>
    );
  };

  const renderVocabularyInterface = () => {
    const activeVocabulary = currentTaskContext === 'task2' ? vocabularyTask2 : vocabularyTask1;
    const taskNumber = currentTaskContext === 'task2' ? 2 : 1;
    const allVocab = [...vocabularyTask1, ...vocabularyTask2];

    if (allVocab.length === 0) {
      return (
        <div className="flex-grow p-6 overflow-y-auto bg-slate-50 flex items-center justify-center h-full">
          <div className="text-center text-slate-400">
            <p>Vocabulary from your AI tutor will appear here.</p>
            {isInteractive && <p className="text-sm">Continue chatting to get suggestions.</p>}
          </div>
        </div>
      );
    }

    if (mode === 'review' && activeVocabulary.length === 0) {
        return (
            <div className="flex-grow p-6 overflow-y-auto bg-slate-50 flex items-center justify-center h-full">
                <div className="text-center text-slate-400">
                    <p>No vocabulary was generated for Task {taskNumber}.</p>
                </div>
            </div>
        );
    }
    
    return (
      <div className="flex-grow p-6 overflow-y-auto bg-slate-50 space-y-6 h-full">
        {isInteractive ? (
            <>
            {vocabularyTask1.length > 0 && tasksToPractice.includes('task1') && (
            <div>
                <h4 className="text-lg font-semibold text-slate-600 mb-3 border-b border-slate-200 pb-2">Task 1 Vocabulary</h4>
                <div className="space-y-4">
                {vocabularyTask1.map(item => <VocabularyCard key={item.word} item={item} />)}
                </div>
            </div>
            )}
            {vocabularyTask2.length > 0 && tasksToPractice.includes('task2') && (
            <div>
                <h4 className="text-lg font-semibold text-slate-600 mb-3 border-b border-slate-200 pb-2 mt-6">Task 2 Vocabulary</h4>
                <div className="space-y-4">
                {vocabularyTask2.map(item => <VocabularyCard key={item.word} item={item} />)}
                </div>
            </div>
            )}
           </>
        ) : (
            <div className="space-y-4">
                {activeVocabulary.map(item => <VocabularyCard key={item.word} item={item} />)}
            </div>
        )}

      </div>
    );
  };
  
  const renderOutlinesInterface = () => {
    const activeOutline = activeWritingTask === 'task2' ? outlines?.task2Outline : outlines?.task1Outline;
    const taskNumber = activeWritingTask === 'task2' ? 2 : 1;

    return (
      <div className="flex-grow overflow-y-auto p-6 bg-slate-50/50 space-y-6 h-full">
        {outlines ? (
          <div>
            <h4 className="font-bold text-slate-700 text-lg mb-2">Outline for Task {taskNumber}</h4>
            <div className="p-4 bg-white rounded-md border border-slate-200">
              {activeOutline
                ? <MarkdownRenderer text={activeOutline} />
                : <p className="text-sm text-slate-500 italic">Preparation for this task was skipped.</p>
              }
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            <Spinner />
            <p className="mt-2 text-sm">Loading outlines...</p>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full">
       {/* Image Modal */}
      {imageModalUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImageModalUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size image view"
        >
          <img
            src={imageModalUrl}
            alt="Task diagram full size"
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} 
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors text-5xl font-light"
            onClick={() => setImageModalUrl(null)}
            aria-label="Close image view"
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Main Content Area: Two-panel layout */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 flex flex-col h-full">
        
        {/* Left Panel (Task Details) */}
        {mode === 'interactive' && (
          <div className="w-7/12 bg-white rounded-lg shadow-md border border-slate-200 p-6 overflow-y-auto">
            <div className="space-y-6">
               {(activeTab === 'task1' || (activeTab === 'vocabulary' && lastViewedTaskTab === 'task1')) && tasksToPractice.includes('task1') && (
                 <div>
                  <h5 className="font-extrabold text-slate-800 mb-2 text-lg">Task 1</h5>
                  {test.tasks[0].imageUrl && (
                    <div 
                      className="mb-3 p-1 border rounded-md bg-slate-100 group cursor-zoom-in"
                      onClick={() => setImageModalUrl(test.tasks[0].imageUrl)}
                    >
                      <img 
                        src={test.tasks[0].imageUrl} 
                        alt="Task 1 Diagram - Click to enlarge" 
                        className="max-w-full rounded transition-transform duration-200 group-hover:scale-[1.01]" 
                      />
                    </div>
                  )}
                  <p className="text-base text-slate-600 leading-relaxed">{test.tasks[0].prompt}</p>
                </div>
              )}
              {(activeTab === 'task2' || (activeTab === 'vocabulary' && lastViewedTaskTab === 'task2')) && tasksToPractice.includes('task2') && (
                <div>
                  <h5 className="font-extrabold text-slate-800 mb-2 text-lg">Task 2</h5>
                  <p className="text-base text-slate-600 leading-relaxed">{test.tasks[1].prompt}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Panel (Chat/Vocab/Outlines) */}
        <div className={`flex flex-col min-w-0 w-full h-full`}>
          {/* Sticky Tab Bar */}
          <div className="sticky top-0 z-10 p-2 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex-shrink-0">
            <nav className="flex items-center gap-2">
              {tasksToPractice.includes('task1') && <button 
                onClick={() => handleTabChange('task1')} 
                className={`flex-1 p-3 text-sm font-semibold text-center transition-colors rounded-md ${activeTab === 'task1' ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                Task 1 Prep
              </button>}
              {tasksToPractice.includes('task2') && <button 
                onClick={() => handleTabChange('task2')} 
                className={`flex-1 p-3 text-sm font-semibold text-center transition-colors rounded-md ${activeTab === 'task2' ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                Task 2 Prep
              </button>}
              <button 
                onClick={() => handleTabChange('vocabulary')} 
                className={`relative flex-1 p-3 text-sm font-semibold text-center transition-colors rounded-md ${activeTab === 'vocabulary' ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Vocabulary
                  {isInteractive && unseenVocabCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                      {unseenVocabCount}
                    </span>
                  )}
              </button>
               {mode === 'review' && (
                 <button 
                    onClick={() => handleTabChange('outlines')} 
                    className={`relative flex-1 p-3 text-sm font-semibold text-center transition-colors rounded-md ${activeTab === 'outlines' ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Outlines
                  </button>
               )}
            </nav>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'task1' && renderChatInterface()}
          {activeTab === 'task2' && renderChatInterface()}
          {activeTab === 'vocabulary' && renderVocabularyInterface()}
          {activeTab === 'outlines' && mode === 'review' && renderOutlinesInterface()}

        </div>
      </div>
    </div>
  );
};

export default PreparationPhase;