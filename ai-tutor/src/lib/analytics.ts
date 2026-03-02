// Analytics computation for skill ratings and code quality tracking

import { prisma } from "./db";

// ─── Update Skill Rating After Submission ─────────────────────────

export async function updateSkillRating(
  skillName: string,
  newScore: number,
  topicId?: string
) {
  const existing = await prisma.skillRating.findUnique({
    where: { skillName },
  });

  if (existing) {
    // Exponential moving average: new_rating = 0.7 * old + 0.3 * new_score_normalized
    const normalizedScore = (newScore / 100) * 5; // Convert 0-100 to 0-5
    const newRating = existing.rating * 0.7 + normalizedScore * 0.3;

    await prisma.skillRating.update({
      where: { skillName },
      data: { rating: Math.round(newRating * 10) / 10 },
    });
  } else {
    const normalizedScore = (newScore / 100) * 5;
    await prisma.skillRating.create({
      data: {
        skillName,
        rating: normalizedScore,
        topicId: topicId || null,
      },
    });
  }
}

// ─── Get All Skill Ratings for Radar Chart ────────────────────────

export async function getSkillRatings() {
  return prisma.skillRating.findMany({
    orderBy: { skillName: "asc" },
  });
}

// ─── Get Code Quality Trends ──────────────────────────────────────

export async function getCodeQualityTrends(limit = 20) {
  const scores = await prisma.codeQualityScore.findMany({
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      submission: {
        select: { createdAt: true, exerciseId: true },
      },
    },
  });

  return scores.map((s) => ({
    date: s.submission.createdAt.toISOString(),
    correctness: s.correctness,
    readability: s.readability,
    efficiency: s.efficiency,
    bestPractices: s.bestPractices,
  }));
}

// ─── Get Track Progress Summary ───────────────────────────────────

export async function getTrackProgress() {
  const tracks = await prisma.track.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      topics: {
        include: {
          lessons: {
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  });

  const allProgress = await prisma.userProgress.findMany();
  const allSubmissions = await prisma.submission.findMany({
    where: { isCorrect: true },
    select: { exerciseId: true },
  });

  const passedExerciseIds = new Set(allSubmissions.map((s) => s.exerciseId));

  return tracks.map((track) => {
    const topicIds = track.topics.map((t) => t.id);
    const topicProgress = allProgress.filter((p) =>
      topicIds.includes(p.topicId)
    );

    const totalLessons = track.topics.reduce(
      (sum, t) => sum + t.lessons.length,
      0
    );
    const completedLessons = topicProgress.reduce(
      (sum, p) => sum + p.lessonsCompleted,
      0
    );

    const allExercises = track.topics.flatMap((t) =>
      t.lessons.flatMap((l) => l.exercises)
    );
    const passedExercises = allExercises.filter((e) =>
      passedExerciseIds.has(e.id)
    );

    const avgScore =
      topicProgress.length > 0
        ? topicProgress.reduce((sum, p) => sum + p.averageScore, 0) /
          topicProgress.length
        : 0;

    return {
      trackId: track.id,
      trackTitle: track.title,
      trackSlug: track.slug,
      totalTopics: track.topics.length,
      completedTopics: topicProgress.filter(
        (p) => p.lessonsCompleted >= track.topics.find((t) => t.id === p.topicId)!.lessons.length
      ).length,
      totalLessons,
      completedLessons,
      totalExercises: allExercises.length,
      passedExercises: passedExercises.length,
      averageScore: Math.round(avgScore),
    };
  });
}
