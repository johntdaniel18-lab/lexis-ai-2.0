import React from 'react';
import Button from './Button';

interface CardProps {
  title: string;
  description?: string;
  buttonText: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, buttonText, onClick }) => {
  return (
    <div className="flex flex-col rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 border border-slate-200">
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
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