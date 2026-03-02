"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CodeEditor from "@/components/CodeEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import BookmarkButton from "@/components/BookmarkButton";

interface Exercise {
  id: string;
  title: string;
  description: string;
  exerciseType: string;
  starterCode: string;
  difficulty: number;
  hints: string | null;
  lesson: {
    id: string;
    title: string;
    topicId: string;
    topic: { title: string; slug: string };
  };
  submissions: Array<{
    id: string;
    score: number;
    isCorrect: boolean;
    aiFeedback: string;
    attemptNumber: number;
    code: string;
    codeQuality: {
      correctness: number;
      readability: number;
      efficiency: number;
      bestPractices: number;
    } | null;
  }>;
}

interface SubmissionResult {
  submission: {
    score: number;
    isCorrect: boolean;
    feedback: string;
    attemptNumber: number;
    codeQuality: {
      correctness: number;
      readability: number;
      efficiency: number;
      bestPractices: number;
    };
  };
  optimalSolution: {
    code: string;
    explanation: string;
    improvements: string[];
  } | null;
}

export default function ExercisePage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetch(`/api/exercises/${params.exerciseId}`)
      .then((res) => res.json())
      .then((data) => {
        setExercise(data);
        setCode(data.starterCode);
        setLoading(false);
      });
  }, [params.exerciseId]);

  const hints: string[] = exercise?.hints
    ? JSON.parse(exercise.hints)
    : [];

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);

    const timeSpentSec = Math.round((Date.now() - startTime) / 1000);

    const res = await fetch(
      `/api/exercises/${params.exerciseId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, timeSpentSec }),
      }
    );

    const data = await res.json();
    setResult(data);
    setSubmitting(false);

    // Refresh exercise to get updated submissions
    const refreshRes = await fetch(`/api/exercises/${params.exerciseId}`);
    const refreshData = await refreshRes.json();
    setExercise(refreshData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading exercise...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-red-400">Exercise not found.</div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/exercises" className="hover:text-white">
          Exercises
        </Link>
        <span>/</span>
        <Link
          href={`/lessons/${exercise.lesson.id}`}
          className="hover:text-white"
        >
          {exercise.lesson.title}
        </Link>
        <span>/</span>
        <span className="text-gray-300">{exercise.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Problem Description */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {exercise.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 capitalize">
                  {exercise.exerciseType.replace("-", " ")}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                  Level {exercise.difficulty}
                </span>
              </div>
            </div>
            <BookmarkButton type="exercise" referenceId={exercise.id} />
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <MarkdownRenderer content={exercise.description} />
          </div>

          {/* Hints */}
          {hints.length > 0 && (
            <div>
              <button
                onClick={() =>
                  setHintsRevealed(Math.min(hintsRevealed + 1, hints.length))
                }
                disabled={hintsRevealed >= hints.length}
                className="text-sm text-yellow-400 hover:text-yellow-300 mb-3"
              >
                {hintsRevealed < hints.length
                  ? `Show hint (${hintsRevealed}/${hints.length} revealed)`
                  : `All hints revealed (${hints.length})`}
              </button>
              {hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-2 text-sm text-yellow-200/80"
                >
                  <span className="font-medium text-yellow-400">
                    Hint {i + 1}:
                  </span>{" "}
                  {hint}
                </div>
              ))}
            </div>
          )}

          {/* Previous Attempts */}
          {exercise.submissions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Previous Attempts
              </h3>
              <div className="space-y-2">
                {exercise.submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3"
                  >
                    <span className="text-sm text-gray-300">
                      Attempt #{sub.attemptNumber}
                    </span>
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
            </div>
          )}
        </div>

        {/* Right: Code Editor & Results */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Your Solution
            </h3>
            <CodeEditor value={code} onChange={setCode} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Evaluating with AI..." : "Submit Solution"}
          </button>

          {/* Evaluation Result */}
          {result && (
            <div className="space-y-4">
              {/* Score */}
              <div
                className={`rounded-lg p-4 border ${
                  result.submission.isCorrect
                    ? "bg-green-900/20 border-green-700/30"
                    : "bg-red-900/20 border-red-700/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-lg font-bold ${
                      result.submission.isCorrect
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.submission.isCorrect ? "Passed!" : "Not quite right"}
                  </span>
                  <span className="text-2xl font-bold text-white">
                    {result.submission.score}%
                  </span>
                </div>

                {/* Code Quality Breakdown */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {Object.entries(result.submission.codeQuality).map(
                    ([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-sm font-medium text-white">
                          {value}/5
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  AI Feedback
                </h4>
                <MarkdownRenderer content={result.submission.feedback} />
              </div>

              {/* Optimal Solution */}
              {result.optimalSolution && (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">
                    Optimal Solution
                  </h4>
                  <MarkdownRenderer
                    content={`\`\`\`cpp\n${result.optimalSolution.code}\n\`\`\``}
                  />
                  <div className="mt-3">
                    <MarkdownRenderer
                      content={result.optimalSolution.explanation}
                    />
                  </div>
                  {result.optimalSolution.improvements.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-blue-300 font-medium mb-1">
                        What you could improve:
                      </p>
                      <ul className="list-disc list-inside text-sm text-blue-200/70 space-y-1">
                        {result.optimalSolution.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
