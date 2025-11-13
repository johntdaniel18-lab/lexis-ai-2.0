import React, { useState, useEffect, useRef } from 'react';
import { IeltsTest, PracticeMode } from '../types';
import Button from './common/Button';

interface WritingPhaseProps {
  test: IeltsTest;
  onSubmit: (essay1: string, essay2: string) => void;
  durationInSeconds: number;
  practiceMode: PracticeMode;
  activeTask: 'task1' | 'task2';
  onTaskChange: (task: 'task1' | 'task2') => void;
}

const AUTOSAVE_INTERVAL = 15000; // 15 seconds

const WritingPhase: React.FC<WritingPhaseProps> = ({ test, onSubmit, durationInSeconds, practiceMode, activeTask, onTaskChange }) => {
  const autoSaveKey = `lexis-ai-autosave-test-${test.id}-${practiceMode}`;

  const [task1Essay, setTask1Essay] = useState('');
  const [task2Essay, setTask2Essay] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const timerRef = useRef<number | null>(null);

  const isMockTest = practiceMode === 'mock';

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(autoSaveKey);
      if (savedProgress) {
        const { essay1, essay2 } = JSON.parse(savedProgress);
        setTask1Essay(essay1 || '');
        setTask2Essay(essay2 || '');
      }
    } catch (error) {
      console.error("Failed to load saved essay from localStorage", error);
    }
  }, [autoSaveKey]);

  // Auto-save progress periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const progress = JSON.stringify({ essay1: task1Essay, essay2: task2Essay });
        localStorage.setItem(autoSaveKey, progress);
      } catch (error) {
        console.error("Failed to auto-save essay to localStorage", error);
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [task1Essay, task2Essay, autoSaveKey]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = () => {
    if (timeLeft === 0) {
       // Optional: Add a confirmation if time is up, or just submit
    }
    try {
      localStorage.removeItem(autoSaveKey);
    } catch (error) {
      console.error("Failed to clear auto-saved essay from localStorage", error);
    }
    const finalEssay1 = practiceMode === 'task2' ? '' : task1Essay;
    const finalEssay2 = practiceMode === 'task1' ? '' : task2Essay;
    onSubmit(finalEssay1, finalEssay2);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerColor = () => {
    if (timeLeft <= 300) return 'text-red-600'; // 5 minutes or less
    if (timeLeft <= 900) return 'text-yellow-600'; // 15 minutes or less
    return 'text-slate-800'; // More than 15 minutes
  }

  const task1WordCount = task1Essay.trim().split(/\s+/).filter(Boolean).length;
  const task2WordCount = task2Essay.trim().split(/\s+/).filter(Boolean).length;

  const renderTaskTabs = () => {
    if (!isMockTest) return null;
    return (
      <div className="border-t border-slate-200 flex">
        <button
          onClick={() => onTaskChange('task1')}
          className={`flex-1 p-3 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${activeTask === 'task1' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Task 1
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${task1WordCount < 150 ? 'bg-rose-100 text-rose-800 font-semibold' : 'bg-emerald-100 text-emerald-800 font-semibold'}`}>
            {task1WordCount} words
          </span>
        </button>
        <button
          onClick={() => onTaskChange('task2')}
          className={`flex-1 p-3 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${activeTask === 'task2' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Task 2
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${task2WordCount < 250 ? 'bg-rose-100 text-rose-800 font-semibold' : 'bg-emerald-100 text-emerald-800 font-semibold'}`}>
            {task2WordCount} words
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col h-full">
      {/* Sticky Header with Timer and Tabs */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex-shrink-0">
        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Step 2: Timed Writing Test</h3>
            <p className="mt-1 text-slate-500">You have {durationInSeconds / 60} minutes to complete this session.</p>
          </div>
          <div className={`text-4xl font-bold ${getTimerColor()} ${timeLeft <= 300 && timeLeft > 0 ? 'animate-pulse' : ''} tabular-nums`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        {renderTaskTabs()}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto p-6">
        {(activeTask === 'task1' && practiceMode !== 'task2') && (
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-slate-800">Task 1</h4>
            {test.tasks[0].imageUrl && (
              <div className="my-4 p-2 border rounded-md bg-white border-slate-200 flex justify-center">
                <img src={test.tasks[0].imageUrl} alt="Task 1 Diagram" className="max-w-full max-h-96 object-contain rounded" />
              </div>
            )}
            <p className="text-slate-600">{test.tasks[0].prompt}</p>
            <textarea
              value={task1Essay}
              onChange={(e) => setTask1Essay(e.target.value)}
              className="w-full min-h-[20rem] p-3 border border-slate-300 bg-slate-50 text-slate-900 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Write at least 150 words..."
            />
          </div>
        )}
        {(activeTask === 'task2' && practiceMode !== 'task1') && (
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-slate-800">Task 2</h4>
            <p className="text-slate-600">{test.tasks[1].prompt}</p>
            <textarea
              value={task2Essay}
              onChange={(e) => setTask2Essay(e.target.value)}
              className="w-full min-h-[25rem] p-3 border border-slate-300 bg-slate-50 text-slate-900 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Write at least 250 words..."
            />
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/50 text-right flex-shrink-0">
        <Button onClick={handleSubmit} variant="primary">
          Submit for Feedback
        </Button>
      </div>
    </div>
  );
};

export default WritingPhase;