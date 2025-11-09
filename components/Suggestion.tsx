import React from 'react';

interface SuggestionProps {
  original: string;
  improved: string;
}

const Suggestion: React.FC<SuggestionProps> = ({ original, improved }) => {
  // Heuristic to check if the AI provided a markdown diff.
  const hasMarkdown = improved.includes('~~') || improved.includes('**');

  // Case 1: The AI provides a detailed diff with markdown (the ideal case).
  if (hasMarkdown) {
    const parts = improved.split(/(~~.*?~~|\*\*.*?\*\*)/g).filter(Boolean);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('~~') && part.endsWith('~~')) {
            return <s key={i} className="text-red-700 bg-red-100 px-1 rounded-sm">{part.slice(2, -2)}</s>;
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-orange-800 bg-orange-100 px-1 rounded-sm">{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  }

  // Case 2: Fallback for when the AI provides a simple correction without markdown.
  // This ensures the user always sees the 'before' and 'after' for clarity.
  return (
    <span>
      <s className="text-red-700 bg-red-100 px-1 rounded-sm">{original}</s>
      <span className="mx-1.5 font-sans font-bold text-slate-500">→</span>
      <strong className="text-emerald-800 bg-emerald-100 px-1 rounded-sm">{improved}</strong>
    </span>
  );
};

export default Suggestion;