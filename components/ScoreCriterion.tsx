import React, { useState } from 'react';
import { CriterionScore } from '../types';

interface ScoreCriterionProps {
  label: string;
  criterionScore: CriterionScore;
}

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ScoreCriterion: React.FC<ScoreCriterionProps> = ({ label, criterionScore }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-b-0 py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-sm p-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md transition-colors hover:bg-slate-100"
        aria-expanded={isOpen}
        aria-controls={`feedback-panel-${label.replace(/\s+/g, '-')}`}
      >
        <span className="text-slate-600">{label}</span>
        <div className="flex items-center gap-2">
            <span className="font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">{criterionScore.score.toFixed(1)}</span>
            <ChevronIcon isOpen={isOpen} />
        </div>
      </button>
      <div 
        id={`feedback-panel-${label.replace(/\s+/g, '-')}`}
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
             <div className="px-1 pt-2 pb-1 text-sm text-slate-600 bg-white rounded-b-md">
                <p className="border-l-2 border-orange-200 pl-3">{criterionScore.feedback}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCriterion;
