import React, { useMemo, useEffect } from 'react';
import { Improvement } from '../types';
import Suggestion from './Suggestion';

// Import icons
import TargetIcon from './icons/TargetIcon';
import ChainLinkIcon from './icons/ChainLinkIcon';
import BookIcon from './icons/BookIcon';
import GrammarIcon from './icons/GrammarIcon';


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

// Map criteria to icons
const CRITERION_ICONS: { [key: string]: React.FC<{ className?: string }> } = {
  TaskAchievement: TargetIcon,
  TaskResponse: TargetIcon,
  CoherenceAndCohesion: ChainLinkIcon,
  LexicalResource: BookIcon,
  GrammaticalRangeAndAccuracy: GrammarIcon,
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
            const IconComponent = CRITERION_ICONS[imp.criterion];

            return (
              <div
                key={imp.id}
                id={`suggestion-card-${imp.id}`}
                onClick={() => handleCardClick(imp.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 bg-white shadow-sm hover:bg-slate-100/50 ${isSelected ? 'ring-2 ring-orange-500' : 'border border-slate-200'}`}
              >
                <div className="flex justify-between items-center mb-3">
                   <span className="flex items-center gap-2 px-3 py-1 text-sm font-bold rounded-md bg-orange-500 text-white shadow">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {CRITERION_LABELS[imp.criterion] || 'Suggestion'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-slate-800 leading-relaxed">
                    <Suggestion original={imp.originalText} improved={imp.improvedText} />
                  </div>
                  <p className="text-xs text-slate-500">{imp.explanation}</p>
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