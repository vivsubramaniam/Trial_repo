import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateSubmission, generateOptimalSolution } from "@/lib/ai";
import { calculateNewDifficulty } from "@/lib/adaptive";
import { updateSkillRating } from "@/lib/analytics";
import { SKILL_DEFINITIONS } from "@/lib/curriculum";

export async function POST(
  request: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  const { code, timeSpentSec } = await request.json();

  // Get exercise details
  const exercise = await prisma.exercise.findUnique({
    where: { id: params.exerciseId },
    include: {
      lesson: {
        include: {
          topic: { select: { id: true, slug: true, title: true } },
        },
      },
    },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  // Count previous attempts
  const attemptCount = await prisma.submission.count({
    where: { exerciseId: params.exerciseId },
  });

  // Evaluate with Claude
  const evaluation = await evaluateSubmission({
    exerciseDescription: exercise.description,
    starterCode: exercise.starterCode,
    solutionCode: exercise.solutionCode,
    userCode: code,
    difficulty: exercise.difficulty,
  });

  // Save submission
  const submission = await prisma.submission.create({
    data: {
      code,
      aiFeedback: evaluation.feedback,
      score: evaluation.score,
      isCorrect: evaluation.isCorrect,
      attemptNumber: attemptCount + 1,
      timeSpentSec: timeSpentSec || null,
      exerciseId: params.exerciseId,
    },
  });

  // Save code quality scores
  await prisma.codeQualityScore.create({
    data: {
      submissionId: submission.id,
      correctness: evaluation.codeQuality.correctness,
      readability: evaluation.codeQuality.readability,
      efficiency: evaluation.codeQuality.efficiency,
      bestPractices: evaluation.codeQuality.bestPractices,
    },
  });

  // Update skill rating
  const topicSlug = exercise.lesson.topic.slug;
  const skillDef = SKILL_DEFINITIONS.find((s) => s.topicSlug === topicSlug);
  if (skillDef) {
    await updateSkillRating(
      skillDef.name,
      evaluation.score,
      exercise.lesson.topic.id
    );
  }

  // Update user progress
  const topicId = exercise.lesson.topic.id;
  const existingProgress = await prisma.userProgress.findUnique({
    where: { topicId },
  });

  if (existingProgress) {
    // Get recent submissions for adaptive difficulty
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        exercise: { lesson: { topicId } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const newDifficulty = calculateNewDifficulty(
      existingProgress,
      recentSubmissions
    );

    const totalAttempts =
      existingProgress.exercisesPassed + existingProgress.exercisesFailed;
    const newAvg =
      totalAttempts > 0
        ? (existingProgress.averageScore * totalAttempts + evaluation.score) /
          (totalAttempts + 1)
        : evaluation.score;

    await prisma.userProgress.update({
      where: { topicId },
      data: {
        currentDifficulty: newDifficulty,
        exercisesPassed: evaluation.isCorrect
          ? existingProgress.exercisesPassed + 1
          : existingProgress.exercisesPassed,
        exercisesFailed: !evaluation.isCorrect
          ? existingProgress.exercisesFailed + 1
          : existingProgress.exercisesFailed,
        averageScore: newAvg,
        lastActivityAt: new Date(),
      },
    });
  } else {
    await prisma.userProgress.create({
      data: {
        topicId,
        currentDifficulty: 1,
        exercisesPassed: evaluation.isCorrect ? 1 : 0,
        exercisesFailed: evaluation.isCorrect ? 0 : 1,
        averageScore: evaluation.score,
        lastActivityAt: new Date(),
      },
    });
  }

  // Generate optimal solution if the exercise was passed
  let optimalSolution = null;
  if (evaluation.isCorrect) {
    try {
      optimalSolution = await generateOptimalSolution({
        exerciseDescription: exercise.description,
        userCode: code,
        difficulty: exercise.difficulty,
      });
    } catch {
      // Non-critical, skip if fails
    }
  }

  return NextResponse.json({
    submission: {
      id: submission.id,
      score: evaluation.score,
      isCorrect: evaluation.isCorrect,
      feedback: evaluation.feedback,
      attemptNumber: attemptCount + 1,
      codeQuality: evaluation.codeQuality,
    },
    optimalSolution,
  });
}
