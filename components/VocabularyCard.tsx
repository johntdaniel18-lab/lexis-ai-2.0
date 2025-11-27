import React from 'react';
import { VocabularyItem } from '../types';
import BookIcon from './icons/BookIcon';

interface VocabularyCardProps {
  item: VocabularyItem;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ item }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-orange-500/30">
      <div className="flex items-center gap-3 mb-2">
        <BookIcon />
        <h4 className="font-bold text-lg text-orange-600">{item.word}</h4>
      </div>
      <p className="text-sm text-slate-600 mb-2 pl-11">{item.definition}</p>
      <div className="pl-11">
        <p className="text-sm text-slate-700 bg-slate-100 p-3 rounded-md italic relative border border-slate-200">
           <span className="absolute top-2 left-[-8px] text-slate-300 text-3xl font-serif">“</span>
            {item.example}
           <span className="absolute bottom-[-5px] right-2 text-slate-300 text-3xl font-serif">”</span>
        </p>
      </div>
    </div>
  );
};

export default VocabularyCard;