import React, { useMemo, useState } from 'react';
import { CompletedTest, StaticDrillModule, IeltsTest, CompletedDrill } from '../types';
import PersonalizedDrillWidget from './PersonalizedDrillWidget';
import ScoreTrendChart from './common/ScoreTrendChart';
import Button from './common/Button';
import TrashIcon from './icons/TrashIcon';
import CircularProgress from './common/CircularProgress';

interface ProgressHubScreenProps {
  completedTests: CompletedTest[];
  completedDrills: CompletedDrill[];
  tests: IeltsTest[];
  drills: StaticDrillModule[];
  onViewCompletedTest: (test: CompletedTest) => void;
  onStartStaticDrill: (module: StaticDrillModule) => void;
  onBrowseCategory: (category: string) => void;
  onInitiateDeleteTest: (test: CompletedTest) => void;
  onInitiateDeleteDrill: (drill: CompletedDrill) => void;
}

const ProgressHubScreen: React.FC<ProgressHubScreenProps> = ({ 
  completedTests, 
  completedDrills,
  tests,
  drills,
  onViewCompletedTest, 
  onStartStaticDrill, 
  onBrowseCategory,
  onInitiateDeleteTest,
  onInitiateDeleteDrill
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'drills'>('tests');

  const uniqueVocabularyCount = useMemo(() => {
    const allWords = completedTests.flatMap(test => test.vocabulary.map(v => v.word.toLowerCase()));
    return new Set(allWords).size;
  }, [completedTests]);

  if (completedTests.length === 0 && completedDrills.length === 0) {
    return (
        <div className="text-center py-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                My Progress Hub
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                Complete your first test or drill to see your progress and history here.
            </p>
      </div>
    );
  }

  const renderTestHistory = () => (
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
  );
  
  const renderDrillHistory = () => (
     <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {completedDrills.length > 0 ? (
        completedDrills.map((drillResult) => {
            const originalDrill = drills.find(d => d.id === drillResult.drillId);
            return (
                <div key={drillResult.id} className="flex flex-col rounded-lg shadow-md overflow-hidden border border-slate-200 bg-white">
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {drillResult.category}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {drillResult.difficulty}
                                </span>
                            </div>
                          <h3 className="text-lg font-semibold text-slate-900 leading-tight">{drillResult.drillTitle}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                           <CircularProgress score={drillResult.score} total={drillResult.totalQuestions} />
                        </div>
                      </div>
                       <p className="text-sm text-slate-400">
                        Completed on: {new Date(drillResult.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Button
                        onClick={() => originalDrill && onStartStaticDrill(originalDrill)}
                        className="w-full justify-center"
                        variant="secondary"
                        disabled={!originalDrill}
                      >
                        Retry Drill
                      </Button>
                       <button
                          onClick={() => onInitiateDeleteDrill(drillResult)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          aria-label={`Delete history for ${drillResult.drillTitle}`}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                  </div>
                </div>
            )
        })
      ) : (
        <p className="col-span-full text-center text-slate-500 py-8">
            You haven't completed any drills yet. Visit the 'Learn' tab to get started!
        </p>
      )}
    </div>
  );


  return (
    <div className="space-y-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            My Progress Hub
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Track your performance, identify weaknesses, and review past work.
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
                    <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500">Drills Completed</h3>
                    <p className="text-5xl font-extrabold text-slate-800 mt-2">{completedDrills.length}</p>
                </div>
            </div>
        </div>


      {completedTests.length >= 3 && (
        <PersonalizedDrillWidget 
            completedTests={completedTests} 
            tests={tests}
            drills={drills} 
            onStartStaticDrill={onStartStaticDrill}
            onBrowseCategory={onBrowseCategory}
        />
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Your History
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Review your past performance and track your progress.
          </p>
        </div>
        
        <div className="mt-8">
            <div className="flex justify-center border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('tests')}
                    className={`px-6 py-3 text-sm font-bold -mb-px border-b-2 ${activeTab === 'tests' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Test History
                </button>
                <button
                    onClick={() => setActiveTab('drills')}
                    className={`px-6 py-3 text-sm font-bold -mb-px border-b-2 ${activeTab === 'drills' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Drill History
                </button>
            </div>
            {activeTab === 'tests' ? renderTestHistory() : renderDrillHistory()}
        </div>
      </div>
    </div>
  );
};

export default ProgressHubScreen;