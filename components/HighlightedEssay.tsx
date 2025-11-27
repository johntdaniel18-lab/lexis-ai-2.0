import React, { useMemo } from 'react';
import { Improvement } from '../types';

interface HighlightedEssayProps {
  essay: string;
  improvements: Improvement[];
  selectedImprovementId: string | null;
  onSelectImprovement: (id: string | null) => void;
}

const CRITERION_COLORS: { [key: string]: string } = {
  TaskAchievement: 'bg-blue-100 hover:bg-blue-200/70',
  TaskResponse: 'bg-blue-100 hover:bg-blue-200/70',
  CoherenceAndCohesion: 'bg-emerald-100 hover:bg-emerald-200/70',
  LexicalResource: 'bg-rose-100 hover:bg-rose-200/70',
  GrammaticalRangeAndAccuracy: 'bg-red-100 hover:bg-red-200/70',
  default: 'bg-slate-200 hover:bg-slate-300/70'
};

const HighlightedEssay: React.FC<HighlightedEssayProps> = ({ essay, improvements, selectedImprovementId, onSelectImprovement }) => {

  const highlightedElements = useMemo(() => {
    if (!essay || !improvements || improvements.length === 0) {
      return <p key="full-text" className="whitespace-pre-wrap">{essay || "No essay submitted."}</p>;
    }

    const allMatches: { start: number; end: number; improvement: Improvement }[] = [];
    const essayLower = essay.toLowerCase();
    
    improvements.forEach(imp => {
      const searchText = imp.originalText.trim();
      if (!searchText) return; 

      const searchLower = searchText.toLowerCase();
      let startIndex = 0;
      while ((startIndex = essayLower.indexOf(searchLower, startIndex)) !== -1) {
        const endIndex = startIndex + searchText.length;
        allMatches.push({ start: startIndex, end: endIndex, improvement: imp });
        startIndex++; 
      }
    });
    
    const finalMatches: { start: number; end: number; improvement: Improvement }[] = [];
    
    allMatches.sort((a, b) => {
        const lengthA = a.end - a.start;
        const lengthB = b.end - a.start;
        if (lengthA !== lengthB) {
            return lengthB - lengthA;
        }
        return a.start - b.start;
    });

    const doesOverlap = (matchA: {start: number, end: number}, matchB: {start: number, end: number}) => {
        return Math.max(matchA.start, matchB.start) < Math.min(matchA.end, matchB.end);
    };

    allMatches.forEach(match => {
        const isOverlapping = finalMatches.some(finalMatch => doesOverlap(match, finalMatch));
        if (!isOverlapping) {
            finalMatches.push(match);
        }
    });

    finalMatches.sort((a, b) => a.start - b.start);

    if (finalMatches.length === 0) {
        return <p key="full-text" className="whitespace-pre-wrap">{essay || "No essay submitted."}</p>;
    }

    const elements: (string | React.ReactElement)[] = [];
    let lastIndex = 0;

    finalMatches.forEach(match => {
      if (match.start > lastIndex) {
        elements.push(essay.substring(lastIndex, match.start));
      }

      const improvement = match.improvement;
      const isSelected = selectedImprovementId === improvement.id;
      const colorClass = CRITERION_COLORS[improvement.criterion] || CRITERION_COLORS.default;
      
      elements.push(
        <span
          key={improvement.id}
          id={`highlight-${improvement.id}`}
          onClick={() => onSelectImprovement(improvement.id)}
          className={`px-0.5 rounded-sm cursor-pointer transition-all duration-200 ${colorClass} ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
        >
          {essay.substring(match.start, match.end)}
        </span>
      );

      lastIndex = match.end;
    });

    if (lastIndex < essay.length) {
      elements.push(essay.substring(lastIndex));
    }

    return <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{elements}</p>;

  }, [essay, improvements, selectedImprovementId, onSelectImprovement]);

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h5 className="font-semibold text-slate-600 mb-2">Your Essay with Highlights</h5>
        {highlightedElements}
    </div>
  );
};

export default HighlightedEssay;