import Anthropic from "@anthropic-ai/sdk";
import {
  EVALUATOR_PROMPT,
  OPTIMAL_SOLUTION_PROMPT,
  EXERCISE_GEN_PROMPT,
  HINT_PROMPT,
  buildEvalPrompt,
  buildHintPrompt,
  buildChatSystemPrompt,
} from "./prompts";
import type { EvaluationResult, OptimalSolution } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-20250514";

// ─── Exercise Evaluation ──────────────────────────────────────────

export async function evaluateSubmission(params: {
  exerciseDescription: string;
  starterCode: string;
  solutionCode: string | null;
  userCode: string;
  difficulty: number;
}): Promise<EvaluationResult> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: EVALUATOR_PROMPT,
    messages: [{ role: "user", content: buildEvalPrompt(params) }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text) as EvaluationResult;
  } catch {
    // If Claude didn't return valid JSON, extract what we can
    return {
      score: 0,
      isCorrect: false,
      feedback:
        "Error parsing AI evaluation. Raw response:\n\n" + text,
      codeQuality: {
        correctness: 1,
        readability: 1,
        efficiency: 1,
        bestPractices: 1,
      },
    };
  }
}

// ─── Optimal Solution ─────────────────────────────────────────────

export async function generateOptimalSolution(params: {
  exerciseDescription: string;
  userCode: string;
  difficulty: number;
}): Promise<OptimalSolution> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: OPTIMAL_SOLUTION_PROMPT,
    messages: [
      {
        role: "user",
        content: `## Exercise (Difficulty ${params.difficulty}/5)\n\n${params.exerciseDescription}\n\n### Student's Solution\n\`\`\`cpp\n${params.userCode}\n\`\`\`\n\nProvide the optimal solution and explain improvements.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text) as OptimalSolution;
  } catch {
    return {
      code: "",
      explanation: text,
      improvements: [],
    };
  }
}

// ─── Exercise Generation ──────────────────────────────────────────

export async function generateExercise(params: {
  topicTitle: string;
  topicDescription: string;
  lessonTitle?: string;
  difficulty: number;
  exerciseType?: string;
}) {
  const typeGuide = params.exerciseType
    ? `\nExercise type: ${params.exerciseType} (fill-blank = complete partial code, write = implement from scratch, debug = find and fix bugs)`
    : "";
  const lessonContext = params.lessonTitle
    ? `\nThe student just read the lesson: "${params.lessonTitle}". The exercise should test concepts from that lesson.`
    : "";

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: EXERCISE_GEN_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate an exercise for the topic "${params.topicTitle}" at difficulty level ${params.difficulty}/5.\n\nTopic description: ${params.topicDescription}${lessonContext}${typeGuide}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── Hint Generation ──────────────────────────────────────────────

export async function generateHint(params: {
  exerciseDescription: string;
  starterCode: string;
  userCode: string;
  attemptNumber: number;
  previousFeedback: string | null;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: HINT_PROMPT,
    messages: [{ role: "user", content: buildHintPrompt(params) }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ─── Streaming Chat ───────────────────────────────────────────────

export function streamChat(params: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  topicTitle?: string;
  difficulty?: number;
  recentProgress?: string;
}) {
  const systemPrompt = buildChatSystemPrompt({
    topicTitle: params.topicTitle,
    difficulty: params.difficulty,
    recentProgress: params.recentProgress,
  });

  return anthropic.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    system: systemPrompt,
    messages: params.messages,
  });
}

// ─── Capstone Step Evaluation ─────────────────────────────────────

export async function evaluateCapstoneStep(params: {
  stepDescription: string;
  skeletonCode: string;
  userCode: string;
  projectTitle: string;
}): Promise<{
  isReady: boolean;
  feedback: string;
  score: number;
}> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are reviewing a step in a capstone project "${params.projectTitle}". Evaluate whether the student's implementation is good enough to proceed to the next step.

Respond with a JSON object:
{
  "isReady": <true/false>,
  "feedback": "<detailed markdown feedback>",
  "score": <0-100>
}

Be rigorous but fair. The student should demonstrate understanding, not just a working solution.`,
    messages: [
      {
        role: "user",
        content: `## Step Description\n${params.stepDescription}\n\n## Skeleton Code\n\`\`\`cpp\n${params.skeletonCode}\n\`\`\`\n\n## Student's Code\n\`\`\`cpp\n${params.userCode}\n\`\`\``,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text);
  } catch {
    return { isReady: false, feedback: text, score: 0 };
  }
}
