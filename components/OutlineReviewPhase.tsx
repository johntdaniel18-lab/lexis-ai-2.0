import React, { useState, useEffect } from 'react';
import { IeltsTest, ChatMessage, TestMode } from '../types';
import { getEssayOutlines } from '../services/geminiService';
import Spinner from './common/Spinner';
import Button from './common/Button';
import MarkdownRenderer from './common/MarkdownRenderer';

interface OutlineReviewPhaseProps {
  test: IeltsTest;
  chatHistoryTask1: ChatMessage[];
  chatHistoryTask2: ChatMessage[];
  targetScore: number;
  language: 'en' | 'vi';
  onStartWriting: () => void;
  onOutlinesGenerated: (outlines: { task1Outline?: string; task2Outline?: string }) => void;
  testMode: TestMode;
}

const OutlineReviewPhase: React.FC<OutlineReviewPhaseProps> = ({ test, chatHistoryTask1, chatHistoryTask2, targetScore, language, onStartWriting, onOutlinesGenerated, testMode }) => {
  const [outlines, setOutlines] = useState<{ task1Outline?: string; task2Outline?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getEssayOutlines(test, chatHistoryTask1, chatHistoryTask2, targetScore, language);
        setOutlines(result);
        onOutlinesGenerated(result);
      } catch (err: any) {
        console.error("Failed to generate outlines:", err);
        setError("An error occurred while generating your essay outlines. Please try starting the test again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOutlines();
  }, [test, chatHistoryTask1, chatHistoryTask2, targetScore, language, onOutlinesGenerated]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-12">
          <Spinner />
          <h3 className="mt-4 text-xl font-semibold text-slate-700">Your AI tutor is creating your essay outlines...</h3>
          <p className="text-slate-500 mt-2">This is based on your conversation. It will just take a moment.</p>
        </div>
      );
    }
    if (error) {
      return <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>;
    }
    if (outlines) {
      const isMockTest = testMode === 'MOCK_TEST';
      const showTask1 = testMode === 'TASK_1' || isMockTest;
      const showTask2 = testMode === 'TASK_2' || isMockTest;
      
      return (
        <div className={`grid grid-cols-1 ${isMockTest ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'} gap-6 p-6`}>
          {showTask1 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3 text-lg border-b border-slate-200 pb-2">Task 1 Outline</h4>
              <div className="space-y-2">
                {outlines.task1Outline ? (
                  <MarkdownRenderer text={outlines.task1Outline} />
                ) : (
                  <p className="text-slate-500 p-4 text-center italic">You didn't brainstorm for this task, so no outline was generated.</p>
                )}
              </div>
            </div>
          )}
          {showTask2 && (
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3 text-lg border-b border-slate-200 pb-2">Task 2 Outline</h4>
              <div className="space-y-2">
                 {outlines.task2Outline ? (
                  <MarkdownRenderer text={outlines.task2Outline} />
                ) : (
                  <p className="text-slate-500 p-4 text-center italic">You didn't brainstorm for this task, so no outline was generated.</p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">Step 1.5: Review Your Outlines</h3>
        <p className="mt-1 text-slate-500">Here are the plans for your essays based on your discussion with the AI tutor.</p>
      </div>
      {renderContent()}
      {!isLoading && !error && (
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 text-right">
          <Button onClick={onStartWriting} variant="primary">Set Time & Start Writing</Button>
        </div>
      )}
    </div>
  );
};

export default OutlineReviewPhase;