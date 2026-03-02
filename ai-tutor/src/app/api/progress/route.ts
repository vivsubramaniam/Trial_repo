export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSkillRatings, getCodeQualityTrends, getTrackProgress } from "@/lib/analytics";
import { calculateLearningVelocity } from "@/lib/adaptive";

export async function GET() {
  const [trackProgress, skillRatings, codeQualityTrends, allSubmissions] =
    await Promise.all([
      getTrackProgress(),
      getSkillRatings(),
      getCodeQualityTrends(30),
      prisma.submission.findMany({
        orderBy: { createdAt: "asc" },
        select: { score: true, createdAt: true },
      }),
    ]);

  const learningVelocity = calculateLearningVelocity(allSubmissions);

  return NextResponse.json({
    trackProgress,
    skillRatings,
    codeQualityTrends,
    learningVelocity,
    totalSubmissions: allSubmissions.length,
  });
}
