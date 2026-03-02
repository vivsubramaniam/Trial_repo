import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateExercise } from "@/lib/ai";

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 503 }
    );
  }

  const { lessonId } = await request.json();

  // Get lesson + topic context
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      topic: { select: { title: true, description: true, slug: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Get current difficulty for this topic
  const progress = await prisma.userProgress.findUnique({
    where: { topicId: lesson.topicId },
  });
  const difficulty = progress?.currentDifficulty ?? 1;

  // Count existing exercises to vary the type
  const existingCount = await prisma.exercise.count({
    where: { lessonId },
  });
  // Rotate types: write -> debug -> fill-blank -> write...
  const typeRotation = ["write", "debug", "fill-blank"];
  const exerciseType = typeRotation[existingCount % 3];

  // Generate with Claude
  const generated = await generateExercise({
    topicTitle: lesson.topic.title,
    topicDescription: lesson.topic.description,
    lessonTitle: lesson.title,
    difficulty,
    exerciseType,
  });

  if (!generated) {
    return NextResponse.json(
      { error: "Failed to generate exercise. Try again." },
      { status: 500 }
    );
  }

  // Save to database
  const exercise = await prisma.exercise.create({
    data: {
      title: generated.title,
      description: generated.description,
      exerciseType: generated.exerciseType || exerciseType,
      starterCode: generated.starterCode,
      solutionCode: generated.solutionCode || null,
      difficulty,
      hints: JSON.stringify(generated.hints || []),
      lessonId,
      aiGenerated: true,
    },
  });

  return NextResponse.json(exercise);
}
