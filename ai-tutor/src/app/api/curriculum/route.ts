export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tracks = await prisma.track.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      topics: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, difficulty: true, orderIndex: true },
          },
          dependsOn: {
            include: {
              prerequisiteTopic: {
                select: { id: true, slug: true, title: true },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(tracks);
}
