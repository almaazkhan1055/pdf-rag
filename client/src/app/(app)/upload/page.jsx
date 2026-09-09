"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {};

  return (
    <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
      <div className="rounded-2xl border border-gray-800 bg-slate-900 p-8 flex-1">
        <label
          htmlFor="pdf-upload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 px-6 py-16 transition hover:border-gray-500 hover:bg-slate-800"
        >
          <div className="mb-4 text-4xl">📄</div>

          <p className="text-lg font-medium">
            {file ? file.name : "Choose a PDF file"}
          </p>

          <p className="mt-2 text-sm text-gray-400">PDF files only</p>

          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {file && (
          <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-800 bg-slate-950 p-4">
            <div>
              <p className="font-medium">{file.name}</p>

              <p className="mt-1 text-sm text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium hover:bg-indigo-500">
              Upload PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
