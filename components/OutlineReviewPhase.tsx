import React, { useState, useEffect } from 'react';
import { IeltsTest, ChatMessage } from '../types';
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
  onProceedToWriting: () => void;
  onOutlinesGenerated: (outlines: { task1Outline?: string; task2Outline?: string }) => void;
}

const OutlineReviewPhase: React.FC<OutlineReviewPhaseProps> = ({ test, chatHistoryTask1, chatHistoryTask2, targetScore, language, onProceedToWriting, onOutlinesGenerated }) => {
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
      const hasTask1Outline = outlines.task1Outline && outlines.task1Outline.trim() !== "";
      const hasTask2Outline = outlines.task2Outline && outlines.task2Outline.trim() !== "";
      
      return (
        <div className={`grid grid-cols-1 ${hasTask1Outline && hasTask2Outline ? 'md:grid-cols-2' : ''} gap-6 p-6`}>
          {hasTask1Outline && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
              <h4 className="font-extrabold text-slate-800 mb-3 text-lg border-b border-slate-200 pb-2">Task 1 Outline</h4>
              <div className="space-y-2">
                <MarkdownRenderer text={outlines.task1Outline!} />
              </div>
            </div>
          )}
          {hasTask2Outline && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
              <h4 className="font-extrabold text-slate-800 mb-3 text-lg border-b border-slate-200 pb-2">Task 2 Outline</h4>
              <div className="space-y-2">
                 <MarkdownRenderer text={outlines.task2Outline!} />
              </div>
            </div>
          )}
          {!hasTask1Outline && !hasTask2Outline && (
             <p className="text-slate-500 p-4 text-center italic col-span-1">You didn't brainstorm for any task, so no outlines were generated.</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xl font-extrabold text-slate-900">Step 1.5: Review Your Outlines</h3>
        <p className="mt-1 text-slate-500">Here are the plans for your essays based on your discussion with the AI tutor.</p>
      </div>
      {renderContent()}
      {!isLoading && !error && (
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 text-right">
          <Button onClick={onProceedToWriting} variant="primary">Continue to Time Selection</Button>
        </div>
      )}
    </div>
  );
};

export default OutlineReviewPhase;