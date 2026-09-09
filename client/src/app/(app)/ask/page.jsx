"use client";

import { useRef, useState } from "react";
import TextArea from "@/app/components/TextArea";
import { askQuestion } from "@/lib/api";

export default function AskPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleAsk = async (question) => {
    if (!question.trim() || loading) return;

    setError("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    scrollToBottom();

    try {
      const data = await askQuestion(question);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          results: data.results || [],
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to get an answer.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong while generating an answer.",
          results: [],
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 space-y-1 border-b border-gray-800 p-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Ask
        </h1>
        <p className="text-sm text-gray-400">
          Ask questions grounded in your uploaded PDF documents.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-5">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-800 bg-slate-900/50 px-5 py-12 text-center sm:gap-3 sm:px-8 sm:py-16">
              <p className="text-base font-medium sm:text-lg">
                Ask about your documents
              </p>
              <p className="max-w-md text-sm leading-relaxed text-gray-400">
                Upload a PDF first, wait until it is completed, then ask a
                question here.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 w-full sm:px-5 sm:py-4 ${
                message.role === "user"
                  ? "ml-auto border-indigo-500/20 bg-indigo-500/10"
                  : "mr-auto border-gray-800 bg-slate-900"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              <p
                className={`break-words whitespace-pre-wrap text-sm leading-relaxed ${
                  message.isError ? "text-rose-300" : "text-gray-100"
                }`}
              >
                {message.content}
              </p>

              {message.role === "assistant" && message.results?.length > 0 && (
                <details className="mt-1 rounded-lg border border-gray-800 bg-slate-950 p-3">
                  <summary className="cursor-pointer text-xs font-medium text-gray-400 hover:text-gray-200">
                    Sources ({message.results.length})
                  </summary>
                  <ul className="mt-3 flex flex-col gap-3">
                    {message.results.map((result, resultIndex) => (
                      <li
                        key={resultIndex}
                        className="overflow-hidden rounded-md border border-gray-800 bg-slate-900 p-3 text-xs text-gray-300"
                      >
                        <p className="mb-2 break-words text-gray-500">
                          Score: {Number(result.score).toFixed(3)}
                          {result.metadata?.source
                            ? ` · ${result.metadata.source}`
                            : ""}
                        </p>
                        <p className="break-words whitespace-pre-wrap leading-relaxed">
                          {result.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}

          {loading && (
            <div className="mr-auto flex  flex-col gap-2 rounded-2xl border border-gray-800 bg-slate-900 px-4 py-3 w-full sm:px-5 sm:py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Assistant
              </p>
              <p className="text-sm text-gray-400">Thinking...</p>
            </div>
          )}

          {error && (
            <p className="break-words rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      <TextArea onAsk={handleAsk} disabled={loading} />
    </div>
  );
}
