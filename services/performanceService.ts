import { CompletedTest, DrillCriterion } from '../types';

const CRITERIA_DISPLAY_MAPPING: { [key in DrillCriterion]: string } = {
  TaskFulfillment: 'Task Achievement / Response',
  CoherenceAndCohesion: 'Coherence and Cohesion',
  LexicalResource: 'Lexical Resource',
  GrammaticalRangeAndAccuracy: 'Grammar & Accuracy',
};

/**
 * Analyzes a user's completed test history to identify their weakest area.
 * @param completedTests An array of the user's completed tests.
 * @returns An object containing the internal key and display name of the weakest criterion, or null if analysis is not possible.
 */
export const analyzePerformanceTrends = (completedTests: CompletedTest[]): { weakestCriterion: DrillCriterion; displayName: string } | null => {
  if (!completedTests || completedTests.length < 3) {
    return null; // Not enough data for a meaningful analysis.
  }

  const scores: { [key in DrillCriterion]: { total: number; count: number } } = {
    TaskFulfillment: { total: 0, count: 0 },
    CoherenceAndCohesion: { total: 0, count: 0 },
    LexicalResource: { total: 0, count: 0 },
    GrammaticalRangeAndAccuracy: { total: 0, count: 0 },
  };

  completedTests.forEach(test => {
    // Task 1 scores
    const t1 = test.feedback.detailedScores.task1;
    scores.TaskFulfillment.total += t1.TaskAchievement.score;
    scores.CoherenceAndCohesion.total += t1.CoherenceAndCohesion.score;
    scores.LexicalResource.total += t1.LexicalResource.score;
    scores.GrammaticalRangeAndAccuracy.total += t1.GrammaticalRangeAndAccuracy.score;
    
    // Increment counts for Task 1
    scores.TaskFulfillment.count++;
    scores.CoherenceAndCohesion.count++;
    scores.LexicalResource.count++;
    scores.GrammaticalRangeAndAccuracy.count++;

    // Task 2 scores
    const t2 = test.feedback.detailedScores.task2;
    scores.TaskFulfillment.total += t2.TaskResponse.score;
    scores.CoherenceAndCohesion.total += t2.CoherenceAndCohesion.score;
    scores.LexicalResource.total += t2.LexicalResource.score;
    scores.GrammaticalRangeAndAccuracy.total += t2.GrammaticalRangeAndAccuracy.score;

    // Increment counts for Task 2
    scores.TaskFulfillment.count++;
    scores.CoherenceAndCohesion.count++;
    scores.LexicalResource.count++;
    scores.GrammaticalRangeAndAccuracy.count++;
  });

  let weakestCriterion: DrillCriterion | null = null;
  let lowestAverage = Infinity;

  // Calculate averages and find the lowest
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

  if (weakestCriterion) {
    return {
      weakestCriterion,
      displayName: CRITERIA_DISPLAY_MAPPING[weakestCriterion],
    };
  }

  return null;
};
