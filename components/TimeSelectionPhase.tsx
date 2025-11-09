import React, { useState } from 'react';
import Button from './common/Button';

interface TimeSelectionPhaseProps {
  onConfirm: (durationInSeconds: number) => void;
}

const TimeSelectionPhase: React.FC<TimeSelectionPhaseProps> = ({ onConfirm }) => {
  const [durationInMinutes, setDurationInMinutes] = useState(60);

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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="p-8 text-center border-b border-slate-200">
        <h3 className="text-2xl font-bold text-slate-900">Set Your Writing Time</h3>
        <p className="mt-2 text-slate-500">
          Choose your desired practice duration. 60 minutes is the official exam time.
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
            {durationInMinutes === 60 && (
                <p className="text-sm font-semibold text-emerald-600 mt-1">(Official Exam Time)</p>
            )}
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
