export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/utils";

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: { track?: string };
}) {
  const tracks = await prisma.track.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      topics: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            include: {
              exercises: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  const progress = await prisma.userProgress.findMany();
  const progressMap = new Map(progress.map((p) => [p.topicId, p]));

  const activeTrackSlug = searchParams.track || tracks[0]?.slug;

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-white mb-2">Lessons</h1>
      <p className="text-gray-400 mb-8">
        Browse lessons by track and topic.
      </p>

      {/* Track Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-700 pb-4">
        {tracks.map((track) => (
          <Link
            key={track.slug}
            href={`/lessons?track=${track.slug}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              track.slug === activeTrackSlug
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {track.title}
          </Link>
        ))}
      </div>

      {/* Topics and Lessons */}
      {tracks
        .filter((t) => t.slug === activeTrackSlug)
        .map((track) => (
          <div key={track.id} className="space-y-8">
            {track.topics.map((topic) => {
              const topicProgress = progressMap.get(topic.id);
              return (
                <div key={topic.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      {topic.title}
                    </h2>
                    {topicProgress && (
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {topicProgress.lessonsCompleted}/{topic.lessons.length} completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    {topic.description}
                  </p>

                  <div className="space-y-3">
                    {topic.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.id}`}
                        className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">
                              {lesson.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {lesson.exercises.length} exercise{lesson.exercises.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
                              lesson.difficulty
                            )}`}
                          >
                            {getDifficultyLabel(lesson.difficulty)}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {topic.lessons.length === 0 && (
                      <p className="text-gray-600 text-sm italic">
                        Lessons coming soon. Use the Chat Tutor to learn about this topic.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}
