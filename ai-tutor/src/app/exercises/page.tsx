export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDifficultyColor, getDifficultyLabel } from "@/lib/utils";

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { difficulty: "asc" },
    include: {
      lesson: {
        select: {
          title: true,
          topic: {
            select: {
              title: true,
              track: { select: { title: true, slug: true } },
            },
          },
        },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { score: true, isCorrect: true },
      },
    },
  });

  // Group by track
  const byTrack = exercises.reduce(
    (acc, ex) => {
      const trackTitle = ex.lesson.topic.track.title;
      if (!acc[trackTitle]) acc[trackTitle] = [];
      acc[trackTitle].push(ex);
      return acc;
    },
    {} as Record<string, typeof exercises>
  );

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-white mb-2">Exercises</h1>
      <p className="text-gray-400 mb-8">
        Practice with coding exercises at various difficulty levels.
      </p>

      {Object.entries(byTrack).map(([trackTitle, trackExercises]) => (
        <div key={trackTitle} className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            {trackTitle}
          </h2>
          <div className="space-y-3">
            {trackExercises.map((exercise) => {
              const lastSub = exercise.submissions[0];
              return (
                <Link
                  key={exercise.id}
                  href={`/exercises/${exercise.id}`}
                  className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">
                        {exercise.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {exercise.lesson.topic.title} &middot;{" "}
                        {exercise.lesson.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastSub && (
                        <span
                          className={`text-sm font-medium ${
                            lastSub.isCorrect
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {lastSub.score}%
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
                          exercise.difficulty
                        )}`}
                      >
                        {getDifficultyLabel(exercise.difficulty)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {exercises.length === 0 && (
        <p className="text-gray-500">
          No exercises available yet. Start with the lessons first.
        </p>
      )}
    </div>
  );
}
