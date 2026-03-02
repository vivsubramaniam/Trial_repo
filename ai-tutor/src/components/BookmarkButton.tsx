"use client";

import { useState, useEffect } from "react";

export default function BookmarkButton({
  type,
  referenceId,
}: {
  type: "lesson" | "exercise" | "chat_message";
  referenceId: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookmarks?type=${type}&referenceId=${referenceId}`)
      .then((res) => res.json())
      .then((data) => {
        setIsBookmarked(data.isBookmarked);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type, referenceId]);

  const toggle = async () => {
    setLoading(true);
    const method = isBookmarked ? "DELETE" : "POST";
    await fetch("/api/bookmarks", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, referenceId }),
    });
    setIsBookmarked(!isBookmarked);
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-lg border transition-colors ${
        isBookmarked
          ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
          : "border-gray-700 bg-gray-800/50 text-gray-500 hover:text-gray-300"
      }`}
      title={isBookmarked ? "Remove bookmark" : "Bookmark"}
    >
      <svg
        className="w-5 h-5"
        fill={isBookmarked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
