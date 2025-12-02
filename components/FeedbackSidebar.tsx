import React, { useMemo, useEffect } from 'react';
import { Improvement } from '../types';
import Suggestion from './Suggestion';

interface FeedbackSidebarProps {
  improvements: Improvement[];
  selectedImprovementId: string | null;
  onSelectImprovement: (id: string | null) => void;
  activeTaskTab: 'task1' | 'task2';
  onTabChange: (tab: 'task1' | 'task2') => void;
}

const CRITERION_LABELS: { [key: string]: string } = {
  TaskAchievement: 'Task Achievement',
  TaskResponse: 'Task Response',
  CoherenceAndCohesion: 'Coherence & Cohesion',
  LexicalResource: 'Lexical Resource',
  GrammaticalRangeAndAccuracy: 'Grammar & Accuracy',
};

const CRITERION_PILL_STYLES: { [key: string]: string } = {
  TaskAchievement: 'bg-blue-100 text-blue-800',
  TaskResponse: 'bg-blue-100 text-blue-800',
  CoherenceAndCohesion: 'bg-emerald-100 text-emerald-800',
  LexicalResource: 'bg-rose-100 text-rose-800',
  GrammaticalRangeAndAccuracy: 'bg-red-100 text-red-800',
};


const FeedbackSidebar: React.FC<FeedbackSidebarProps> = ({ improvements, selectedImprovementId, onSelectImprovement, activeTaskTab, onTabChange }) => {

  const activeImprovements = useMemo(() => {
    const taskNumber = activeTaskTab === 'task1' ? 1 : 2;
    return improvements.filter(imp => imp.taskNumber === taskNumber);
  }, [improvements, activeTaskTab]);

  useEffect(() => {
    if (selectedImprovementId) {
      const element = document.getElementById(`suggestion-card-${selectedImprovementId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedImprovementId]);
  
  const handleCardClick = (id: string) => {
    onSelectImprovement(id);
    const element = document.getElementById(`highlight-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  };

  return (
    <div className="flex flex-col h-full" style={{maxHeight: 'calc(100vh - 8rem)'}}>
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <h4 className="font-semibold text-lg text-slate-800">Improvement Suggestions</h4>
        <p className="text-sm text-slate-500">Click a card to see the context in your essay.</p>
      </div>

       <div className="border-b border-slate-200 flex bg-slate-100 flex-shrink-0">
        <button onClick={() => onTabChange('task1')} className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTaskTab === 'task1' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-slate-500 hover:bg-slate-200'}`}>Task 1</button>
        <button onClick={() => onTabChange('task2')} className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTaskTab === 'task2' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-slate-500 hover:bg-slate-200'}`}>Task 2</button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {activeImprovements.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No specific improvements suggested for this task.</p>
        ) : (
          activeImprovements.map((imp) => {
            const isSelected = imp.id === selectedImprovementId;
            const pillStyle = CRITERION_PILL_STYLES[imp.criterion] || 'bg-slate-200 text-slate-800';
            return (
              <div
                key={imp.id}
                id={`suggestion-card-${imp.id}`}
                onClick={() => handleCardClick(imp.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 bg-white shadow-sm hover:bg-slate-100/50 ${isSelected ? 'ring-2 ring-orange-500' : 'border border-slate-200'}`}
              >
                <div className="flex justify-between items-center mb-3">
                   <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${pillStyle}`}>
                    {CRITERION_LABELS[imp.criterion] || 'Suggestion'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-base text-slate-800 leading-relaxed">
                    <Suggestion original={imp.originalText} improved={imp.improvedText} />
                  </div>
                  <p className="text-sm text-slate-500">{imp.explanation}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FeedbackSidebar;