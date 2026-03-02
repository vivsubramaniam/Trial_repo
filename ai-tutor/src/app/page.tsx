export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";

async function getDashboardData() {
  const [tracks, progress, recentSubmissions, sessionState, skillRatings] =
    await Promise.all([
      prisma.track.findMany({
        orderBy: { orderIndex: "asc" },
        include: {
          topics: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
      }),
      prisma.userProgress.findMany(),
      prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          exercise: { select: { title: true } },
        },
      }),
      prisma.sessionState.findFirst({
        where: { key: "last_page" },
      }),
      prisma.skillRating.findMany({
        where: { rating: { gt: 0 } },
        orderBy: { rating: "desc" },
        take: 5,
      }),
    ]);

  return { tracks, progress, recentSubmissions, sessionState, skillRatings };
}

export default async function Dashboard() {
  let data;
  try {
    data = await getDashboardData();
  } catch {
    // Database not set up yet
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-4">
          SystemC Tutor
        </h1>
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6">
          <h2 className="text-yellow-400 font-semibold mb-2">Setup Required</h2>
          <p className="text-yellow-200/80 mb-4">
            The database hasn&apos;t been configured yet. To get started:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-yellow-200/70 text-sm">
            <li>Create a Neon PostgreSQL database at neon.tech</li>
            <li>Update DATABASE_URL in .env with your connection string</li>
            <li>Add your ANTHROPIC_API_KEY in .env</li>
            <li>Run: <code className="bg-yellow-900/50 px-2 py-0.5 rounded">npx prisma db push</code></li>
            <li>Run: <code className="bg-yellow-900/50 px-2 py-0.5 rounded">npx tsx prisma/seed.ts</code></li>
          </ol>
        </div>
      </div>
    );
  }

  const { tracks, progress, recentSubmissions, sessionState, skillRatings } =
    data;

  const progressMap = new Map(progress.map((p) => [p.topicId, p]));

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Master C++, SystemC, and TLM 2.0 with your AI tutor.
        </p>
      </div>

      {/* Continue Where You Left Off */}
      {sessionState && (
        <div className="mb-8">
          <Link
            href={JSON.parse(sessionState.value).path}
            className="block bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 hover:bg-blue-600/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-400 font-medium">Continue where you left off</p>
                <p className="text-blue-300/60 text-sm">
                  {JSON.parse(sessionState.value).title || "Resume learning"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Track Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tracks.map((track) => {
          const totalLessons = track.topics.reduce(
            (sum, t) => sum + t.lessons.length,
            0
          );
          const completedLessons = track.topics.reduce((sum, t) => {
            const p = progressMap.get(t.id);
            return sum + (p?.lessonsCompleted || 0);
          }, 0);
          const percentage =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;

          return (
            <div
              key={track.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-1">
                {track.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {track.description}
              </p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{completedLessons}/{totalLessons} lessons</span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/lessons?track=${track.slug}`}
                className="text-blue-400 text-sm hover:text-blue-300"
              >
                {percentage > 0 ? "Continue" : "Start"} &rarr;
              </Link>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No exercises completed yet. Start learning!
            </p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-300">
                      {sub.exercise.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Attempt #{sub.attemptNumber}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      sub.isCorrect ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {sub.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Skills */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Your Skills
          </h3>
          {skillRatings.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Complete exercises to build your skill profile.
            </p>
          ) : (
            <div className="space-y-3">
              {skillRatings.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{skill.skillName}</span>
                    <span className="text-gray-400">
                      {skill.rating.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{
                        width: `${(skill.rating / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/progress"
            className="text-blue-400 text-sm hover:text-blue-300 mt-4 block"
          >
            View full analytics &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/skill-tree"
          className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors"
        >
          <p className="text-sm text-gray-300">Skill Tree</p>
        </Link>
        <Link
          href="/chat"
          className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors"
        >
          <p className="text-sm text-gray-300">Ask Tutor</p>
        </Link>
        <Link
          href="/exercises"
          className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors"
        >
          <p className="text-sm text-gray-300">Practice</p>
        </Link>
        <Link
          href="/capstones"
          className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors"
        >
          <p className="text-sm text-gray-300">Capstones</p>
        </Link>
      </div>
    </div>
  );
}
