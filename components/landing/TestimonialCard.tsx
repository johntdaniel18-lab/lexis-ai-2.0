import React from 'react';
import UserAvatarIcon from '../icons/UserAvatarIcon';

interface TestimonialCardProps {
  name: string;
  goal: string;
  quote: string;
  avatar?: React.ReactNode;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, goal, quote, avatar }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/70 text-center flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-orange-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border-2 border-orange-200">
                {avatar || <UserAvatarIcon className="w-10 h-10 text-slate-400" />}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed italic mb-4">
                "{quote}"
            </p>
            <div className="mt-auto">
                <p className="font-bold text-slate-800">{name}</p>
                <p className="text-xs text-orange-600 font-semibold">{goal}</p>
            </div>
        </div>
    );
};

export default TestimonialCard;