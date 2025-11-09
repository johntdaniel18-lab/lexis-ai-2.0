export interface TestTask {
  prompt: string;
  imageUrl?: string;
}

export interface IeltsTest {
  id: number;
  title: string;
  tasks: [TestTask, TestTask];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
}

export interface Improvement {
  id: string;
  taskNumber: 1 | 2;
  originalText: string;
  improvedText: string;
  explanation: string;
  criterion: 'TaskAchievement' | 'TaskResponse' | 'CoherenceAndCohesion' | 'LexicalResource' | 'GrammaticalRangeAndAccuracy';
  source: 'AI' | 'Teacher';
}

export interface AreaForImprovement {
    title: string;
    feedback: string;
}

export interface CriterionScore {
  score: number;
  feedback: string;
}

export interface Task1BandScores {
  TaskAchievement: CriterionScore;
  CoherenceAndCohesion: CriterionScore;
  LexicalResource: CriterionScore;
  GrammaticalRangeAndAccuracy: CriterionScore;
}

export interface Task2BandScores {
  TaskResponse: CriterionScore;
  CoherenceAndCohesion: CriterionScore;
  LexicalResource: CriterionScore;
  GrammaticalRangeAndAccuracy: CriterionScore;
}


export interface EssayFeedback {
  overallScore: number;
  overallFeedback: string;
  improvements: Improvement[]; // For text-level highlights
  strengths: string[]; // For strength cards
  areasForImprovement: AreaForImprovement[]; // For improvement cards
  detailedScores: {
    task1: Task1BandScores;
    task2: Task2BandScores;
  };
}

export interface CompletedTest {
  id: string; // Unique ID for this attempt, e.g., timestamp
  testId: number;
  testTitle: string;
  completionDate: string;
  targetScore: number;
  essay1: string;
  essay2: string;
  feedback: EssayFeedback;
  vocabulary: VocabularyItem[];
}


export enum TestPhase {
  TARGET_SCORE_SELECTION = 'TARGET_SCORE_SELECTION',
  PREPARATION = 'PREPARATION',
  OUTLINE_REVIEW = 'OUTLINE_REVIEW',
  TIME_SELECTION = 'TIME_SELECTION',
  WRITING = 'WRITING',
  FEEDBACK = 'FEEDBACK',
}