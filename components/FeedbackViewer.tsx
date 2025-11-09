import React, { useState } from 'react';
import { CompletedTest } from '../types';
import FeedbackPhase from './FeedbackPhase';
import VocabularyCard from './VocabularyCard';

interface FeedbackViewerProps {
  testResult: CompletedTest;
}

type ActiveTab = 'feedback' | 'vocabulary';

const FeedbackViewer: React.FC<FeedbackViewerProps> = ({ testResult }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feedback');

  const renderContent = () => {
    if (activeTab === 'feedback') {
      return (
        <FeedbackPhase 
          feedback={testResult.feedback}
          essay1={testResult.essay1}
          essay2={testResult.essay2}
        />
      );
    }
    if (activeTab === 'vocabulary') {
      return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
           <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Vocabulary List</h3>
                <p className="mt-1 text-slate-500">This is the vocabulary suggested by your AI tutor during the preparation phase.</p>
            </div>
            <div className="p-6 bg-slate-50 space-y-4">
                 {testResult.vocabulary.length > 0 ? (
                    testResult.vocabulary.map(item => <VocabularyCard key={item.word} item={item} />)
                ) : (
                    <p className="text-center text-slate-500 py-8">No vocabulary was generated for this test session.</p>
                )}
            </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">{testResult.testTitle}</h2>
                <p className="text-sm text-slate-500 mt-1">
                Completed on {new Date(testResult.completionDate).toLocaleString()}
                </p>
            </div>
            <div className="text-center bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h4 className="text-xs font-medium text-orange-700">Overall Score</h4>
                <p className="text-3xl font-extrabold text-orange-600">{testResult.feedback.overallScore.toFixed(1)}</p>
            </div>
        </div>
      </div>

      <div className="border-b border-slate-200 flex bg-white rounded-t-lg shadow-sm">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTab === 'feedback' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Feedback Report
        </button>
        <button
          onClick={() => setActiveTab('vocabulary')}
          className={`flex-1 p-3 text-sm font-semibold text-center transition-colors ${activeTab === 'vocabulary' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Vocabulary ({testResult.vocabulary.length})
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default FeedbackViewer;