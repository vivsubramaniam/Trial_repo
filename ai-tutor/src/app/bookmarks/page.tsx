export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function BookmarksPage() {
  const bookmarks = await prisma.bookmark.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Resolve bookmark references
  const resolvedBookmarks = await Promise.all(
    bookmarks.map(async (bookmark) => {
      let title = "Unknown";
      let href = "#";

      if (bookmark.type === "lesson") {
        const lesson = await prisma.lesson.findUnique({
          where: { id: bookmark.referenceId },
          select: { title: true },
        });
        title = lesson?.title || "Deleted lesson";
        href = `/lessons/${bookmark.referenceId}`;
      } else if (bookmark.type === "exercise") {
        const exercise = await prisma.exercise.findUnique({
          where: { id: bookmark.referenceId },
          select: { title: true },
        });
        title = exercise?.title || "Deleted exercise";
        href = `/exercises/${bookmark.referenceId}`;
      } else if (bookmark.type === "chat_message") {
        title = "Chat message";
        href = "/chat";
      }

      return { ...bookmark, title, href };
    })
  );

  const lessonBookmarks = resolvedBookmarks.filter((b) => b.type === "lesson");
  const exerciseBookmarks = resolvedBookmarks.filter(
    (b) => b.type === "exercise"
  );
  const chatBookmarks = resolvedBookmarks.filter(
    (b) => b.type === "chat_message"
  );

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Bookmarks</h1>
      <p className="text-gray-400 mb-8">
        Your saved lessons, exercises, and chat messages.
      </p>

      {resolvedBookmarks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-2">No bookmarks yet.</p>
          <p className="text-sm text-gray-600">
            Click the bookmark icon on any lesson, exercise, or chat message to
            save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {lessonBookmarks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Lessons ({lessonBookmarks.length})
              </h2>
              <div className="space-y-2">
                {lessonBookmarks.map((b) => (
                  <Link
                    key={b.id}
                    href={b.href}
                    className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                  >
                    <p className="text-white">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Saved {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {exerciseBookmarks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Exercises ({exerciseBookmarks.length})
              </h2>
              <div className="space-y-2">
                {exerciseBookmarks.map((b) => (
                  <Link
                    key={b.id}
                    href={b.href}
                    className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                  >
                    <p className="text-white">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Saved {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {chatBookmarks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Chat Messages ({chatBookmarks.length})
              </h2>
              <div className="space-y-2">
                {chatBookmarks.map((b) => (
                  <Link
                    key={b.id}
                    href={b.href}
                    className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                  >
                    <p className="text-white">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Saved {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
