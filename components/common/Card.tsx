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
  return (
    <div className="flex flex-col rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 border border-slate-200 bg-white">
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white text-slate-700 border border-slate-200 shadow-sm">
                        {tag}
                    </span>
                ))}
            </div>
          )}
          {description && <p className="mt-3 text-base text-slate-500">{description}</p>}
        </div>
        <div className="mt-6">
          <Button onClick={onClick} variant="primary" className="w-full justify-center">
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Card;