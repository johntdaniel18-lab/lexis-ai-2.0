import React, { useState, useMemo, useCallback } from 'react';
import { EssayFeedback, Improvement } from '../types';
import HighlightedEssay from './HighlightedEssay';
import FeedbackSidebar from './FeedbackSidebar';
import ScoreCriterion from './ScoreCriterion';
import Button from './common/Button';
import Spinner from './common/Spinner';
import MarkdownRenderer from './common/MarkdownRenderer';

// --- ICONS ---
const LightningIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-rose-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TrophyIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-emerald-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


// --- MODEL ANSWER DISPLAY ---
interface ModelAnswerDisplayProps {
    prompt: string;
    modelAnswer: string;
}
const ModelAnswerDisplay: React.FC<ModelAnswerDisplayProps> = ({ prompt, modelAnswer }) => (
    <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h5 className="font-bold text-slate-800 text-base">Model Answer</h5>
        <p className="text-xs text-slate-500 mt-1 mb-3 italic">Prompt: "{prompt}"</p>
        <div className="p-3 bg-white rounded-md border border-slate-200">
            <MarkdownRenderer text={modelAnswer} />
        </div>
    </div>
);

// --- MAIN COMPONENT ---
interface FeedbackPhaseProps {
  feedback: EssayFeedback;
  essay1: string;
  essay2: string;
  originalTestPrompt1?: string;
  originalTestPrompt2?: string;
  onGenerateModelAnswer: (taskNumber: 1 | 2) => void;
  modelAnswers: { task1: string | null; task2: string | null };
  isModelAnswerLoading: boolean;
}

const FeedbackPhase: React.FC<FeedbackPhaseProps> = ({ 
    feedback, 
    essay1, 
    essay2, 
    originalTestPrompt1,
    originalTestPrompt2,
    onGenerateModelAnswer,
    modelAnswers,
    isModelAnswerLoading,
}) => {
  const [activeTaskTab, setActiveTaskTab] = useState<'task1' | 'task2'>('task1');
  
  const initialImprovementId = useMemo(() => {
    const firstImprovementForTab = feedback.improvements.find(imp => `task${imp.taskNumber}` === activeTaskTab);
    return firstImprovementForTab ? firstImprovementForTab.id : (feedback.improvements[0]?.id || null);
  }, [feedback.improvements, activeTaskTab]);

  const [selectedImprovementId, setSelectedImprovementId] = useState<string | null>(initialImprovementId);

  const handleSelectImprovement = useCallback((id: string | null) => {
    setSelectedImprovementId(id);
    if (id) {
        const improvement = feedback.improvements.find(imp => imp.id === id);
        if (improvement) {
            setActiveTaskTab(`task${improvement.taskNumber}`);
        }
    }
  }, [feedback.improvements]);
  
  const handleTabChange = (tab: 'task1' | 'task2') => {
    setActiveTaskTab(tab);
    // When changing tabs, select the first improvement for that tab, if any.
    const firstImprovementForNewTab = feedback.improvements.find(imp => `task${imp.taskNumber}` === tab);
    setSelectedImprovementId(firstImprovementForNewTab ? firstImprovementForNewTab.id : null);
  };

  const task1Improvements = useMemo(() => feedback.improvements.filter(imp => imp.taskNumber === 1), [feedback.improvements]);
  const task2Improvements = useMemo(() => feedback.improvements.filter(imp => imp.taskNumber === 2), [feedback.improvements]);
  const task1WordCount = useMemo(() => essay1.trim().split(/\s+/).filter(Boolean).length, [essay1]);
  const task2WordCount = useMemo(() => essay2.trim().split(/\s+/).filter(Boolean).length, [essay2]);

  const getWordCountPill = (count: number, min: number) => {
    const metMinimum = count >= min;
    const style = metMinimum ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';
    return <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${style}`}>{count} words</span>;
  };
  
  const renderTaskContent = () => {
    if (activeTaskTab === 'task1') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center">
                <h4 className="text-2xl font-extrabold text-slate-800">Task 1 Essay Analysis</h4>
                {getWordCountPill(task1WordCount, 150)}
             </div>
             {!modelAnswers.task1 && (
                <Button variant="secondary" onClick={() => onGenerateModelAnswer(1)} disabled={isModelAnswerLoading}>
                    {isModelAnswerLoading ? 'Generating...' : 'Show Band 9 Model Answer'}
                </Button>
            )}
          </div>
          <HighlightedEssay
            essay={essay1}
            improvements={task1Improvements}
            selectedImprovementId={selectedImprovementId}
            onSelectImprovement={handleSelectImprovement}
          />
          {isModelAnswerLoading && !modelAnswers.task1 && <div className="text-center"><Spinner /></div>}
          {modelAnswers.task1 && originalTestPrompt1 && <ModelAnswerDisplay prompt={originalTestPrompt1} modelAnswer={modelAnswers.task1} />}
        </div>
      );
    }
    return (
       <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
                <h4 className="text-2xl font-extrabold text-slate-800">Task 2 Essay Analysis</h4>
                {getWordCountPill(task2WordCount, 250)}
            </div>
             {!modelAnswers.task2 && (
                <Button variant="secondary" onClick={() => onGenerateModelAnswer(2)} disabled={isModelAnswerLoading}>
                     {isModelAnswerLoading ? 'Generating...' : 'Show Band 9 Model Answer'}
                </Button>
            )}
          </div>
          <HighlightedEssay
            essay={essay2}
            improvements={task2Improvements}
            selectedImprovementId={selectedImprovementId}
            onSelectImprovement={handleSelectImprovement}
          />
          {isModelAnswerLoading && !modelAnswers.task2 && <div className="text-center"><Spinner /></div>}
          {modelAnswers.task2 && originalTestPrompt2 && <ModelAnswerDisplay prompt={originalTestPrompt2} modelAnswer={modelAnswers.task2} />}
        </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xl font-extrabold text-slate-900">Step 3: Interactive Feedback Report</h3>
        <p className="mt-1 text-slate-500">Click on highlighted text or a suggestion to see details.</p>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 xl:w-2/3 p-6 space-y-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          <div className="text-center bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h4 className="text-lg font-extrabold text-orange-700">Overall Band Score</h4>
            <p className="text-6xl font-extrabold text-orange-600 my-2">{feedback?.overallScore?.toFixed(1) ?? 'N/A'}</p>
            <p className="text-slate-600 whitespace-pre-wrap">{feedback?.overallFeedback || 'Overall feedback not available.'}</p>
          </div>

          <div>
            <h4 className="text-xl font-extrabold text-slate-800 text-center mb-6">Summary Feedback</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Areas for Improvement */}
              <div>
                <h5 className="flex items-center gap-2 text-lg font-bold text-rose-600 mb-4">
                  <LightningIcon /> Areas for Improvement
                </h5>
                <ul className="space-y-4">
                  {(feedback.areasForImprovement || []).map((item, index) => (
                    <li key={`imp-${index}`} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-rose-100 mt-1">
                        <LightningIcon className="h-4 w-4 text-rose-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{item.title}</p>
                        <p className="text-sm text-slate-600">{item.feedback}</p>
                      </div>
                    </li>
                  ))}
                  {(feedback.areasForImprovement || []).length === 0 && <p className="text-sm text-slate-400 italic">No major areas for improvement identified. Great job!</p>}
                </ul>
              </div>
              {/* Strengths */}
              <div>
                <h5 className="flex items-center gap-2 text-lg font-bold text-emerald-600 mb-4">
                  <TrophyIcon /> Your Strengths
                </h5>
                <ul className="space-y-4">
                  {(feedback.strengths || []).map((strength, index) => (
                    <li key={`str-${index}`} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 mt-1">
                        <TrophyIcon className="h-4 w-4 text-emerald-500" />
                      </div>
                      <p className="text-sm text-slate-700 pt-1">{strength}</p>
                    </li>
                  ))}
                  {(feedback.strengths || []).length === 0 && <p className="text-sm text-slate-400 italic">No specific strengths highlighted in this report.</p>}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm"><h5 className="font-extrabold text-slate-800 mb-3 text-center border-b border-slate-200 pb-2">Task 1 Scores</h5><div className="space-y-1"><ScoreCriterion label="Task Achievement" criterionScore={feedback.detailedScores.task1.TaskAchievement} /><ScoreCriterion label="Coherence & Cohesion" criterionScore={feedback.detailedScores.task1.CoherenceAndCohesion} /><ScoreCriterion label="Lexical Resource" criterionScore={feedback.detailedScores.task1.LexicalResource} /><ScoreCriterion label="Grammar & Accuracy" criterionScore={feedback.detailedScores.task1.GrammaticalRangeAndAccuracy} /></div></div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm"><h5 className="font-extrabold text-slate-800 mb-3 text-center border-b border-slate-200 pb-2">Task 2 Scores</h5><div className="space-y-1"><ScoreCriterion label="Task Response" criterionScore={feedback.detailedScores.task2.TaskResponse} /><ScoreCriterion label="Coherence & Cohesion" criterionScore={feedback.detailedScores.task2.CoherenceAndCohesion} /><ScoreCriterion label="Lexical Resource" criterionScore={feedback.detailedScores.task2.LexicalResource} /><ScoreCriterion label="Grammar & Accuracy" criterionScore={feedback.detailedScores.task2.GrammaticalRangeAndAccuracy} /></div></div>
          </div>
          
          <div>
            <div className="border-b border-slate-200 flex bg-slate-50 rounded-t-lg">
                <button onClick={() => handleTabChange('task1')} className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTaskTab === 'task1' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>Task 1 Analysis</button>
                <button onClick={() => handleTabChange('task2')} className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTaskTab === 'task2' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>Task 2 Analysis</button>
            </div>
            <div className="py-6">{renderTaskContent()}</div>
          </div>
        </div>
        
        <aside className="w-full lg:w-2/5 xl:w-1/3 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/70">
          <FeedbackSidebar
            improvements={feedback.improvements}
            selectedImprovementId={selectedImprovementId}
            onSelectImprovement={handleSelectImprovement}
            activeTaskTab={activeTaskTab}
            onTabChange={handleTabChange}
          />
        </aside>
      </div>
    </div>
  );
};

export default FeedbackPhase;