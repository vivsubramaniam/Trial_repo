export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import BookmarkButton from "@/components/BookmarkButton";
import MarkCompleteButton from "@/components/MarkCompleteButton";
import GenerateExerciseButton from "@/components/GenerateExerciseButton";

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      topic: {
        include: {
          track: true,
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, orderIndex: true },
          },
        },
      },
      exercises: {
        orderBy: { difficulty: "asc" },
      },
    },
  });

  if (!lesson) return notFound();

  // Find prev/next lessons
  const lessonList = lesson.topic.lessons;
  const currentIndex = lessonList.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? lessonList[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessonList.length - 1 ? lessonList[currentIndex + 1] : null;

  // Update session state
  await prisma.sessionState.upsert({
    where: { key: "last_page" },
    update: {
      value: JSON.stringify({
        id: lesson.id,
        title: lesson.title,
        path: `/lessons/${lesson.id}`,
        timestamp: new Date().toISOString(),
      }),
    },
    create: {
      key: "last_page",
      value: JSON.stringify({
        id: lesson.id,
        title: lesson.title,
        path: `/lessons/${lesson.id}`,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/lessons" className="hover:text-white">
          Lessons
        </Link>
        <span>/</span>
        <Link
          href={`/lessons?track=${lesson.topic.track.slug}`}
          className="hover:text-white"
        >
          {lesson.topic.track.title}
        </Link>
        <span>/</span>
        <span className="text-gray-300">{lesson.topic.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
                lesson.difficulty
              )}`}
            >
              {getDifficultyLabel(lesson.difficulty)}
            </span>
            <span className="text-sm text-gray-500">
              {lesson.exercises.length} exercise{lesson.exercises.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookmarkButton type="lesson" referenceId={lesson.id} />
          <MarkCompleteButton lessonId={lesson.id} topicId={lesson.topicId} />
        </div>
      </div>

      {/* Lesson Content */}
      <div className="mb-12">
        <MarkdownRenderer content={lesson.content} />
      </div>

      {/* Exercises */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Exercises</h2>
          <GenerateExerciseButton lessonId={lesson.id} />
        </div>

        {lesson.exercises.length > 0 ? (
          <div className="space-y-4">
            {lesson.exercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className="block bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{exercise.title}</h3>
                      {exercise.aiGenerated && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1 capitalize">
                      {exercise.exerciseType.replace("-", " ")} exercise
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
                      exercise.difficulty
                    )}`}
                  >
                    Level {exercise.difficulty}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm mb-3">No exercises yet for this lesson.</p>
            <p className="text-gray-600 text-xs">Click &quot;Generate another exercise&quot; above to create one with AI.</p>
          </div>
        )}
      </div>

      {/* Prev / Next Navigation */}
      <div className="flex justify-between items-center border-t border-gray-700 pt-6">
        {prevLesson ? (
          <Link
            href={`/lessons/${prevLesson.id}`}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            &larr; {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {nextLesson.title} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
