"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkCompleteButton({
  lessonId,
  topicId,
}: {
  lessonId: string;
  topicId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);
    await fetch("/api/lessons/" + lessonId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", topicId }),
    });
    setCompleted(true);
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleComplete}
      disabled={loading || completed}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        completed
          ? "bg-green-600/20 text-green-400 border border-green-500/30"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {completed ? "Completed" : loading ? "Saving..." : "Mark Complete"}
    </button>
  );
}
