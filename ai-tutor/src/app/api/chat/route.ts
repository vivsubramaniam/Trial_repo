import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { streamChat } from "@/lib/ai";

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add it to your .env file to enable AI features." },
      { status: 503 }
    );
  }

  const { sessionId, message, topicId } = await request.json();

  // Get or create session
  let session;
  if (sessionId) {
    session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  if (!session) {
    session = await prisma.chatSession.create({
      data: {
        topicId: topicId || null,
        title: message.slice(0, 100),
      },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.chatMessage.create({
    data: {
      role: "user",
      content: message,
      sessionId: session.id,
    },
  });

  // Get topic context
  let topicTitle: string | undefined;
  let difficulty: number | undefined;
  const effectiveTopicId = topicId || session.topicId;

  if (effectiveTopicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: effectiveTopicId },
      select: { title: true },
    });
    topicTitle = topic?.title;

    const progress = await prisma.userProgress.findUnique({
      where: { topicId: effectiveTopicId },
    });
    difficulty = progress?.currentDifficulty;
  }

  // Build message history
  const messages = [
    ...session.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  // Stream response
  const stream = streamChat({
    messages,
    topicTitle,
    difficulty,
  });

  let fullResponse = "";

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = await stream;

        messageStream.on("text", (text: string) => {
          fullResponse += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text, sessionId: session!.id })}\n\n`)
          );
        });

        messageStream.on("end", async () => {
          // Save assistant message
          await prisma.chatMessage.create({
            data: {
              role: "assistant",
              content: fullResponse,
              sessionId: session!.id,
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, sessionId: session!.id })}\n\n`
            )
          );
          controller.close();
        });

        messageStream.on("error", (error: Error) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message })}\n\n`
            )
          );
          controller.close();
        });
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Failed to start stream" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// GET: List chat sessions
export async function GET() {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { content: true },
      },
    },
  });

  return Response.json(sessions);
}
