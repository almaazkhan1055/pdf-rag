"use client";
import React, { useState } from "react";

const TextArea = () => {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    console.log("handlesubmit");
  };

  return (
    <div className="w-full border-gray-800 bg-slate-950 p-4">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl" enctype="multipart/form-data">
        <div className="flex items-end gap-3 rounded-xl border border-gray-700 bg-slate-900 p-3">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about your documents..."
            rows={3}
            className="flex-1 resize-none bg-transparent p-2 text-white outline-none placeholder:text-gray-500"
          />

          <button
            type="submit"
            disabled={!question.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextArea;
