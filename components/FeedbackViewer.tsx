import React, { useState, useCallback, useMemo } from 'react';
import { CompletedTest, IeltsTest, EssayFeedback, DrillCriterion } from '../types';
import FeedbackPhase from './FeedbackPhase';
import VocabularyCard from './VocabularyCard';
import Button from './common/Button';
import { generateModelAnswer } from '../services/geminiService';

interface FeedbackViewerProps {
  testResult: CompletedTest;
  originalTest?: IeltsTest;
  onRewrite: (testResult: CompletedTest) => void;
  onExit: () => void;
  onStartDrill: (criterion: string) => void;
}

type ActiveTab = 'feedback' | 'vocabulary';

const FeedbackViewer: React.FC<FeedbackViewerProps> = ({ testResult, originalTest, onRewrite, onExit, onStartDrill }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feedback');
  const [modelAnswers, setModelAnswers] = useState<{ task1: string | null, task2: string | null }>({ task1: null, task2: null });
  const [isModelAnswerLoading, setIsModelAnswerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findWeakestCriterion = useCallback((feedback: EssayFeedback): string | null => {
    const scores: { name: DrillCriterion; score: number }[] = [];
    const t1 = feedback.detailedScores.task1;
    const t2 = feedback.detailedScores.task2;
    
    scores.push({ name: 'TaskFulfillment', score: t1.TaskAchievement.score });
    scores.push({ name: 'CoherenceAndCohesion', score: t1.CoherenceAndCohesion.score });
    scores.push({ name: 'LexicalResource', score: t1.LexicalResource.score });
    scores.push({ name: 'GrammaticalRangeAndAccuracy', score: t1.GrammaticalRangeAndAccuracy.score });
    
    scores.push({ name: 'TaskFulfillment', score: t2.TaskResponse.score });
    scores.push({ name: 'CoherenceAndCohesion', score: t2.CoherenceAndCohesion.score });
    scores.push({ name: 'LexicalResource', score: t2.LexicalResource.score });
    scores.push({ name: 'GrammaticalRangeAndAccuracy', score: t2.GrammaticalRangeAndAccuracy.score });

    if (scores.length === 0) return null;

    const averages: { [key in DrillCriterion]?: { total: number; count: number } } = {};
    scores.forEach(s => {
        if (!averages[s.name]) {
            averages[s.name] = { total: 0, count: 0 };
        }
        averages[s.name]!.total += s.score;
        averages[s.name]!.count++;
    });

    let weakest: { name: string; score: number } | null = null;

    for (const key in averages) {
        const avg = averages[key as DrillCriterion]!.total / averages[key as DrillCriterion]!.count;
        if (!weakest || avg < weakest.score) {
            weakest = { name: key, score: avg };
        }
    }
    
    return weakest ? weakest.name : null;
  }, []);

  const weakestCriterion = useMemo(() => findWeakestCriterion(testResult.feedback), [testResult.feedback, findWeakestCriterion]);

  const handleGenerateModelAnswer = useCallback(async (taskNumber: 1 | 2) => {
    if (!originalTest) return;

    setIsModelAnswerLoading(true);
    setError(null);
    try {
        const prompt = originalTest.tasks[taskNumber - 1].prompt;
        const answer = await generateModelAnswer(prompt, taskNumber);
        setModelAnswers(prev => ({
            ...prev,
            [taskNumber === 1 ? 'task1' : 'task2']: answer
        }));
    } catch (err: any) {
        console.error("Failed to generate model answer", err);
        setError("Could not generate the model answer. Please try again in a moment.");
    } finally {
        setIsModelAnswerLoading(false);
    }
  }, [originalTest]);

  const renderContent = () => {
    if (activeTab === 'feedback') {
      return (
        <>
            {error && (
                <div className="mb-4 text-center p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                    <p>{error}</p>
                </div>
            )}
            <FeedbackPhase 
              feedback={testResult.feedback}
              essay1={testResult.essay1}
              essay2={testResult.essay2}
              originalTestPrompt1={originalTest?.tasks[0].prompt}
              originalTestPrompt2={originalTest?.tasks[1].prompt}
              onGenerateModelAnswer={handleGenerateModelAnswer}
              modelAnswers={modelAnswers}
              isModelAnswerLoading={isModelAnswerLoading}
            />
        </>
      );
    }
    if (activeTab === 'vocabulary') {
      return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
           <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-extrabold text-slate-900">Vocabulary List</h3>
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
                <h2 className="text-2xl font-extrabold text-slate-900">{testResult.testTitle}</h2>
                <p className="text-sm text-slate-500 mt-1">
                Completed on {new Date(testResult.completionDate).toLocaleString()}
                </p>
            </div>
            <div className="text-center bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h4 className="text-xs font-extrabold text-orange-700">Overall Score</h4>
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

      <div className="mt-8 p-6 bg-slate-100 border-t border-slate-200 rounded-b-lg flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <p className="font-semibold text-slate-700">What would you like to do next?</p>
        <div className="flex items-center gap-4">
          {weakestCriterion && (
             <Button onClick={() => onStartDrill(weakestCriterion)} variant="primary">
                Practice Weakest Skill
            </Button>
          )}
          <Button onClick={() => onRewrite(testResult)} variant="secondary">
            Rewrite This Test
          </Button>
        </div>
      </div>

    </div>
  );
};

export default FeedbackViewer;