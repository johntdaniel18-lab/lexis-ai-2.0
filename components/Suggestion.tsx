import React from 'react';

interface SuggestionProps {
  original: string;
  improved: string;
}

const Suggestion: React.FC<SuggestionProps> = ({ original, improved }) => {
  // Clean the improved text from any potential markdown diffs the AI might still send.
  const improvedTextContent = improved.replace(/(\*\*|~~)/g, '');

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-md font-medium line-through">
        {original}
      </span>
      <span className="font-bold text-slate-400">&rarr;</span>
      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-medium">
        {improvedTextContent}
      </span>
    </div>
  );
};

export default Suggestion;
