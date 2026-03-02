import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  const where = lessonId ? { lessonId } : {};

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { difficulty: "asc" },
    include: {
      lesson: {
        select: {
          title: true,
          topic: { select: { title: true, slug: true } },
        },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { score: true, isCorrect: true },
      },
    },
  });

  return NextResponse.json(exercises);
}
