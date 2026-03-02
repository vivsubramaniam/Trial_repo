export const dynamic = "force-dynamic";

export default function GuidePage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">How to Use This App</h1>
      <p className="text-gray-400 mb-10">
        Your personal AI tutor for C++, SystemC, and TLM 2.0. Here&apos;s everything you need to know.
      </p>

      {/* Learning Path */}
      <Section title="Your Learning Path">
        <p className="text-gray-300 mb-4">
          The curriculum is structured as three progressive tracks. You must build the
          foundation before advancing — just like you need to understand C++ classes before
          you can write SystemC modules.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TrackCard
            number="1"
            title="C++ for SystemC"
            color="blue"
            description="Only the C++ you need for SystemC — OOP, templates, pointers, operator overloading. Not a full C++ course."
            topics={["Classes & Objects", "Inheritance & Polymorphism", "Templates", "Pointers & References", "Operator Overloading"]}
          />
          <TrackCard
            number="2"
            title="SystemC"
            color="yellow"
            description="Hardware modeling with SystemC — modules, ports, signals, processes, testbenches."
            topics={["Modules & Hierarchy", "Ports & Signals", "Processes (SC_METHOD, SC_THREAD)", "Data Types", "Testbench Design"]}
          />
          <TrackCard
            number="3"
            title="TLM 2.0"
            color="green"
            description="Your priority track — transaction-level modeling for virtual platforms and SoC design."
            topics={["Generic Payload", "Initiator/Target Sockets", "Blocking Transport", "Non-Blocking Transport", "Virtual Platforms"]}
          />
        </div>
      </Section>

      {/* Skill Tree */}
      <Section title="Skill Tree">
        <FeatureBlock
          icon="🗺️"
          title="What it is"
          description="A visual map of all topics across the three tracks, showing which topics you need to complete before unlocking others."
        />
        <div className="mt-4 space-y-2 text-sm">
          <StatusRow color="green" label="Completed" description="You've finished all lessons in this topic." />
          <StatusRow color="yellow" label="In Progress" description="You've started but not finished all lessons." />
          <StatusRow color="blue" label="Available" description="All prerequisites met — ready to study." />
          <StatusRow color="gray" label="Locked" description="Complete the prerequisite topics first (shown in the topic card)." />
        </div>
        <p className="text-gray-400 text-sm mt-4">
          You can still skip ahead if you want — navigate to any lesson directly from the Lessons page regardless of lock status.
        </p>
      </Section>

      {/* Lessons */}
      <Section title="Lessons">
        <FeatureBlock
          icon="📖"
          title="How lessons work"
          description="Each lesson is a Markdown document with explanations, code examples, and real-world hardware design context. Lessons are organized by topic within each track."
        />
        <ul className="mt-3 space-y-2 text-sm text-gray-300 list-disc list-inside">
          <li>Read through the lesson content — all code examples are syntax-highlighted C++</li>
          <li>At the bottom of each lesson, you&apos;ll find the exercises for that lesson</li>
          <li>Click <strong className="text-white">Mark Complete</strong> when you&apos;re done reading — this updates your progress in the skill tree</li>
          <li>Click the <strong className="text-white">bookmark icon</strong> to save the lesson for quick reference later</li>
          <li>Use the prev/next arrows at the bottom to move between lessons in a topic</li>
        </ul>
      </Section>

      {/* Exercises */}
      <Section title="Exercises">
        <FeatureBlock
          icon="⌨️"
          title="How exercises work"
          description="Each exercise opens a Monaco code editor (the same editor as VS Code) with starter code. You write your solution and submit it for AI evaluation."
        />
        <div className="mt-4 space-y-4">
          <Step number="1" title="Read the problem">
            The left panel shows the problem description with context (e.g., &quot;You&apos;re building a memory controller...&quot;).
          </Step>
          <Step number="2" title="Write your code">
            The right panel is the Monaco editor. Modify the starter code — it already has the structure, you fill in the logic.
          </Step>
          <Step number="3" title="Use hints if stuck">
            Click <strong className="text-white">Show hint</strong> to reveal progressive hints:
            <ul className="list-disc list-inside ml-4 mt-1 text-gray-400 text-sm">
              <li>Hint 1–2: Socratic questions to guide your thinking</li>
              <li>Hint 3–4: More specific direction</li>
              <li>Hint 5+: Near-direct explanation with a small example</li>
            </ul>
          </Step>
          <Step number="4" title="Submit for AI evaluation">
            Claude reads your code and returns: a score (0–100), pass/fail, and detailed feedback pointing to specific issues.
          </Step>
          <Step number="5" title="See the optimal solution">
            If you pass, Claude shows you the best possible solution and explains what improvements you could make over your approach.
          </Step>
        </div>

        <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm">
          <p className="text-gray-300 font-medium mb-2">Exercise types:</p>
          <ul className="space-y-1 text-gray-400">
            <li><strong className="text-white">Fill-in-the-blank</strong> — Code is mostly written, you complete the key parts</li>
            <li><strong className="text-white">Write from scratch</strong> — You implement a function or class from a description</li>
            <li><strong className="text-white">Debug &amp; fix</strong> — Buggy code is provided, find and fix the issues</li>
          </ul>
        </div>

        <p className="text-sm text-gray-400 mt-3">
          <strong className="text-yellow-400">Note:</strong> AI evaluation reads your code conceptually — it does not compile or run it.
          This is intentional for now. Compilation support will be added in a future version.
        </p>
      </Section>

      {/* Adaptive Difficulty */}
      <Section title="Adaptive Difficulty">
        <FeatureBlock
          icon="📈"
          title="How it adapts to you"
          description="After every submission, the app tracks your performance and adjusts the difficulty of future exercises per topic."
        />
        <div className="mt-3 text-sm text-gray-300 space-y-2">
          <p>Based on your last 5 submissions per topic:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 ml-4">
            <li>Avg score ≥ 85% and 80% pass rate → difficulty increases (harder exercises)</li>
            <li>Avg score &lt; 50% and &lt; 30% pass rate → difficulty decreases (easier exercises)</li>
            <li>Otherwise → stays the same</li>
          </ul>
          <p className="text-gray-400">
            Difficulty ranges from 1 (Beginner) to 5 (Expert). You start at level 1 for each topic.
          </p>
        </div>
      </Section>

      {/* Chat Tutor */}
      <Section title="Chat Tutor">
        <FeatureBlock
          icon="💬"
          title="Your AI mentor"
          description="Chat with Claude configured as a senior hardware engineer. Use it for concept questions, code help, or guided walkthroughs."
        />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <ChatUseCase
            title="Concept Q&A"
            example='"What is the difference between SC_METHOD and SC_THREAD?"'
          />
          <ChatUseCase
            title="Code Help"
            example='"Here is my TLM initiator — why does it deadlock?"'
          />
          <ChatUseCase
            title="Guided walkthrough"
            example='"Walk me through building a simple TLM target socket step by step."'
          />
        </div>
        <ul className="mt-4 space-y-1 text-sm text-gray-400 list-disc list-inside">
          <li>Press <strong className="text-white">Enter</strong> to send, <strong className="text-white">Shift+Enter</strong> for a new line</li>
          <li>Past chat sessions are saved in the left sidebar</li>
          <li>The tutor adapts its depth to your current skill level</li>
          <li>Bookmark any AI response for future reference</li>
          <li><strong className="text-yellow-400">Requires API key</strong> — won&apos;t work without ANTHROPIC_API_KEY configured</li>
        </ul>
      </Section>

      {/* Capstone Projects */}
      <Section title="Capstone Projects">
        <FeatureBlock
          icon="🏆"
          title="Project-based learning"
          description="Apply your skills by building real SystemC/TLM2.0 components. Capstones are multi-step projects with AI-scaffolded architecture."
        />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <CapstoneType title="Mini" color="green" description='End of each topic. Example: "Build a simple counter module with testbench."' time="~1–2 hours" />
          <CapstoneType title="Medium" color="yellow" description='End of each track. Example: "Build a TLM memory controller with bus interface."' time="~half day" />
          <CapstoneType title="Full Capstone" color="red" description='"Build a virtual platform with CPU model, memory, and UART peripheral."' time="multi-day" />
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Each capstone step provides a skeleton with <code className="bg-gray-800 px-1 rounded text-blue-300">{"// YOUR CODE HERE"}</code> markers.
          You fill in the implementation and submit each step for AI review before proceeding.
          Stuck? Request hints that get progressively more specific.
        </p>
      </Section>

      {/* Progress & Analytics */}
      <Section title="Progress & Analytics">
        <FeatureBlock
          icon="📊"
          title="Track your improvement"
          description="The Progress page shows detailed analytics across all dimensions of your learning."
        />
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <AnalyticItem title="Skill Radar Chart" description="Spider chart showing your proficiency across 12 sub-skills (OOP, Templates, TLM Sockets, etc.). Updated after every exercise submission." />
          <AnalyticItem title="Code Quality Trends" description="Line chart tracking 4 dimensions over time: Correctness, Readability, Efficiency, Best Practices (each scored 1–5 by AI)." />
          <AnalyticItem title="Learning Velocity" description="How many exercises per day you're completing and whether your scores are improving, stable, or declining." />
          <AnalyticItem title="Track Progress" description="Lessons completed, exercises passed, and average score per track (C++ / SystemC / TLM 2.0)." />
        </div>
      </Section>

      {/* Bookmarks */}
      <Section title="Bookmarks">
        <p className="text-gray-300 text-sm">
          Click the <strong className="text-white">bookmark icon</strong> (🔖) on any lesson, exercise, or chat message to save it.
          All bookmarks are organized on the <strong className="text-white">Bookmarks page</strong> for quick reference — useful for saving
          key concepts, tricky exercises you want to revisit, or helpful AI explanations.
        </p>
      </Section>

      {/* Session Continuity */}
      <Section title="Continue Where You Left Off">
        <p className="text-gray-300 text-sm">
          Every time you open a lesson or exercise, your position is saved automatically.
          The <strong className="text-white">Dashboard</strong> shows a <strong className="text-white">&quot;Continue where you left off&quot;</strong> button
          that takes you straight back to your last activity — no need to navigate back manually.
        </p>
      </Section>

      {/* Setup */}
      <Section title="Setup Requirements">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm space-y-2">
          <p className="text-white font-medium">For full functionality you need:</p>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>DATABASE_URL</strong> — Neon PostgreSQL connection string (already configured)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">!</span>
              <span><strong>ANTHROPIC_API_KEY</strong> — Required for AI evaluation, chat, and hints. Get it at <span className="text-blue-400">console.anthropic.com</span></span>
            </li>
          </ul>
        </div>
      </Section>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function FeatureBlock({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

function TrackCard({ number, title, color, description, topics }: {
  number: string; title: string; color: string; description: string; topics: string[];
}) {
  const colors: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/5",
    yellow: "border-yellow-500/30 bg-yellow-500/5",
    green: "border-green-500/30 bg-green-500/5",
  };
  const numColors: Record<string, string> = {
    blue: "text-blue-400", yellow: "text-yellow-400", green: "text-green-400",
  };
  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <div className={`text-2xl font-bold mb-1 ${numColors[color]}`}>Track {number}</div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-xs mb-3">{description}</p>
      <ul className="space-y-1">
        {topics.map((t) => (
          <li key={t} className="text-xs text-gray-400 flex items-center gap-1">
            <span className={`w-1 h-1 rounded-full ${numColors[color].replace("text", "bg")}`} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusRow({ color, label, description }: { color: string; label: string; description: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-500", yellow: "bg-yellow-500", blue: "bg-blue-500", gray: "bg-gray-600",
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${colors[color]} flex-shrink-0`} />
      <span className="text-white font-medium w-24">{label}</span>
      <span className="text-gray-400">{description}</span>
    </div>
  );
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-gray-400 text-sm mt-0.5">{children}</p>
      </div>
    </div>
  );
}

function ChatUseCase({ title, example }: { title: string; example: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
      <p className="text-white font-medium mb-1">{title}</p>
      <p className="text-gray-400 italic text-xs">{example}</p>
    </div>
  );
}

function CapstoneType({ title, color, description, time }: {
  title: string; color: string; description: string; time: string;
}) {
  const colors: Record<string, string> = {
    green: "text-green-400 border-green-500/30 bg-green-500/5",
    yellow: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
    red: "text-red-400 border-red-500/30 bg-red-500/5",
  };
  return (
    <div className={`border rounded-lg p-3 ${colors[color]}`}>
      <p className="font-semibold">{title}</p>
      <p className="text-gray-400 text-xs mt-1">{description}</p>
      <p className="text-xs mt-2 opacity-70">{time}</p>
    </div>
  );
}

function AnalyticItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
      <p className="text-white text-sm font-medium mb-1">{title}</p>
      <p className="text-gray-400 text-xs">{description}</p>
    </div>
  );
}
