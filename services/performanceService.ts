import { CompletedTest, DrillCriterion, StaticDrillModule, IeltsTest } from '../types';

interface LearnerProfile {
  weakestCriterion: DrillCriterion;
  displayName: string;
  category: StaticDrillModule['category'];
  averageBandScore: number;
  weakerTask: 'Task 1' | 'Task 2' | null;
  dominantTopics: string[];
}


const CRITERIA_DISPLAY_MAPPING: { [key in DrillCriterion]: string } = {
  TaskFulfillment: 'Task Achievement / Response',
  CoherenceAndCohesion: 'Coherence and Cohesion',
  LexicalResource: 'Lexical Resource',
  GrammaticalRangeAndAccuracy: 'Grammar & Accuracy',
};

const CRITERIA_CATEGORY_MAPPING: { [key in DrillCriterion]: StaticDrillModule['category'] } = {
  TaskFulfillment: 'Task Response',
  CoherenceAndCohesion: 'Coherence',
  LexicalResource: 'Vocabulary',
  GrammaticalRangeAndAccuracy: 'Grammar',
};

/**
 * Analyzes a user's completed test history to build a detailed learner profile.
 * @param completedTests An array of the user's completed tests.
 * @param allTests The complete list of all available IeltsTest objects.
 * @returns A LearnerProfile object or null if analysis is not possible.
 */
export const analyzePerformanceTrends = (completedTests: CompletedTest[], allTests: IeltsTest[]): LearnerProfile | null => {
  if (!completedTests || completedTests.length < 3) {
    return null; // Not enough data for a meaningful analysis.
  }
  
  const recentTests = completedTests.slice(0, 3);

  // --- 1. Calculate Weakest Criterion & Average Band Score ---
  const scores: { [key in DrillCriterion]: { total: number; count: number } } = {
    TaskFulfillment: { total: 0, count: 0 },
    CoherenceAndCohesion: { total: 0, count: 0 },
    LexicalResource: { total: 0, count: 0 },
    GrammaticalRangeAndAccuracy: { total: 0, count: 0 },
  };
  
  let task1ScoreTotal = 0;
  let task1Count = 0;
  let task2ScoreTotal = 0;
  let task2Count = 0;
  let overallScoreTotal = 0;

  recentTests.forEach(test => {
    overallScoreTotal += test.feedback.overallScore;
    const t1 = test.feedback.detailedScores.task1;
    if (t1) {
        scores.TaskFulfillment.total += t1.TaskAchievement.score;
        scores.TaskFulfillment.count++;
        scores.CoherenceAndCohesion.total += t1.CoherenceAndCohesion.score;
        scores.CoherenceAndCohesion.count++;
        scores.LexicalResource.total += t1.LexicalResource.score;
        scores.LexicalResource.count++;
        scores.GrammaticalRangeAndAccuracy.total += t1.GrammaticalRangeAndAccuracy.score;
        scores.GrammaticalRangeAndAccuracy.count++;
        task1ScoreTotal += (t1.TaskAchievement.score + t1.CoherenceAndCohesion.score + t1.LexicalResource.score + t1.GrammaticalRangeAndAccuracy.score) / 4;
        task1Count++;
    }

    const t2 = test.feedback.detailedScores.task2;
    if (t2) {
        scores.TaskFulfillment.total += t2.TaskResponse.score;
        scores.TaskFulfillment.count++;
        scores.CoherenceAndCohesion.total += t2.CoherenceAndCohesion.score;
        scores.CoherenceAndCohesion.count++;
        scores.LexicalResource.total += t2.LexicalResource.score;
        scores.LexicalResource.count++;
        scores.GrammaticalRangeAndAccuracy.total += t2.GrammaticalRangeAndAccuracy.score;
        scores.GrammaticalRangeAndAccuracy.count++;
        task2ScoreTotal += (t2.TaskResponse.score + t2.CoherenceAndCohesion.score + t2.LexicalResource.score + t2.GrammaticalRangeAndAccuracy.score) / 4;
        task2Count++;
    }
  });

  let weakestCriterion: DrillCriterion | null = null;
  let lowestAverage = Infinity;
  (Object.keys(scores) as DrillCriterion[]).forEach(key => {
    const { total, count } = scores[key];
    if (count > 0) {
      const average = total / count;
      if (average < lowestAverage) {
        lowestAverage = average;
        weakestCriterion = key;
      }
    }
  });

  if (!weakestCriterion) return null;

  const averageBandScore = overallScoreTotal / recentTests.length;

  // --- 2. Calculate Weaker Task ---
  const avgT1 = task1Count > 0 ? task1ScoreTotal / task1Count : 0;
  const avgT2 = task2Count > 0 ? task2ScoreTotal / task2Count : 0;
  let weakerTask: 'Task 1' | 'Task 2' | null = null;
  if (avgT1 > 0 && avgT2 > 0) {
      if (avgT1 < avgT2 - 0.2) weakerTask = 'Task 1';
      else if (avgT2 < avgT1 - 0.2) weakerTask = 'Task 2';
  }

  // --- 3. Identify Dominant Topics ---
  const genericTags = new Set([
    'line graph', 'table', 'process diagram', 'bar chart', 'pie charts', 'maps', 
    'discussion (both views)', 'problem & solution', 'agree or disagree', 
    'advantages & disadvantages', 'two-part question', 'positive or negative'
  ]);

  const originalTags = recentTests
      .map(ct => allTests.find(t => t.id === ct.testId))
      .filter((t): t is IeltsTest => !!t)
      .flatMap(t => t.tags || []);
  
  const topicTags = originalTags.filter(tag => !genericTags.has(tag.toLowerCase()));
  
  const freq: { [key: string]: number } = {};
  topicTags.forEach(tag => {
    freq[tag] = (freq[tag] || 0) + 1;
  });

  const dominantTopics = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);

  return {
    weakestCriterion,
    displayName: CRITERIA_DISPLAY_MAPPING[weakestCriterion],
    category: CRITERIA_CATEGORY_MAPPING[weakestCriterion],
    averageBandScore,
    weakerTask,
    dominantTopics
  };
};
