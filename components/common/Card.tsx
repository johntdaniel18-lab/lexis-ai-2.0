import React from 'react';
import Button from './Button';

interface CardProps {
  title: string;
  description?: string;
  tags?: string[];
  buttonText: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, tags, buttonText, onClick }) => {
  const MAX_TAGS_TO_SHOW = 3;
  const displayedTags = tags?.slice(0, MAX_TAGS_TO_SHOW) || [];
  const remainingTagsCount = tags ? Math.max(0, tags.length - MAX_TAGS_TO_SHOW) : 0;

  return (
    <div className="flex flex-col rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 border border-slate-200 bg-white">
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
                {displayedTags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {tag}
                    </span>
                ))}
                {remainingTagsCount > 0 && (
                  <span className="text-xs font-bold text-slate-400">
                    +{remainingTagsCount} more
                  </span>
                )}
            </div>
          )}
          {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
        </div>
        <div className="mt-4">
          <Button onClick={onClick} variant="primary" className="w-full justify-center">
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Card;