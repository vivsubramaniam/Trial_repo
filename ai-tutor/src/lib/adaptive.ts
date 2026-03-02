// Adaptive difficulty and recommendation algorithm

interface SubmissionData {
  score: number;
  isCorrect: boolean;
  createdAt: Date;
}

interface ProgressData {
  currentDifficulty: number;
  averageScore: number;
  exercisesPassed: number;
  exercisesFailed: number;
  lastActivityAt: Date | null;
}

// ─── Difficulty Adjustment ────────────────────────────────────────

export function calculateNewDifficulty(
  progress: ProgressData,
  recentSubmissions: SubmissionData[]
): number {
  const current = progress.currentDifficulty;

  // Need at least 3 submissions to make a decision
  const recent = recentSubmissions.slice(0, 5);
  if (recent.length < 3) return current;

  const avgScore =
    recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
  const passRate =
    recent.filter((s) => s.isCorrect).length / recent.length;

  // Increase difficulty if consistently doing well
  if (avgScore >= 85 && passRate >= 0.8 && current < 5) {
    return current + 1;
  }

  // Decrease difficulty if struggling
  if (avgScore < 50 && passRate < 0.3 && current > 1) {
    return current - 1;
  }

  return current;
}

// ─── Topic Recommendations ────────────────────────────────────────

interface TopicRecommendation {
  topicId: string;
  topicTitle: string;
  reason: string;
  priority: "review" | "continue" | "next";
}

export function getTopicRecommendations(
  allProgress: Array<{
    topicId: string;
    topicTitle: string;
    averageScore: number;
    exercisesPassed: number;
    exercisesFailed: number;
    lessonsCompleted: number;
    totalLessons: number;
    lastActivityAt: Date | null;
  }>
): TopicRecommendation[] {
  const recommendations: TopicRecommendation[] = [];

  for (const p of allProgress) {
    // Suggest review for topics with declining scores
    if (p.averageScore > 0 && p.averageScore < 60 && p.exercisesFailed > 2) {
      recommendations.push({
        topicId: p.topicId,
        topicTitle: p.topicTitle,
        reason: `Your average score is ${Math.round(p.averageScore)}%. Review this topic to strengthen your understanding.`,
        priority: "review",
      });
    }
    // Suggest continuing incomplete topics
    else if (
      p.lessonsCompleted > 0 &&
      p.lessonsCompleted < p.totalLessons
    ) {
      recommendations.push({
        topicId: p.topicId,
        topicTitle: p.topicTitle,
        reason: `${p.lessonsCompleted}/${p.totalLessons} lessons completed. Keep going!`,
        priority: "continue",
      });
    }
  }

  // Sort: review first, then continue, then next
  const priorityOrder = { review: 0, continue: 1, next: 2 };
  recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return recommendations.slice(0, 5);
}

// ─── Spaced Review Detection ──────────────────────────────────────

export function shouldReviewTopic(
  progress: ProgressData,
  daysSinceLastActivity: number
): boolean {
  // If the topic was completed with a good score, only review after extended inactivity
  if (progress.averageScore >= 80 && daysSinceLastActivity > 14) {
    return true;
  }

  // If the topic had mediocre scores, review sooner
  if (
    progress.averageScore >= 50 &&
    progress.averageScore < 80 &&
    daysSinceLastActivity > 7
  ) {
    return true;
  }

  // If the topic had poor scores, always suggest review
  if (progress.averageScore < 50 && progress.averageScore > 0) {
    return true;
  }

  return false;
}

// ─── Learning Velocity ────────────────────────────────────────────

export function calculateLearningVelocity(
  submissions: Array<{ score: number; createdAt: Date }>
): {
  exercisesPerDay: number;
  averageScoreTrend: "improving" | "stable" | "declining";
  estimatedSessionsToMastery: number | null;
} {
  if (submissions.length < 2) {
    return {
      exercisesPerDay: 0,
      averageScoreTrend: "stable",
      estimatedSessionsToMastery: null,
    };
  }

  // Calculate exercises per day
  const sorted = [...submissions].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const firstDate = sorted[0].createdAt.getTime();
  const lastDate = sorted[sorted.length - 1].createdAt.getTime();
  const daySpan = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
  const exercisesPerDay = submissions.length / daySpan;

  // Calculate score trend (compare first half vs second half)
  const mid = Math.floor(sorted.length / 2);
  const firstHalfAvg =
    sorted.slice(0, mid).reduce((s, x) => s + x.score, 0) / mid;
  const secondHalfAvg =
    sorted.slice(mid).reduce((s, x) => s + x.score, 0) /
    (sorted.length - mid);

  let averageScoreTrend: "improving" | "stable" | "declining";
  if (secondHalfAvg - firstHalfAvg > 10) {
    averageScoreTrend = "improving";
  } else if (firstHalfAvg - secondHalfAvg > 10) {
    averageScoreTrend = "declining";
  } else {
    averageScoreTrend = "stable";
  }

  // Rough estimate: assume ~100 exercises total, estimate based on current pace
  const totalExercisesEstimate = 100;
  const remaining = totalExercisesEstimate - submissions.length;
  const estimatedSessionsToMastery =
    exercisesPerDay > 0
      ? Math.ceil(remaining / (exercisesPerDay * 0.5)) // assume 30min sessions
      : null;

  return {
    exercisesPerDay: Math.round(exercisesPerDay * 10) / 10,
    averageScoreTrend,
    estimatedSessionsToMastery,
  };
}
