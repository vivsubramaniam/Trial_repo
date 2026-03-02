"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CodeEditor from "@/components/CodeEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface CapstoneStep {
  id: string;
  title: string;
  description: string;
  skeletonCode: string;
  orderIndex: number;
  userCode: string | null;
  aiFeedback: string | null;
  isCompleted: boolean;
}

interface CapstoneProject {
  id: string;
  title: string;
  description: string;
  size: string;
  difficulty: number;
  steps: CapstoneStep[];
}

export default function CapstonePage({
  params,
}: {
  params: { projectId: string };
}) {
  const [project, setProject] = useState<CapstoneProject | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isReady: boolean;
    feedback: string;
    score: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/capstones/${params.projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        // Find first incomplete step
        const firstIncomplete = data.steps?.findIndex(
          (s: CapstoneStep) => !s.isCompleted
        );
        setActiveStep(firstIncomplete >= 0 ? firstIncomplete : 0);
        const step = data.steps?.[firstIncomplete >= 0 ? firstIncomplete : 0];
        setCode(step?.userCode || step?.skeletonCode || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.projectId]);

  const currentStep = project?.steps[activeStep];

  const handleStepSelect = (index: number) => {
    setActiveStep(index);
    const step = project?.steps[index];
    setCode(step?.userCode || step?.skeletonCode || "");
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!currentStep) return;
    setSubmitting(true);
    setFeedback(null);

    const res = await fetch(
      `/api/capstones/${params.projectId}/steps/${currentStep.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }
    );

    const data = await res.json();
    setFeedback(data);
    setSubmitting(false);

    // Refresh project
    const refreshRes = await fetch(`/api/capstones/${params.projectId}`);
    const refreshData = await refreshRes.json();
    setProject(refreshData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading capstone project...</div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-red-400">Project not found.</div>;
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/capstones" className="hover:text-white">
          Capstones
        </Link>
        <span>/</span>
        <span className="text-gray-300">{project.title}</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">{project.title}</h1>
      <p className="text-gray-400 mb-6">{project.description}</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Steps</h3>
          <div className="space-y-2">
            {project.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepSelect(index)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  index === activeStep
                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-400"
                    : step.isCompleted
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {step.isCompleted ? "✓" : index + 1}
                  </span>
                  <span>{step.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {currentStep && (
            <>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-3">
                  Step {activeStep + 1}: {currentStep.title}
                </h2>
                <MarkdownRenderer content={currentStep.description} />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Your Code
                </h3>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  height="500px"
                  readOnly={currentStep.isCompleted}
                />
              </div>

              {!currentStep.isCompleted && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting
                    ? "AI is reviewing your code..."
                    : "Submit Step for Review"}
                </button>
              )}

              {/* Feedback */}
              {(feedback || currentStep.aiFeedback) && (
                <div
                  className={`rounded-lg p-4 border ${
                    (feedback?.isReady || currentStep.isCompleted)
                      ? "bg-green-900/20 border-green-700/30"
                      : "bg-yellow-900/20 border-yellow-700/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-medium ${
                        (feedback?.isReady || currentStep.isCompleted)
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {(feedback?.isReady || currentStep.isCompleted)
                        ? "Ready to proceed!"
                        : "Needs improvement"}
                    </span>
                    {feedback?.score !== undefined && (
                      <span className="text-white font-bold">
                        {feedback.score}%
                      </span>
                    )}
                  </div>
                  <MarkdownRenderer
                    content={feedback?.feedback || currentStep.aiFeedback || ""}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
