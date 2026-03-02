import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const referenceId = searchParams.get("referenceId");

  // Check if a specific item is bookmarked
  if (type && referenceId) {
    const bookmark = await prisma.bookmark.findFirst({
      where: { type, referenceId },
    });
    return NextResponse.json({ isBookmarked: !!bookmark });
  }

  // List all bookmarks
  const where = type ? { type } : {};
  const bookmarks = await prisma.bookmark.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(request: NextRequest) {
  const { type, referenceId, note } = await request.json();

  const bookmark = await prisma.bookmark.create({
    data: { type, referenceId, note },
  });

  return NextResponse.json(bookmark);
}

export async function DELETE(request: NextRequest) {
  const { type, referenceId } = await request.json();

  await prisma.bookmark.deleteMany({
    where: { type, referenceId },
  });

  return NextResponse.json({ success: true });
}
