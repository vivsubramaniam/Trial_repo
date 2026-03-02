import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateCapstoneStep } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; stepId: string } }
) {
  const { code } = await request.json();

  const step = await prisma.capstoneStep.findUnique({
    where: { id: params.stepId },
    include: {
      project: { select: { title: true } },
    },
  });

  if (!step) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  // Evaluate with AI
  const result = await evaluateCapstoneStep({
    stepDescription: step.description,
    skeletonCode: step.skeletonCode,
    userCode: code,
    projectTitle: step.project.title,
  });

  // Update step
  await prisma.capstoneStep.update({
    where: { id: params.stepId },
    data: {
      userCode: code,
      aiFeedback: result.feedback,
      isCompleted: result.isReady,
    },
  });

  return NextResponse.json(result);
}
