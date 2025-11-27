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

const AUTOSAVE_INTERVAL = 60000; // 1 minute

const WritingPhase: React.FC<WritingPhaseProps> = ({ test, onSubmit, durationInSeconds, practiceMode, activeTask, onTaskChange }) => {
  const autoSaveKey = `lexis-ai-autosave-test-${test.id}-${practiceMode}`;

  const [task1Essay, setTask1Essay] = useState('');
  const [task2Essay, setTask2Essay] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  // Refs to hold latest essay content for the interval closure
  const task1EssayRef = useRef(task1Essay);
  const task2EssayRef = useRef(task2Essay);

  const isMockTest = practiceMode === 'mock';

  // Update refs whenever state changes
  useEffect(() => {
    task1EssayRef.current = task1Essay;
    task2EssayRef.current = task2Essay;
  }, [task1Essay, task2Essay]);

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
        const progress = JSON.stringify({ essay1: task1EssayRef.current, essay2: task2EssayRef.current });
        localStorage.setItem(autoSaveKey, progress);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to auto-save essay to localStorage", error);
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [autoSaveKey]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;

        // Trigger notifications
        if (newTime === 600) { // 10 minutes
            setNotification("10 minutes remaining.");
            setTimeout(() => setNotification(null), 5000);
        }
        if (newTime === 300) { // 5 minutes
            setNotification("5 minutes remaining. Please wrap up!");
            setTimeout(() => setNotification(null), 5000);
        }

        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          setIsTimeUp(true); // Trigger Pencils Down state instead of auto-submit
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = () => {
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
  
  const getTimerStyles = () => {
    if (timeLeft <= 300) {
        // Critical Zone (< 5 mins)
        return { 
            container: 'bg-red-200', 
            text: 'text-red-900',
            animation: 'animate-pulse'
        }; 
    }
    if (timeLeft <= 900) {
        // Focus Zone (15 - 5 mins)
        return { 
            container: 'bg-orange-200', 
            text: 'text-orange-900',
            animation: ''
        };
    }
    // Comfortable Zone (> 15 mins)
    return { 
        container: 'bg-slate-200', 
        text: 'text-slate-800',
        animation: ''
    };
  };

  const timerStyles = getTimerStyles();

  const task1WordCount = task1Essay.trim().split(/\s+/).filter(Boolean).length;
  const task2WordCount = task2Essay.trim().split(/\s+/).filter(Boolean).length;

  const renderTaskTabs = () => {
    if (!isMockTest) return null;
    return (
      <div className="border-t border-slate-200 flex">
        <button
          onClick={() => onTaskChange('task1')}
          disabled={isTimeUp}
          className={`flex-1 p-3 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${activeTask === 'task1' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-slate-500 hover:bg-slate-50'} ${isTimeUp ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Task 1
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${task1WordCount < 150 ? 'bg-rose-100 text-rose-800 font-semibold' : 'bg-emerald-100 text-emerald-800 font-semibold'}`}>
            {task1WordCount} words
          </span>
        </button>
        <button
          onClick={() => onTaskChange('task2')}
          disabled={isTimeUp}
          className={`flex-1 p-3 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2 ${activeTask === 'task2' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-slate-500 hover:bg-slate-50'} ${isTimeUp ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col h-full relative">
      
      {/* Image Modal */}
      {imageModalUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImageModalUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size image view"
        >
          <img
            src={imageModalUrl}
            alt="Task diagram full size"
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()} 
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors text-5xl font-light"
            onClick={() => setImageModalUrl(null)}
            aria-label="Close image view"
          >
            &times;
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {notification}
            </div>
        </div>
      )}

      {/* Pencils Down Modal Overlay */}
      {isTimeUp && (
        <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center transform scale-100 transition-transform">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Time is up!</h3>
                <p className="text-slate-600 mb-8">The test has ended. Please put your "pencils" down and submit your work for analysis.</p>
                <Button onClick={handleSubmit} variant="primary" className="w-full py-3 text-lg">
                    Submit & View Feedback
                </Button>
            </div>
        </div>
      )}

      {/* Sticky Header with Timer and Tabs */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex-shrink-0">
        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Step 2: Timed Writing Test</h3>
            <p className="mt-1 text-slate-500">You have {durationInSeconds / 60} minutes to complete this session.</p>
          </div>
          
          {/* Dashboard Gauge Timer - Soft Solid Style with Plus Jakarta Sans */}
          <div className={`px-6 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center ${timerStyles.container} ${timerStyles.animation}`}>
            <span className={`text-3xl font-extrabold tracking-widest tabular-nums ${timerStyles.text}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        {renderTaskTabs()}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto p-6">
        {(activeTask === 'task1' && practiceMode !== 'task2') && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-lg text-slate-800">Task 1</h4>
            {test.tasks[0].imageUrl && (
              <div className="my-4 p-2 border rounded-md bg-white border-slate-200 flex justify-center group">
                <img 
                  src={test.tasks[0].imageUrl} 
                  alt="Task 1 Diagram - Click to enlarge" 
                  className="max-w-full max-h-96 object-contain rounded cursor-zoom-in transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg"
                  onClick={() => setImageModalUrl(test.tasks[0].imageUrl)}
                />
              </div>
            )}
            <p className="text-slate-600">{test.tasks[0].prompt}</p>
            <textarea
              value={task1Essay}
              onChange={(e) => setTask1Essay(e.target.value)}
              disabled={isTimeUp}
              className="w-full min-h-[20rem] p-3 border border-slate-300 bg-slate-50 text-slate-900 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Write at least 150 words..."
            />
          </div>
        )}
        {(activeTask === 'task2' && practiceMode !== 'task1') && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-lg text-slate-800">Task 2</h4>
            <p className="text-slate-600">{test.tasks[1].prompt}</p>
            <textarea
              value={task2Essay}
              onChange={(e) => setTask2Essay(e.target.value)}
              disabled={isTimeUp}
              className="w-full min-h-[25rem] p-3 border border-slate-300 bg-slate-50 text-slate-900 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Write at least 250 words..."
            />
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
        <span className="text-xs text-slate-400 font-medium italic">
            {lastSaved ? `Draft autosaved at ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
        </span>
        <Button onClick={handleSubmit} variant="primary" disabled={isTimeUp}>
          Submit for Feedback
        </Button>
      </div>
    </div>
  );
};

export default WritingPhase;
