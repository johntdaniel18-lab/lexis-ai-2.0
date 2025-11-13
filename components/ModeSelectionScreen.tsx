import React from 'react';
import { IeltsTest, PracticeMode } from '../types';
import Button from './common/Button';
import Card from './common/Card';

interface ModeSelectionScreenProps {
  test: IeltsTest;
  onModeSelect: (mode: PracticeMode) => void;
  onExit: () => void;
}

const modeDetails = {
  task1: {
    title: "Practice Task 1",
    description: "A 20-minute, AI-guided deep dive into Task 1. Perfect for analyzing charts and practicing descriptive writing.",
    buttonText: "Start Task 1 Practice"
  },
  task2: {
    title: "Practice Task 2",
    description: "A 40-minute, AI-guided session for Task 2. Ideal for brainstorming ideas and structuring a compelling essay.",
    buttonText: "Start Task 2 Practice"
  },
  mock: {
    title: "Full Mock Test",
    description: "A 60-minute, exam-style simulation with both tasks. This mode skips the AI prep to test your writing skills under pressure.",
    buttonText: "Start Mock Test"
  }
};

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ test, onModeSelect, onExit }) => {
  return (
    <div className="space-y-12">
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">You've selected: {test.title}</h2>
            <Button onClick={onExit} variant="secondary">Choose Another Test</Button>
        </div>
      </div>

       <div className="text-center">
          <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Choose Your Practice Mode
          </h3>
          <p className="mt-4 text-lg text-slate-500">
            How would you like to practice today?
          </p>
        </div>
      
      <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-5xl">
        <Card 
          title={modeDetails.task1.title}
          description={modeDetails.task1.description}
          buttonText={modeDetails.task1.buttonText}
          onClick={() => onModeSelect('task1')}
        />
        <Card 
          title={modeDetails.task2.title}
          description={modeDetails.task2.description}
          buttonText={modeDetails.task2.buttonText}
          onClick={() => onModeSelect('task2')}
        />
        <Card 
          title={modeDetails.mock.title}
          description={modeDetails.mock.description}
          buttonText={modeDetails.mock.buttonText}
          onClick={() => onModeSelect('mock')}
        />
      </div>

    </div>
  );
};

export default ModeSelectionScreen;
