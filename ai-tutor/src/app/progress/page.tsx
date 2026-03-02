"use client";

import { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ProgressData {
  trackProgress: Array<{
    trackId: string;
    trackTitle: string;
    trackSlug: string;
    totalTopics: number;
    completedTopics: number;
    totalLessons: number;
    completedLessons: number;
    totalExercises: number;
    passedExercises: number;
    averageScore: number;
  }>;
  skillRatings: Array<{
    skillName: string;
    rating: number;
  }>;
  codeQualityTrends: Array<{
    date: string;
    correctness: number;
    readability: number;
    efficiency: number;
    bestPractices: number;
  }>;
  learningVelocity: {
    exercisesPerDay: number;
    averageScoreTrend: "improving" | "stable" | "declining";
    estimatedSessionsToMastery: number | null;
  };
  totalSubmissions: number;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-400">Failed to load progress data.</div>;
  }

  const radarData = data.skillRatings.map((s) => ({
    skill: s.skillName,
    rating: s.rating,
    fullMark: 5,
  }));

  const trendLabel =
    data.learningVelocity.averageScoreTrend === "improving"
      ? "Improving"
      : data.learningVelocity.averageScoreTrend === "declining"
      ? "Needs attention"
      : "Stable";

  const trendColor =
    data.learningVelocity.averageScoreTrend === "improving"
      ? "text-green-400"
      : data.learningVelocity.averageScoreTrend === "declining"
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">
        Progress & Analytics
      </h1>
      <p className="text-gray-400 mb-8">
        Track your learning journey and identify areas for improvement.
      </p>

      {/* Learning Velocity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Submissions</p>
          <p className="text-2xl font-bold text-white">
            {data.totalSubmissions}
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Exercises / Day</p>
          <p className="text-2xl font-bold text-white">
            {data.learningVelocity.exercisesPerDay}
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Score Trend</p>
          <p className={`text-2xl font-bold ${trendColor}`}>{trendLabel}</p>
        </div>
      </div>

      {/* Track Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {data.trackProgress.map((track) => (
          <div
            key={track.trackId}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-5"
          >
            <h3 className="text-white font-semibold mb-3">{track.trackTitle}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Topics</span>
                <span className="text-white">
                  {track.completedTopics}/{track.totalTopics}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lessons</span>
                <span className="text-white">
                  {track.completedLessons}/{track.totalLessons}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Exercises Passed</span>
                <span className="text-white">
                  {track.passedExercises}/{track.totalExercises}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Score</span>
                <span className="text-white">{track.averageScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Skill Radar Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Skill Radar
          </h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 5]}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                />
                <Radar
                  name="Skill Level"
                  dataKey="rating"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">
              Complete exercises to see your skill profile.
            </p>
          )}
        </div>

        {/* Code Quality Trends */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Code Quality Trends
          </h3>
          {data.codeQualityTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.codeQualityTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="correctness"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="readability"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="bestPractices"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">
              Submit exercises to see code quality trends.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
