"use client";

import { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ChatSession {
  id: string;
  title: string | null;
  topicId: string | null;
  updatedAt: string;
  messages: Array<{ content: string }>;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions
  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    // Load full message history
    const res = await fetch(`/api/chat?sessionId=${sessionId}`);
    const data = await res.json();
    if (data.messages) {
      setMessages(
        data.messages.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setStreamingText("");
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMessage = input.trim();
    setInput("");
    setStreaming(true);
    setStreamingText("");

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content: userMessage },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: userMessage,
        }),
      });

      // Handle non-streaming error responses (e.g. missing API key)
      if (!res.ok) {
        const errData = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant" as const,
            content: `**Error:** ${errData.error || "Something went wrong. Please try again."}`,
          },
        ]);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let sessionId = activeSessionId;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  fullText += data.text;
                  setStreamingText(fullText);
                }
                if (data.sessionId && !sessionId) {
                  sessionId = data.sessionId;
                  setActiveSessionId(sessionId);
                }
                if (data.done) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `msg-${Date.now()}`,
                      role: "assistant",
                      content: fullText,
                    },
                  ]);
                  setStreamingText("");
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, there was an error connecting to the AI tutor. Please try again.",
        },
      ]);
    }

    setStreaming(false);
    // Refresh sessions
    fetch("/api/chat")
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => {});
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8">
      {/* Sessions Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => loadSession(session.id)}
              className={`w-full text-left p-3 text-sm border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                activeSessionId === session.id ? "bg-gray-800" : ""
              }`}
            >
              <p className="text-gray-300 truncate">
                {session.title || "New chat"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(session.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !streaming && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Chat with your AI Tutor
                </h2>
                <p className="text-gray-400 text-sm max-w-md">
                  Ask questions about C++, SystemC, or TLM 2.0. Get explanations,
                  code reviews, and guided walkthroughs.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 max-w-lg mx-auto">
                  {[
                    "What is an SC_MODULE?",
                    "Explain b_transport in TLM 2.0",
                    "How do ports and signals connect?",
                    "Help me understand virtual functions",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="text-left text-sm text-gray-400 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-blue-500/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-500/30"
                    : "bg-gray-800/50 border border-gray-700"
                }`}
              >
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streaming && streamingText && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-lg p-4 bg-gray-800/50 border border-gray-700">
                <MarkdownRenderer content={streamingText} />
              </div>
            </div>
          )}

          {streaming && !streamingText && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask your tutor anything..."
              rows={2}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="self-end bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Shift+Enter for new line. Enter to send.
          </p>
        </div>
      </div>
    </div>
  );
}
