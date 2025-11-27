import React, { useMemo } from 'react';
import { CompletedTest } from '../types';
import { analyzePerformanceTrends } from '../services/performanceService';
import Button from './common/Button';

interface PersonalizedDrillWidgetProps {
  completedTests: CompletedTest[];
  onStartDrill: (criterion: string) => void;
}

const PersonalizedDrillWidget: React.FC<PersonalizedDrillWidgetProps> = ({ completedTests, onStartDrill }) => {
  const analysisResult = useMemo(() => analyzePerformanceTrends(completedTests), [completedTests]);

  if (!analysisResult) {
    return null; // Don't render if there's not enough data or no weakness found
  }

  const { weakestCriterion, displayName } = analysisResult;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-lg shadow-lg border border-orange-200/50 text-center">
        <h2 className="text-sm font-bold uppercase tracking-wider text-orange-500">Personalized Focus</h2>
        <p className="mt-2 text-2xl font-extrabold text-slate-800">
            Your Biggest Opportunity for Improvement is in
        </p>
        <p className="mt-1 text-3xl font-extrabold text-orange-600">
            {displayName}
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-slate-600">
            Based on an analysis of your {completedTests.length} completed tests, focusing on this area can have the greatest impact on your score. A short, targeted drill can help you practice this specific skill.
        </p>
        <div className="mt-6">
            <Button 
                variant="primary" 
                onClick={() => onStartDrill(weakestCriterion)}
                className="px-6 py-3 text-base"
            >
                Start a 5-Min Drill
            </Button>
        </div>
    </div>
  );
};

export default PersonalizedDrillWidget;
