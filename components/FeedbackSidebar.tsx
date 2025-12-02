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

// --- NEW ICONS ---
const TaskResponseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CohesionIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);
const LexicalIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const GrammarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const CRITERION_LABELS: { [key: string]: string } = {
  TaskAchievement: 'Task Achievement',
  TaskResponse: 'Task Response',
  CoherenceAndCohesion: 'Coherence & Cohesion',
  LexicalResource: 'Lexical Resource',
  GrammaticalRangeAndAccuracy: 'Grammar & Accuracy',
};

const CRITERION_ICONS: { [key: string]: React.FC } = {
  TaskAchievement: TaskResponseIcon,
  TaskResponse: TaskResponseIcon,
  CoherenceAndCohesion: CohesionIcon,
  LexicalResource: LexicalIcon,
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
                   <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-orange-500 text-white">
                    {IconComponent && <IconComponent />}
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
