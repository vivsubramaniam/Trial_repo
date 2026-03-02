export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function SkillTreePage() {
  const tracks = await prisma.track.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      topics: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { select: { id: true } },
          dependsOn: {
            include: {
              prerequisiteTopic: {
                select: { id: true, title: true, slug: true },
              },
            },
          },
        },
      },
    },
  });

  const progress = await prisma.userProgress.findMany();
  const progressMap = new Map(progress.map((p) => [p.topicId, p]));

  // Determine topic statuses
  const completedTopics = new Set<string>();
  progress.forEach((p) => {
    for (const track of tracks) {
      const topic = track.topics.find((t) => t.id === p.topicId);
      if (topic && p.lessonsCompleted >= topic.lessons.length && topic.lessons.length > 0) {
        completedTopics.add(p.topicId);
      }
    }
  });

  function getTopicStatus(topic: {
    id: string;
    lessons: { id: string }[];
    dependsOn: Array<{
      prerequisiteTopic: { id: string };
    }>;
  }): "completed" | "in-progress" | "available" | "locked" {
    if (completedTopics.has(topic.id)) return "completed";
    if (progressMap.has(topic.id)) return "in-progress";

    // Check if all prerequisites are completed
    const allPrereqsMet = topic.dependsOn.every((dep) =>
      completedTopics.has(dep.prerequisiteTopic.id)
    );

    // If no prerequisites, it's available
    if (topic.dependsOn.length === 0) return "available";
    return allPrereqsMet ? "available" : "locked";
  }

  const statusColors = {
    completed: "border-green-500 bg-green-500/10 text-green-400",
    "in-progress": "border-yellow-500 bg-yellow-500/10 text-yellow-400",
    available: "border-blue-500 bg-blue-500/10 text-blue-400",
    locked: "border-gray-600 bg-gray-800/30 text-gray-500",
  };

  const statusIcons = {
    completed: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    "in-progress": (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    available: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    locked: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">Skill Tree</h1>
      <p className="text-gray-400 mb-8">
        Your learning path from C++ to TLM 2.0. Topics unlock as you complete
        prerequisites.
      </p>

      {/* Legend */}
      <div className="flex gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2 text-green-400">
          {statusIcons.completed} Completed
        </div>
        <div className="flex items-center gap-2 text-yellow-400">
          {statusIcons["in-progress"]} In Progress
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          {statusIcons.available} Available
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          {statusIcons.locked} Locked
        </div>
      </div>

      {/* Track Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tracks.map((track) => (
          <div key={track.id}>
            <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">
              {track.title}
            </h2>
            <div className="space-y-3">
              {track.topics.map((topic) => {
                const status = getTopicStatus(topic);
                const isClickable = status !== "locked";

                const content = (
                  <div
                    className={`rounded-lg border p-4 transition-colors ${
                      statusColors[status]
                    } ${isClickable ? "cursor-pointer hover:opacity-80" : "opacity-60"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcons[status]}
                      <h3 className="font-medium text-sm">{topic.title}</h3>
                    </div>
                    <p className="text-xs opacity-70 line-clamp-2">
                      {topic.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
                      <span>{topic.lessons.length} lessons</span>
                      {topic.dependsOn.length > 0 && (
                        <span>
                          &middot; Requires:{" "}
                          {topic.dependsOn
                            .map((d) => d.prerequisiteTopic.title)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                );

                if (isClickable) {
                  return (
                    <Link
                      key={topic.id}
                      href={`/lessons?track=${track.slug}`}
                    >
                      {content}
                    </Link>
                  );
                }
                return <div key={topic.id}>{content}</div>;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cross-track Dependencies Note */}
      <div className="mt-10 bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Cross-Track Dependencies
        </h3>
        <p className="text-xs text-gray-500">
          SystemC topics require certain C++ prerequisites. TLM 2.0 topics
          require SystemC knowledge. The skill tree enforces these dependencies
          to ensure you have the foundation needed for each topic.
        </p>
      </div>
    </div>
  );
}
