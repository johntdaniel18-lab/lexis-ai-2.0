import React, { useMemo } from 'react';
import { CompletedTest, DrillCriterion } from '../types';
import PersonalizedDrillWidget from './PersonalizedDrillWidget';
import ScoreTrendChart from './common/ScoreTrendChart';
import Button from './common/Button';
import TrashIcon from './icons/TrashIcon';

interface ProgressHubScreenProps {
  completedTests: CompletedTest[];
  onViewCompletedTest: (test: CompletedTest) => void;
  onStartDrill: (criterion: DrillCriterion) => void;
  onInitiateDeleteTest: (test: CompletedTest) => void;
}

const ProgressHubScreen: React.FC<ProgressHubScreenProps> = ({ completedTests, onViewCompletedTest, onStartDrill, onInitiateDeleteTest }) => {
  const uniqueVocabularyCount = useMemo(() => {
    const allWords = completedTests.flatMap(test => test.vocabulary.map(v => v.word.toLowerCase()));
    return new Set(allWords).size;
  }, [completedTests]);

  if (completedTests.length === 0) {
    return (
        <div className="text-center py-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                My Progress Hub
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                Complete your first test to see your scores and history here. Visit the <span className="font-bold text-orange-500">'Learn'</span> tab to start practicing with drills right away!
            </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            My Progress Hub
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Track your performance, identify weaknesses, and review past tests.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <ScoreTrendChart completedTests={completedTests} />
            </div>
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 text-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500">Tests Completed</h3>
                    <p className="text-5xl font-extrabold text-slate-800 mt-2">{completedTests.length}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 text-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500">Unique Vocabulary</h3>
                    <p className="text-5xl font-extrabold text-slate-800 mt-2">{uniqueVocabularyCount}</p>
                     <p className="text-xs text-slate-400 mt-1">words learned</p>
                </div>
            </div>
        </div>


      {completedTests.length >= 3 && (
        <PersonalizedDrillWidget completedTests={completedTests} onStartDrill={onStartDrill} />
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Your Test History
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Review your past performance and track your progress.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {completedTests.slice().reverse().map((completed) => (
            <div key={completed.id} className="flex flex-col rounded-lg shadow-md overflow-hidden border border-slate-200 bg-white">
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{completed.testTitle}</h3>
                       <p className="mt-1 text-sm text-slate-400">
                        Completed on: {new Date(completed.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-md">
                          {completed.feedback.overallScore.toFixed(1)}
                        </span>
                        <button
                          onClick={() => onInitiateDeleteTest(completed)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          aria-label={`Delete history for ${completed.testTitle}`}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                  </div>
                 
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => onViewCompletedTest(completed)}
                    className="w-full justify-center"
                  >
                    View Feedback
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressHubScreen;