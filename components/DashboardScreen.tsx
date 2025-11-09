import React from 'react';
import { IeltsTest, CompletedTest } from '../types';
import Card from './common/Card';

interface DashboardScreenProps {
  tests: IeltsTest[];
  onSelectTest: (test: IeltsTest) => void;
  completedTests: CompletedTest[];
  onViewCompletedTest: (test: CompletedTest) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ tests, onSelectTest, completedTests, onViewCompletedTest }) => {
  return (
    <div className="space-y-16">
      <div>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Select a Practice Test
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Choose a test to begin your AI-guided writing session.
          </p>
        </div>
        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-none">
          {tests.map((test) => (
            <Card 
              key={test.id}
              title={test.title}
              buttonText="Start Test"
              onClick={() => onSelectTest(test)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Your Test History
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Review your past performance and track your progress.
          </p>
        </div>
        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-none">
          {completedTests.length === 0 ? (
            <p className="text-center text-slate-500 col-span-1 lg:col-span-2">You haven't completed any tests yet. Start a new test to see your history here!</p>
          ) : (
            completedTests.slice().reverse().map((completed) => (
              <div key={completed.id} className="flex flex-col rounded-lg shadow-md overflow-hidden border border-slate-200 bg-white">
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-slate-900">{completed.testTitle}</h3>
                      <span className="flex-shrink-0 ml-4 text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        {completed.feedback.overallScore.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      Completed on: {new Date(completed.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-6">
                    <Card 
                      title=""
                      buttonText="View Feedback"
                      onClick={() => onViewCompletedTest(completed)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;