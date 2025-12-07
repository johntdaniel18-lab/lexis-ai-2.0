import React, { useState } from 'react';
import { CriterionScore } from '../types';
import CheckIcon from './icons/CheckIcon';

// --- ICONS ---
const ThumbsUpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.714 4.072M7 10h2m-2 0v10m0-10H5.236a2 2 0 00-1.789 2.894l3.5 7A2 2 0 005.236 21H7" />
    </svg>
);

const LightbulbIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const ExclamationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// Helper to render text with **keyword** highlights
const HighlightRenderer: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    // Split by the markdown bold syntax, keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>{parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <span key={i} className="bg-orange-100 text-orange-800 font-medium px-1 rounded-sm">{part.slice(2, -2)}</span>
                : part
        )}</>
    );
};

const ScoreCriterion: React.FC<{ label: string; criterionScore: CriterionScore }> = ({ label, criterionScore }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fallback for potentially missing data
  const feedback = criterionScore?.feedback || {
      positive: { summary: 'Not available.', detail: '' },
      negative: { summary: 'Not available.', detail: '' },
      suggestions: ['Feedback not available.']
  };

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
             <div className="px-1 pt-3 pb-2 text-sm text-slate-600 bg-white rounded-b-md space-y-5">
                
                {/* Positive Feedback */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 mt-0.5">
                        <ThumbsUpIcon />
                    </div>
                    <div>
                        <h5 className="font-semibold text-emerald-800">What you did well:</h5>
                        <p className="font-bold text-slate-800 mt-1">{feedback.positive.summary}</p>
                        <p className="text-slate-700 mt-1 leading-relaxed">
                            <HighlightRenderer text={feedback.positive.detail} />
                        </p>
                    </div>
                </div>
                
                {/* Negative Feedback */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 mt-0.5">
                        <ExclamationIcon />
                    </div>
                    <div>
                        <h5 className="font-semibold text-red-800">What to improve:</h5>
                        <p className="font-bold text-slate-800 mt-1">{feedback.negative.summary}</p>
                         <p className="text-slate-700 mt-1 leading-relaxed">
                            <HighlightRenderer text={feedback.negative.detail} />
                        </p>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mt-0.5">
                        <LightbulbIcon />
                    </div>
                    <div>
                        <h5 className="font-semibold text-blue-800">How to improve:</h5>
                        <ul className="mt-2 space-y-2">
                            {feedback.suggestions.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-800">
                                    <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCriterion;