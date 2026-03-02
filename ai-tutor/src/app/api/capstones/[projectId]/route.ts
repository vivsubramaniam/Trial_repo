import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const project = await prisma.capstoneProject.findUnique({
    where: { id: params.projectId },
    include: {
      steps: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
