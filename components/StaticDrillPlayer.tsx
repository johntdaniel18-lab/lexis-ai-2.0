

import React, { useState, useEffect, useRef } from 'react';
import { StaticDrillModule, DrillGroup, DrillQuestion } from '../types';
import Button from './common/Button';
import MarkdownRenderer from './common/MarkdownRenderer';

interface StaticDrillPlayerProps {
  module: StaticDrillModule;
  onExit: () => void;
  onComplete: (result: { score: number, totalQuestions: number }) => void;
}

const StaticDrillPlayer: React.FC<StaticDrillPlayerProps> = ({ module, onExit, onComplete }) => {
  // Navigation / View State
  const [activeView, setActiveView] = useState<'LESSON' | 'EXERCISES'>('LESSON');
  const [isSummary, setIsSummary] = useState(false);

  // Interaction State: Map questionId -> UserAnswer (string)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Header Visibility State
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Calculate total questions
    let count = 0;
    if (module.groups) {
        module.groups.forEach(group => {
            if (group.questions) {
                count += group.questions.length;
            }
        });
    }
    setTotalQuestions(count);
  }, [module]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const currentScrollY = e.currentTarget.scrollTop;
      const threshold = 10; // Minimum scroll to trigger change

      if (Math.abs(currentScrollY - lastScrollY.current) > threshold) {
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
              // Scrolling Down & past top area
              setIsHeaderVisible(false);
          } else {
              // Scrolling Up
              setIsHeaderVisible(true);
          }
          lastScrollY.current = currentScrollY;
      }
  };

  const handleInputChange = (questionId: string, value: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    
    module.groups?.forEach(group => {
      group.questions?.forEach(q => {
        const answer = userAnswers[q.id];
        if (!answer) return;

        if (group.type === 'MCQ' || group.type === 'MATCHING') {
            if (answer === q.correctAnswer) correctCount++;
        } else if (group.type === 'NOTES_COMPLETION') {
            const possibleAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
            if (possibleAnswers.some(pa => pa.toLowerCase().trim() === answer.toLowerCase().trim())) {
                correctCount++;
            }
        }
      });
    });

    setScore(correctCount);
    setIsSubmitted(true);
  };

  const handleRetry = () => {
      setIsSubmitted(false);
      setScore(0);
      setUserAnswers({});
      setIsSummary(false);
  };

  const handleFinishAndSave = () => {
    onComplete({ score, totalQuestions });
    // The App component will handle navigation away from the player
  };

  // --- RENDERERS FOR QUESTION TYPES ---

  const renderMCQ = (group: DrillGroup) => {
      return (
          <div className="space-y-6">
              {(group.questions || []).map((q, idx) => (
                      <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                          <div className="flex gap-3">
                              <span className="font-bold text-orange-600">{idx + 1}.</span>
                              <div className="flex-grow">
                                  <p className="font-medium text-slate-800 mb-3 whitespace-pre-wrap">{q.text}</p>
                                  <div className="space-y-2">
                                      {q.options?.map((opt, optIdx) => {
                                          const optValue = optIdx.toString();
                                          const isSelected = userAnswers[q.id] === optValue;
                                          let btnClass = "w-full text-left px-4 py-2 rounded border transition-colors text-sm ";
                                          
                                          if (isSubmitted) {
                                              if (optValue === q.correctAnswer) btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800 font-bold";
                                              else if (isSelected) btnClass += "bg-red-100 border-red-500 text-red-800";
                                              else btnClass += "bg-slate-50 border-slate-200 text-slate-400";
                                          } else {
                                              if (isSelected) btnClass += "bg-orange-50 border-orange-500 text-orange-800 font-medium";
                                              else btnClass += "bg-white border-slate-200 hover:bg-slate-50";
                                          }

                                          return (
                                              <button 
                                                key={optIdx}
                                                onClick={() => handleInputChange(q.id, optValue)}
                                                disabled={isSubmitted}
                                                className={btnClass}
                                              >
                                                  <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                                  {opt}
                                              </button>
                                          )
                                      })}
                                  </div>
                                  {isSubmitted && userAnswers[q.id] !== q.correctAnswer && q.explanation && (
                                      <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                                          <span className="font-bold">Explanation:</span> {q.explanation}
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )
              )}
          </div>
      );
  };

  const renderMatching = (group: DrillGroup) => {
      return (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              {/* Options Box */}
              <div className="mb-6 p-4 bg-slate-100 rounded-md border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Options</h5>
                  <div className="flex flex-wrap gap-4">
                      {group.sharedOptions?.map((opt, idx) => (
                          <div key={idx} className="font-medium text-slate-700 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">
                              <span className="font-bold text-orange-600 mr-1">{String.fromCharCode(65 + idx)}</span> {opt}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                  {(group.questions || []).map((q, idx) => {
                      const isCorrect = userAnswers[q.id] === q.correctAnswer;
                      
                      return (
                          <div key={q.id} className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded">
                              <div className="flex items-center gap-3">
                                  <span className="font-bold text-orange-600">{idx + 1}.</span>
                                  <p className="text-slate-800 whitespace-pre-wrap">{q.text}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                  <select 
                                    value={userAnswers[q.id] || ""}
                                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                                    disabled={isSubmitted}
                                    className={`block w-full py-2 pl-3 pr-8 border rounded focus:ring-orange-500 focus:border-orange-500 ${isSubmitted ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-red-500 bg-red-50 text-red-800') : 'border-slate-300 bg-white text-slate-900'}`}
                                  >
                                      <option value="">Select</option>
                                      {group.sharedOptions?.map((_, optIdx) => (
                                          <option key={optIdx} value={optIdx.toString()}>{String.fromCharCode(65 + optIdx)}</option>
                                      ))}
                                  </select>
                                  {isSubmitted && (
                                      <span className="text-lg">
                                          {isCorrect ? '✅' : '❌'}
                                      </span>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const renderNotesCompletion = (group: DrillGroup) => {
      if (!group.content) return null;
      
      const parts = group.content.split(/({{[^}]+}})/g);
      let questionCounter = 0;
      
      return (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm leading-loose text-slate-800 whitespace-pre-wrap">
              {parts.map((part, idx) => {
                  if (part.startsWith('{{') && part.endsWith('}}')) {
                      questionCounter++;
                      const qId = part.slice(2, -2); // extract qId
                      const question = group.questions?.find(q => q.id === qId);
                      if (!question) return null;

                      const userAnswer = userAnswers[qId] || "";
                      const possibleAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
                      const isCorrect = possibleAnswers.some(pa => pa.toLowerCase().trim() === userAnswer.toLowerCase().trim());
                      const isWrong = isSubmitted && !isCorrect;

                      return (
                          <span key={idx} className="relative inline-block mx-1 whitespace-nowrap">
                              <span className="font-bold text-orange-600 mr-1">{questionCounter}.</span>
                              <input
                                  type="text"
                                  value={userAnswer}
                                  onChange={(e) => handleInputChange(qId, e.target.value)}
                                  disabled={isSubmitted}
                                  className={`w-32 border-b-2 px-1 py-0.5 focus:outline-none font-bold bg-transparent ${isSubmitted ? (isCorrect ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600') : 'border-slate-400 focus:border-orange-500'}`}
                              />
                              {isWrong && (
                                  <div className="absolute top-full left-0 mt-1 bg-red-100 text-red-800 text-xs p-2 rounded shadow-lg z-10 w-48 whitespace-normal">
                                      <span className="font-bold">Answer:</span> {possibleAnswers[0]}
                                  </div>
                              )}
                          </span>
                      );
                  }
                  return <span key={idx}>{part}</span>;
              })}
          </div>
      );
  };

  // --- Main Render ---

  if (isSummary) {
      return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Drill Complete!</h2>
                <div className="text-6xl font-black text-orange-500 mb-2">{score} / {totalQuestions}</div>
                <p className="text-slate-500 mb-8">Correct Answers</p>
                
                <div className="space-y-3">
                    <Button variant="primary" className="w-full py-3" onClick={handleFinishAndSave}>Save & Exit</Button>
                    <Button variant="secondary" className="w-full py-3" onClick={handleRetry}>Retry Drill</Button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden">
        {/* Floating Header Wrapper */}
        <div 
            className={`absolute top-0 left-0 right-0 z-20 bg-white shadow-md border-b border-slate-200 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}
        >
            {/* Main Top Bar */}
            <div className="flex justify-between items-center p-4 lg:px-8">
                <div className="flex flex-col">
                    <h2 className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">{module.title}</h2>
                    {!isSubmitted && <span className="text-xs text-slate-500">Practice Mode</span>}
                </div>
                
                <div className="flex items-center gap-3">
                    {isSubmitted ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Mobile/Condensed Score */}
                            <div className="sm:hidden bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 rounded-full text-sm border border-emerald-200">
                                {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
                            </div>

                            {/* Desktop Detailed Score Card */}
                            <div className="hidden sm:flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-orange-100 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Score</p>
                                    <div className="flex items-baseline leading-none mt-0.5">
                                        <span className="text-xl font-black text-slate-900">{score}</span>
                                        <span className="text-xs font-bold text-slate-400 mx-1">/</span>
                                        <span className="text-sm font-bold text-slate-500">{totalQuestions}</span>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-slate-100"></div>
                                <div className="text-right">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                                     <p className={`text-xl font-black leading-none mt-0.5 ${score === totalQuestions ? 'text-emerald-500' : 'text-orange-500'}`}>
                                        {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
                                     </p>
                                </div>
                            </div>

                            <Button variant="primary" onClick={() => setIsSummary(true)} className="text-sm py-2 px-6 shadow-md shadow-orange-500/20 bg-orange-600 hover:bg-orange-700 border-none">
                                Finish
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button variant="primary" onClick={handleSubmit} className="text-sm py-2 px-4 shadow-sm">
                                Check All Answers
                            </Button>
                            <Button variant="secondary" onClick={onExit} className="text-sm py-2 px-3 border-none hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                Exit
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Tab Bar - Attached to Header */}
            <div className="lg:hidden flex border-t border-slate-200">
                <button 
                    onClick={() => setActiveView('LESSON')}
                    className={`flex-1 p-3 text-sm font-bold transition-colors ${activeView === 'LESSON' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Lesson
                </button>
                <button 
                    onClick={() => setActiveView('EXERCISES')}
                    className={`flex-1 p-3 text-sm font-bold transition-colors ${activeView === 'EXERCISES' ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Worksheet
                </button>
            </div>
        </div>

        {/* Main Content Area - Padded top to account for floating header */}
        <div className="flex-grow flex overflow-hidden h-full pt-[116px] lg:pt-[72px]">
            {/* LEFT PANEL: Lesson */}
            <div 
                onScroll={handleScroll}
                className={`flex-1 bg-white overflow-y-auto border-r border-slate-200 ${activeView === 'LESSON' ? 'block' : 'hidden'} lg:block`}
            >
                <div className="p-8 max-w-3xl mx-auto prose prose-slate pb-24">
                    <MarkdownRenderer text={module.lessonContent} baseSize="base" />
                </div>
            </div>

            {/* RIGHT PANEL: Worksheet */}
            <div 
                onScroll={handleScroll}
                className={`flex-1 bg-slate-50 overflow-y-auto ${activeView === 'EXERCISES' ? 'block' : 'hidden'} lg:block`}
            >
                <div className="p-6 lg:p-10 space-y-8 max-w-3xl mx-auto w-full pb-24">
                    {(module.groups || []).map((group, idx) => (
                        <div key={group.id} className="space-y-4">
                             <div className="bg-orange-600 text-white rounded-lg shadow-md p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-extrabold">
                                        {group.title || `Question Group ${idx + 1}`}
                                    </h3>
                                    <span className="bg-white/20 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                                        {group.type.replace('_', ' ')}
                                    </span>
                                </div>
                                {group.instruction && (
                                    <p className="mt-2 text-sm text-white/90">
                                        {group.instruction}
                                    </p>
                                )}
                            </div>
                            
                            {group.type === 'MCQ' && renderMCQ(group)}
                            {group.type === 'MATCHING' && renderMatching(group)}
                            {group.type === 'NOTES_COMPLETION' && renderNotesCompletion(group)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default StaticDrillPlayer;
