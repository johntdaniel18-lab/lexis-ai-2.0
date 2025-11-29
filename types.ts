
export interface TestTask {
  prompt: string;
  imageUrl?: string;
  keyInformation?: string;
}

export interface IeltsTest {
  id: number;
  title: string;
  tasks: [TestTask, TestTask];
  tags?: string[];
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
  chatHistoryTask1: ChatMessage[];
  chatHistoryTask2: ChatMessage[];
}

export interface CompletedDrill {
  id: string; // Unique ID for this attempt
  drillId: string; // ID of the StaticDrillModule
  drillTitle: string;
  completionDate: string; // ISO string
  score: number;
  totalQuestions: number;
  category: StaticDrillModule['category'];
  difficulty: StaticDrillModule['difficulty'];
}

export type PracticeMode = 'task1' | 'task2' | 'mock';

export enum TestPhase {
  TARGET_SCORE_SELECTION = 'TARGET_SCORE_SELECTION',
  PREPARATION = 'PREPARATION',
  OUTLINE_REVIEW = 'OUTLINE_REVIEW',
  TIME_SELECTION = 'TIME_SELECTION',
  WRITING = 'WRITING',
  FEEDBACK = 'FEEDBACK',
}

export type DrillCriterion = 'TaskFulfillment' | 'CoherenceAndCohesion' | 'LexicalResource' | 'GrammaticalRangeAndAccuracy';

// --- LEGACY DRILL TYPES (For AI Drills if needed later) ---
export type DrillType = 
  'VOCABULARY_REPLACEMENT' | 
  'SENTENCE_COMBINING' | 
  'GRAMMAR_ERROR_CORRECTION' | 
  'SUPPORTING_IDEA' |
  'CONNECTOR_CHOICE' |
  'SENTENCE_TRANSFORMATION' |
  'VERB_CONJUGATION' |
  'PUNCTUATION_CHOICE' |
  'SENTENCE_REWRITE_ERROR';

export interface DrillContent {
  type: DrillType;
  title: string;
  instructions: string;
  taskContent: string;
  modelAnswer?: string;
  choices?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

// --- NEW HIERARCHICAL DRILL TYPES ---

export type DrillGroupType = 'MCQ' | 'NOTES_COMPLETION' | 'MATCHING';

export interface DrillQuestion {
  id: string;
  text?: string; // For MCQ prompt, or Matching "Left side" term
  options?: string[]; // Local options for independent MCQs (rare if using groups, but supported)
  correctAnswer: string | string[]; // Index (MCQ/Matching) or accepted strings (Notes)
  explanation?: string;
}

export interface DrillGroup {
  id: string;
  type: DrillGroupType;
  title: string; // e.g., "Questions 1-5"
  instruction?: string; // e.g., "Choose the correct letter A, B or C."
  
  // For NOTES_COMPLETION: The text with {{questionId}} placeholders
  content?: string; 
  
  // For MATCHING: The shared list of answers (The "Box" options)
  sharedOptions?: string[];
  
  questions: DrillQuestion[];
}

export interface StaticDrillModule {
  id: string;
  title: string;
  description: string;
  category: 'Grammar' | 'Vocabulary' | 'Coherence' | 'Task Response';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  lessonContent: string; // Markdown
  groups: DrillGroup[];
}