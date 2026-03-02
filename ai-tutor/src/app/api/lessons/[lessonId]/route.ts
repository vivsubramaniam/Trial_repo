import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      topic: true,
      exercises: { orderBy: { difficulty: "asc" } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (body.action === "complete") {
    // Update user progress for this topic
    const existing = await prisma.userProgress.findUnique({
      where: { topicId: body.topicId },
    });

    if (existing) {
      await prisma.userProgress.update({
        where: { topicId: body.topicId },
        data: {
          lessonsCompleted: existing.lessonsCompleted + 1,
          lastActivityAt: new Date(),
        },
      });
    } else {
      await prisma.userProgress.create({
        data: {
          topicId: body.topicId,
          lessonsCompleted: 1,
          lastActivityAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
