import React, { useMemo } from 'react';
import { CompletedTest, StaticDrillModule, IeltsTest } from '../types';
import { analyzePerformanceTrends } from '../services/performanceService';
import Button from './common/Button';

interface PersonalizedDrillWidgetProps {
  completedTests: CompletedTest[];
  tests: IeltsTest[];
  drills: StaticDrillModule[];
  onStartStaticDrill: (module: StaticDrillModule) => void;
  onBrowseCategory: (category: string) => void;
}

const PersonalizedDrillWidget: React.FC<PersonalizedDrillWidgetProps> = ({ completedTests, tests, drills, onStartStaticDrill, onBrowseCategory }) => {
  const analysisResult = useMemo(() => analyzePerformanceTrends(completedTests, tests), [completedTests, tests]);

  const recommendedDrills = useMemo(() => {
    if (!analysisResult || !drills) return [];
    
    const { category, averageBandScore, weakerTask, dominantTopics } = analysisResult;

    const scoredDrills = drills.map(drill => {
      let score = 0;

      // 1. Criterion Match (Mandatory)
      if (drill.category !== category) {
        return { ...drill, score: -1 };
      }
      score += 50;

      // 2. Difficulty Match
      if (averageBandScore < 6.0 && (drill.difficulty === 'Beginner' || drill.difficulty === 'Intermediate')) {
        score += 20;
      } else if (averageBandScore >= 6.0 && drill.difficulty === 'Advanced') {
        score += 20;
      }

      // 3. Task Match
      if (weakerTask && drill.tags.includes(weakerTask)) {
        score += 15;
      }

      // 4. Topic Match
      dominantTopics.forEach(topic => {
        if (drill.tags.includes(topic)) {
          score += 10;
        }
      });
      
      return { ...drill, score };
    });
    
    return scoredDrills
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score);

  }, [analysisResult, drills]);


  if (!analysisResult) {
    return null; // Don't render if there's not enough data or no weakness found
  }

  const { displayName, category } = analysisResult;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-lg shadow-lg border border-orange-200/50">
        <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-orange-500">Personalized Focus</h2>
            <p className="mt-2 text-2xl font-extrabold text-slate-800">
                Your Biggest Opportunity for Improvement is in
            </p>
            <p className="mt-1 text-3xl font-extrabold text-orange-600">
                {displayName}
            </p>
            <p className="mt-4 max-w-3xl mx-auto text-slate-600">
                Based on an analysis of your {completedTests.length} completed tests, focusing on this area can have the greatest impact on your score. Here are some targeted drills to help you practice this specific skill.
            </p>
        </div>
        
        <div className="mt-8">
            {recommendedDrills.length > 0 ? (
                <div className="space-y-6">
                    <h3 className="text-center font-bold text-slate-700">Top Recommended Drills for You</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {recommendedDrills.slice(0, 3).map(drill => (
                            <div key={drill.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                        {drill.difficulty}
                                    </span>
                                    <h4 className="font-bold text-lg text-slate-800 mt-3">{drill.title}</h4>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{drill.description}</p>
                                </div>
                                <Button 
                                    variant="primary" 
                                    onClick={() => onStartStaticDrill(drill)} 
                                    className="w-full mt-4"
                                >
                                    Start Drill
                                </Button>
                            </div>
                        ))}
                    </div>
                     <div className="text-center mt-6">
                        <button 
                            onClick={() => onBrowseCategory(category)}
                            className="font-semibold text-orange-600 hover:text-orange-800 transition-colors"
                        >
                           Browse all {category} Drills &rarr;
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-6 bg-slate-100 rounded-lg border border-slate-200 max-w-lg mx-auto">
                    <p className="font-semibold text-slate-600">We're building our library for <strong className="text-slate-800">{displayName}</strong>.</p>
                    <p className="text-sm text-slate-500 mt-1">Suitable drills will be added soon. Try exploring other categories in the 'Learn' tab!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default PersonalizedDrillWidget;
