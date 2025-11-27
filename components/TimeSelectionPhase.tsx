import React, { useState } from 'react';
import Button from './common/Button';
import { PracticeMode } from '../types';

interface TimeSelectionPhaseProps {
  onConfirm: (durationInSeconds: number) => void;
  practiceMode: PracticeMode;
}

const TimeSelectionPhase: React.FC<TimeSelectionPhaseProps> = ({ onConfirm, practiceMode }) => {
  const getDefaultDuration = () => {
    switch (practiceMode) {
      case 'task1': return 20;
      case 'task2': return 40;
      case 'mock': 
      default:      return 60;
    }
  };

  const [durationInMinutes, setDurationInMinutes] = useState(getDefaultDuration());

  const handleAdjustTime = (amount: number) => {
    setDurationInMinutes(prev => {
      const newTime = prev + amount;
      if (newTime < 20) return 20;
      if (newTime > 90) return 90;
      return newTime;
    });
  };

  const formatTime = (minutes: number) => {
    return `${minutes.toString().padStart(2, '0')}:00`;
  };

  const description = {
    task1: "Choose your practice duration. 20 minutes is recommended.",
    task2: "Choose your practice duration. 40 minutes is recommended.",
    mock: "Choose your desired practice duration. 60 minutes is the official exam time."
  };

  const recommendationLabel = () => {
    const defaultDuration = getDefaultDuration();
    if (durationInMinutes !== defaultDuration) return null;
    
    switch (practiceMode) {
      case 'task1': return <p className="text-sm font-semibold text-emerald-600 mt-1">(Recommended Time)</p>;
      case 'task2': return <p className="text-sm font-semibold text-emerald-600 mt-1">(Recommended Time)</p>;
      case 'mock': return <p className="text-sm font-semibold text-emerald-600 mt-1">(Official Exam Time)</p>;
      default: return null;
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="p-8 text-center border-b border-slate-200">
        <h3 className="text-2xl font-extrabold text-slate-900">Set Your Writing Time</h3>
        <p className="mt-2 text-slate-500">
          {description[practiceMode]}
        </p>
      </div>

      <div className="p-8 space-y-8 flex flex-col items-center">
        <div className="w-full max-w-xs flex items-center justify-center gap-4">
          <Button 
            onClick={() => handleAdjustTime(-10)} 
            disabled={durationInMinutes <= 20}
            className="px-6 py-4 text-2xl"
            aria-label="Decrease time by 10 minutes"
          >
            - 10
          </Button>
          <div className="text-center">
            <div className="text-6xl font-extrabold text-orange-600 tabular-nums">
              {formatTime(durationInMinutes)}
            </div>
            {recommendationLabel()}
          </div>
          <Button 
            onClick={() => handleAdjustTime(10)} 
            disabled={durationInMinutes >= 90}
            className="px-6 py-4 text-2xl"
            aria-label="Increase time by 10 minutes"
          >
            + 10
          </Button>
        </div>

        <div className="pt-4">
          <Button onClick={() => onConfirm(durationInMinutes * 60)} variant="primary" className="px-8 py-3 text-lg">
            Begin Timed Writing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionPhase;