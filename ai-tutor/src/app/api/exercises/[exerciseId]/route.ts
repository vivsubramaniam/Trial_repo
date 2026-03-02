import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: params.exerciseId },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          topicId: true,
          topic: {
            select: { title: true, slug: true, trackId: true },
          },
        },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        include: {
          codeQuality: true,
        },
      },
    },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  return NextResponse.json(exercise);
}
