import React, { useState } from 'react';
import Button from './common/Button';
import LanguageSwitcher from './common/LanguageSwitcher';

interface TargetScoreSelectionPhaseProps {
  onGoalsSet: (goals: { score: number, language: 'en' | 'vi' }) => void;
}

const TargetScoreSelectionPhase: React.FC<TargetScoreSelectionPhaseProps> = ({ onGoalsSet }) => {
  const [targetScore, setTargetScore] = useState<number>(6.5);
  const [language, setLanguage] = useState<'en' | 'vi'>('en');

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetScore(parseFloat(e.target.value));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGoalsSet({ score: targetScore, language });
  }

  const languageDescriptions = {
    vi: "Great for beginners! Use your native language to focus on brainstorming ideas and structuring your essay without worrying about English vocabulary at first.",
    en: "Recommended for a full exam simulation. This provides a more challenging practice by requiring you to think and plan directly in English."
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="p-8 text-center border-b border-slate-200">
        <h3 className="text-2xl font-bold text-slate-900">Set Your Practice Goals</h3>
        <p className="mt-2 text-slate-500">
          Configure your AI tutor for this practice session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 flex flex-col items-center">
        {/* Target Score Section */}
        <div className="w-full max-w-lg">
           <label htmlFor="score-slider" className="block text-center text-lg font-semibold text-slate-700 mb-2">
            1. What's your target band score?
          </label>
          <div className="text-center text-5xl font-extrabold text-orange-600 mb-4">
            {targetScore.toFixed(1)}
          </div>
          <input
            id="score-slider"
            type="range"
            min="4.0"
            max="9.0"
            step="0.5"
            value={targetScore}
            onChange={handleScoreChange}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer range-lg accent-orange-500"
          />
           <div className="flex justify-between text-xs text-slate-400 w-full px-1 mt-2">
            <span>4.0</span>
            <span>5.0</span>
            <span>6.0</span>
            <span>7.0</span>
            <span>8.0</span>
            <span>9.0</span>
          </div>
        </div>

        {/* Language Selection Section */}
        <div className="w-full max-w-lg pt-4 border-t border-slate-200">
          <label className="block text-center text-lg font-semibold text-slate-700 mb-4">
            2. Choose your preparation language
          </label>
          <div className="flex justify-center">
             <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
          </div>
          <div className="mt-4 text-center p-3 bg-slate-100 text-slate-600 rounded-md border border-slate-200 text-sm max-w-md mx-auto">
            <p>{languageDescriptions[language]}</p>
          </div>
        </div>


        <div className="pt-4">
          <Button type="submit" variant="primary" className="px-8 py-3 text-lg">
            Start AI-Guided Prep
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TargetScoreSelectionPhase;