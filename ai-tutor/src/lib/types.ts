// ─── Exercise Types ───────────────────────────────────────────────
export type ExerciseType = "fill-blank" | "write" | "debug";

// ─── Bookmark Types ───────────────────────────────────────────────
export type BookmarkType = "lesson" | "exercise" | "chat_message";

// ─── Capstone Sizes ───────────────────────────────────────────────
export type CapstoneSize = "mini" | "medium" | "full";

// ─── AI Evaluation Response ───────────────────────────────────────
export interface EvaluationResult {
  score: number;
  isCorrect: boolean;
  feedback: string;
  codeQuality: {
    correctness: number;
    readability: number;
    efficiency: number;
    bestPractices: number;
  };
}

// ─── Optimal Solution Response ────────────────────────────────────
export interface OptimalSolution {
  code: string;
  explanation: string;
  improvements: string[];
}

// ─── Skill Rating for Radar Chart ─────────────────────────────────
export interface SkillRatingData {
  skillName: string;
  rating: number;
  maxRating: number;
}

// ─── Progress Summary ─────────────────────────────────────────────
export interface TrackProgress {
  trackId: string;
  trackTitle: string;
  totalTopics: number;
  completedTopics: number;
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  passedExercises: number;
  averageScore: number;
  currentDifficulty: number;
}

// ─── Curriculum Tree ──────────────────────────────────────────────
export interface CurriculumTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  topics: CurriculumTopic[];
}

export interface CurriculumTopic {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  trackId: string;
  status: "locked" | "available" | "in-progress" | "completed";
  dependencies: string[]; // topic IDs
  lessonCount: number;
  exerciseCount: number;
}

// ─── Chat ─────────────────────────────────────────────────────────
export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// ─── Session State Keys ───────────────────────────────────────────
export type SessionStateKey =
  | "last_lesson"
  | "last_exercise"
  | "last_chat"
  | "last_page";

export interface SessionStateValue {
  id: string;
  title?: string;
  path: string;
  timestamp: string;
}
