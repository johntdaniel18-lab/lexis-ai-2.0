import React from 'react';
import { DrillCriterion } from '../types';
import Card from './common/Card';

interface LearnScreenProps {
  onStartFreestyleDrill: (criterion: DrillCriterion) => void;
}

const DRILL_DESCRIPTIONS: Record<DrillCriterion, { title: string; description: string }> = {
    TaskFulfillment: {
        title: 'Task Achievement / Response',
        description: 'Practice analyzing prompts and supporting your ideas with relevant, specific examples.'
    },
    CoherenceAndCohesion: {
        title: 'Coherence & Cohesion',
        description: 'Improve your essay structure, paragraphing, and the logical flow between ideas.'
    },
    LexicalResource: {
        title: 'Lexical Resource',
        description: 'Expand your vocabulary with more precise words, collocations, and paraphrasing skills.'
    },
    GrammaticalRangeAndAccuracy: {
        title: 'Grammar & Accuracy',
        description: 'Strengthen your use of complex sentence structures and reduce grammatical errors.'
    }
};

const LearnScreen: React.FC<LearnScreenProps> = ({ onStartFreestyleDrill }) => {
  return (
    <div className="space-y-16">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Practice Hub
        </h2>
        <p className="mt-4 text-lg text-slate-500">
          Sharpen your skills with targeted drills anytime you want.
        </p>
      </div>
      <div className="mt-12 max-w-lg mx-auto grid gap-8 md:grid-cols-2 md:max-w-4xl">
        {(Object.keys(DRILL_DESCRIPTIONS) as DrillCriterion[]).map(criterion => {
          const drill = DRILL_DESCRIPTIONS[criterion];
          return (
              <Card 
                  key={criterion}
                  title={drill.title}
                  description={drill.description}
                  buttonText="Start Drill"
                  onClick={() => onStartFreestyleDrill(criterion)}
              />
          );
        })}
      </div>
    </div>
  );
};

export default LearnScreen;