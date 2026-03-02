import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatScore(score: number): string {
  return `${score}%`;
}

export function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
  };
  return labels[level] || "Unknown";
}

export function getDifficultyColor(level: number): string {
  const colors: Record<number, string> = {
    1: "text-green-600 bg-green-100",
    2: "text-blue-600 bg-blue-100",
    3: "text-yellow-600 bg-yellow-100",
    4: "text-orange-600 bg-orange-100",
    5: "text-red-600 bg-red-100",
  };
  return colors[level] || "text-gray-600 bg-gray-100";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    locked: "text-gray-400 bg-gray-100",
    available: "text-blue-600 bg-blue-100",
    "in-progress": "text-yellow-600 bg-yellow-100",
    completed: "text-green-600 bg-green-100",
  };
  return colors[status] || "text-gray-600 bg-gray-100";
}
