"use client";

import { useState } from "react";

export default function TextArea({ onAsk, disabled = false }) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || disabled) return;

    onAsk?.(trimmed);
    setQuestion("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="w-full shrink-0 border-t border-gray-800 bg-slate-950 px-4 py-3 sm:px-6 sm:py-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-3xl flex-col gap-2"
      >
        <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-slate-900 p-3 sm:flex-row sm:items-end sm:gap-4 sm:p-4">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something about your documents..."
            rows={3}
            disabled={disabled}
            className="min-h-[5rem] w-full flex-1 resize-none bg-transparent p-2 text-base leading-relaxed text-white outline-none placeholder:text-gray-500 disabled:opacity-60 sm:min-h-[5.5rem] sm:text-sm"
          />

          <button
            type="submit"
            disabled={disabled || !question.trim()}
            className="w-full shrink-0 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-24 sm:py-2.5"
          >
            {disabled ? "..." : "Ask"}
          </button>
        </div>
        <p className="hidden text-xs text-gray-500 sm:block">
          Press Enter to send · Shift+Enter for a new line
        </p>
      </form>
    </div>
  );
}
