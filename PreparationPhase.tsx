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
  messagesTask1: ChatMessage[];
  messagesTask2: ChatMessage[];
  vocabularyTask1: VocabularyItem[];
  vocabularyTask2: VocabularyItem[];
  isLoading: boolean;
  error: string | null;
  onInitializeTask: (taskNumber: 1 | 2) => void;
  onSendMessage: (message: string, taskNumber: 1 | 2) => void;
  outlines?: { task1Outline?: string; task2Outline?: string } | null;
}

type ActiveTab = 'task1' | 'task2' | 'vocabulary';

const PreparationPhase: React.FC<PreparationPhaseProps> = ({ 
  test, 
  onComplete, 
  mode,
  language,
  messagesTask1,
  messagesTask2,
  vocabularyTask1,
  vocabularyTask2,
  isLoading,
  error,
  onInitializeTask,
  onSendMessage,
  outlines,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('task1');
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [unseenVocabCount, setUnseenVocabCount] = useState(0);
  const vocabCountRef = useRef(vocabularyTask1.length + vocabularyTask2.length);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [lastViewedTaskTab, setLastViewedTaskTab] = useState<ActiveTab>('task1');
  
  const isInteractive = mode === 'interactive';

  const actionButtonTranslations = {
    en: {
      suggest: 'Give me suggestions',
      think: 'Let me think',
      moreVocab: 'Provide more vocab',
      howToApply: 'Suggest how to apply',
      moreVocabPrompt: 'Provide more vocab for this task.',
      howToApplyPrompt: 'Suggest how to apply the provided vocabulary to this essay.',
      suggestionPrompt: "I'm not sure what to do next. Can you give me a suggestion or a hint?",
    },
    vi: {
      suggest: 'Gợi ý cho tôi',
      think: 'Để tôi suy nghĩ',
      moreVocab: 'Thêm từ vựng',
      howToApply: 'Cách áp dụng',
      moreVocabPrompt: 'Cung cấp thêm từ vựng cho chủ đề này.',
      howToApplyPrompt: 'Gợi ý cách áp dụng các từ vựng đã cho vào bài viết.',
      suggestionPrompt: 'Tôi không chắc nên làm gì tiếp theo. Bạn có thể cho tôi một gợi ý được không?',
    }
  };

  const t = actionButtonTranslations[language];

  useEffect(() => {
    if (activeTab === 'task1' || activeTab === 'task2') {
      setLastViewedTaskTab(activeTab);
    }
  }, [activeTab]);

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
  
  useEffect(() => {
    if (isInteractive) {
      onInitializeTask(1);
    }
  }, [onInitializeTask, isInteractive]);

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

  const handleVocabSuggestionClick = (prompt: string) => {
    const taskNumber = activeTab === 'task1' ? 1 : 2;
    onSendMessage(prompt, taskNumber);
    setShowActionButtons(false);
  };
  
  const handleSuggestionRequest = () => {
    const taskNumber = activeTab === 'task1' ? 1 : 2;
    onSendMessage(t.suggestionPrompt, taskNumber);
    setShowActionButtons(false);
  };

  const handleUserThinking = () => {
      setShowActionButtons(false);
  };

  
  const renderChatInterface = () => {
    const activeMessages = activeTab === 'task1' ? messagesTask1 : messagesTask2;
    const activeVocabulary = activeTab === 'task1' ? vocabularyTask1 : vocabularyTask2;

    return (
      <div className={`flex flex-col h-full ${isInteractive ? '' : 'bg-slate-50'}`}>
        <div className="flex-grow p-6 overflow-y-auto bg-slate-50 space-y-4">
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
        
        {/* UNIFIED SUGGESTION BAR */}
        {isInteractive && showActionButtons && (
            <div className="p-3 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-center flex-wrap gap-2">
                    <button
                        onClick={handleSuggestionRequest}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"
                    >
                        {t.suggest}
                    </button>
                    <button
                        onClick={handleUserThinking}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"
                    >
                        {t.think}
                    </button>
                    {activeVocabulary.length > 0 && (
                        <>
                            <button 
                                onClick={() => handleVocabSuggestionClick(t.moreVocabPrompt)}
                                className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"
                            >
                                {t.moreVocab}
                            </button>
                            <button 
                                onClick={() => handleVocabSuggestionClick(t.howToApplyPrompt)}
                                className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"
                            >
                                {t.howToApply}
                            </button>
                        </>
                    )}
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
    return (
      <div className="flex-grow p-6 overflow-y-auto bg-slate-50 space-y-6 h-full">
        {vocabularyTask1.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-slate-600 mb-3 border-b border-slate-200 pb-2">Task 1 Vocabulary</h4>
            <div className="space-y-4">
              {vocabularyTask1.map(item => <VocabularyCard key={item.word} item={item} />)}
            </div>
          </div>
        )}
        {vocabularyTask2.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-slate-600 mb-3 border-b border-slate-200 pb-2 mt-6">Task 2 Vocabulary</h4>
            <div className="space-y-4">
              {vocabularyTask2.map(item => <VocabularyCard key={item.word} item={item} />)}
            </div>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 flex flex-col" style={isInteractive ? { height: '80vh' } : { height: 'calc(100vh - 12rem)' }}>
      <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-xl font-semibold text-slate-900">{isInteractive ? 'Step 1: AI-Guided Preparation' : 'Preparation Review'}</h3>
        <p className="mt-1 text-slate-500">{isInteractive ? 'Review tasks, chat with your AI tutor, and study suggested vocabulary.' : 'Review your AI chat, vocabulary, and outlines.'}</p>
      </div>
      
      <div className="flex flex-row flex-grow overflow-auto">
        {/* Task Details Panel */}
        {mode === 'interactive' && (
          <aside className="w-[65%] p-6 border-r border-slate-200 bg-slate-50 overflow-y-auto">
            <div className="space-y-6">
               {(activeTab === 'task1' || (activeTab === 'vocabulary' && lastViewedTaskTab === 'task1')) && (
                 <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h5 className="font-bold text-slate-800 mb-2 text-lg">Task 1</h5>
                  {test.tasks[0].imageUrl && (
                    <div className="mb-3 p-1 border rounded-md bg-slate-100">
                      <img src={test.tasks[0].imageUrl} alt="Task 1 Diagram" className="max-w-full rounded" />
                    </div>
                  )}
                  <p className="text-base text-slate-600 leading-relaxed">{test.tasks[0].prompt}</p>
                </div>
              )}
              {(activeTab === 'task2' || (activeTab === 'vocabulary' && lastViewedTaskTab === 'task2')) && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h5 className="font-bold text-slate-800 mb-2 text-lg">Task 2</h5>
                  <p className="text-base text-slate-600 leading-relaxed">{test.tasks[1].prompt}</p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Right Panel */}
        <div className={`flex flex-col bg-white min-w-0 ${mode === 'interactive' ? 'w-[35%]' : 'w-full'}`}>
          {mode === 'interactive' && (
            <>
              <div className="flex bg-orange-500">
                <button onClick={() => handleTabChange('task1')} className={`flex-1 p-3 text-sm font-semibold text-center transition-opacity border-r border-white/20 last:border-r-0 ${activeTab === 'task1' ? 'text-white font-bold' : 'text-white/80 hover:bg-orange-500/80'}`}>Task 1 Prep</button>
                <button onClick={() => handleTabChange('task2')} className={`flex-1 p-3 text-sm font-semibold text-center transition-opacity border-r border-white/20 last:border-r-0 ${activeTab === 'task2' ? 'text-white font-bold' : 'text-white/80 hover:bg-orange-500/80'}`}>Task 2 Prep</button>
                <button onClick={() => handleTabChange('vocabulary')} className={`relative flex-1 p-3 text-sm font-semibold text-center transition-opacity ${activeTab === 'vocabulary' ? 'text-white font-bold' : 'text-white/80 hover:bg-orange-500/80'}`}>
                    Vocabulary
                    {unseenVocabCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unseenVocabCount}
                      </span>
                    )}
                </button>
              </div>
              {activeTab === 'task1' || activeTab === 'task2' ? renderChatInterface() : renderVocabularyInterface()}
            </>
          )}

          {mode === 'review' && (
            <div className="flex flex-col h-full">
                {/* Top Half: Chat & Vocab */}
                <div className="h-1/2 flex flex-col overflow-hidden">
                    <div className="flex bg-orange-500 flex-shrink-0">
                      <button onClick={() => handleTabChange('task1')} className={`flex-1 p-3 text-sm font-semibold text-center transition-opacity border-r border-white/20 last:border-r-0 ${activeTab === 'task1' ? 'text-white font-bold' : 'text-white/80 hover:bg-orange-500/80'}`}>Task 1 Prep</button>
                      <button onClick={() => handleTabChange('task2')} className={`flex-1 p-3 text-sm font-semibold text-center transition-opacity border-r border-white/20 last:border-r-0 ${activeTab === 'task2' ? 'text-white font-bold' : 'text-white/80 hover:bg-orange-500/80'}`}>Task 2 Prep</button>
                      <button onClick={() => handleTabChange('vocabulary')} className={`relative flex-1 p-3 text-sm font-semibold text-center transition-opacity ${activeTab === 'vocabulary' ? 'text-white font-bold' : 'text-white/80 hover:bg-orange-500/80'}`}>Vocabulary</button>
                    </div>
                    {activeTab === 'task1' || activeTab === 'task2' ? renderChatInterface() : renderVocabularyInterface()}
                </div>

                {/* Bottom Half: Outlines */}
                <div className="h-1/2 flex flex-col border-t border-slate-200">
                    <div className="p-4 border-b border-slate-200 bg-white flex-shrink-0">
                        <h4 className="text-lg font-semibold text-slate-800">Essay Outlines</h4>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 bg-slate-50/50 space-y-4">
                        {outlines ? (
                            <>
                                <div>
                                    <h5 className="font-bold text-slate-700 text-base mb-1">Task 1</h5>
                                    {outlines.task1Outline
                                        ? <MarkdownRenderer text={outlines.task1Outline} />
                                        : <p className="text-sm text-slate-500 italic">Preparation for this task was skipped.</p>
                                    }
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-700 text-base mb-1">Task 2</h5>
                                    {outlines.task2Outline
                                        ? <MarkdownRenderer text={outlines.task2Outline} />
                                        : <p className="text-sm text-slate-500 italic">Preparation for this task was skipped.</p>
                                    }
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-400 py-4">
                                <Spinner />
                                <p className="mt-2 text-sm">Loading outlines...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
       {isInteractive && (
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 text-right flex-shrink-0">
            <Button onClick={onComplete} variant="primary">I'm Ready to Write!</Button>
        </div>
       )}
    </div>
  );
};

export default PreparationPhase;