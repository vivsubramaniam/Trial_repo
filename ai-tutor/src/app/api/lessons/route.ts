import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get("topicId");

  const where = topicId ? { topicId } : {};

  const lessons = await prisma.lesson.findMany({
    where,
    orderBy: { orderIndex: "asc" },
    include: {
      topic: { select: { title: true, slug: true } },
      exercises: { select: { id: true, title: true, difficulty: true } },
    },
  });

  return NextResponse.json(lessons);
}
