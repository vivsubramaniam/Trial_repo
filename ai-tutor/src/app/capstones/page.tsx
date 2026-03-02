export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function CapstonesPage() {
  const capstones = await prisma.capstoneProject.findMany({
    orderBy: [{ size: "asc" }, { orderIndex: "asc" }],
    include: {
      steps: {
        orderBy: { orderIndex: "asc" },
        select: { id: true, isCompleted: true },
      },
    },
  });

  const sizeLabels: Record<string, string> = {
    mini: "Mini Project",
    medium: "Medium Project",
    full: "Full Capstone",
  };

  const sizeColors: Record<string, string> = {
    mini: "text-green-400 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    full: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  // Group by size
  const bySize = capstones.reduce(
    (acc, c) => {
      if (!acc[c.size]) acc[c.size] = [];
      acc[c.size].push(c);
      return acc;
    },
    {} as Record<string, typeof capstones>
  );

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-white mb-2">Capstone Projects</h1>
      <p className="text-gray-400 mb-8">
        Apply your skills with hands-on projects. Start small and work your way
        up to building a complete virtual platform.
      </p>

      {capstones.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-2">No capstone projects yet.</p>
          <p className="text-sm text-gray-600">
            Complete more lessons and exercises to unlock capstone projects.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {["mini", "medium", "full"].map((size) => {
            const projects = bySize[size];
            if (!projects?.length) return null;

            return (
              <div key={size}>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {sizeLabels[size]}s
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => {
                    const completedSteps = project.steps.filter(
                      (s) => s.isCompleted
                    ).length;
                    const totalSteps = project.steps.length;
                    const progress =
                      totalSteps > 0
                        ? Math.round((completedSteps / totalSteps) * 100)
                        : 0;

                    return (
                      <Link
                        key={project.id}
                        href={`/capstones/${project.id}`}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-white font-medium">
                            {project.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded border ${sizeColors[project.size]}`}
                          >
                            {sizeLabels[project.size]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>
                              {completedSteps}/{totalSteps} steps
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
