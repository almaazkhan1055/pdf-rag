"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDocument, listDocuments, uploadPdf } from "@/lib/api";

const STATUS_STYLES = {
  queued: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  processing: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const pollRef = useRef(null);

  const refreshDocuments = useCallback(async () => {
    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (documentId) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const data = await getDocument(documentId);
        const doc = data.document;

        setDocuments((prev) => {
          const exists = prev.some((item) => item._id === doc._id);
          if (!exists) return [doc, ...prev];
          return prev.map((item) => (item._id === doc._id ? doc : item));
        });

        if (doc.status === "completed" || doc.status === "failed") {
          clearInterval(pollRef.current);
          pollRef.current = null;

          if (doc.status === "completed") {
            setSuccess("Document processed and ready for questions.");
          } else {
            setError(doc.error || "Document processing failed.");
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    setError("");
    setSuccess("");

    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.type !== "application/pdf") {
      setFile(null);
      setError("Only PDF files are allowed.");
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setFile(null);
      setError("File must be 50 MB or smaller.");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const data = await uploadPdf(file);
      setSuccess(data.message || "Document uploaded and queued.");
      setFile(null);
      await refreshDocuments();
      if (data.documentId) startPolling(data.documentId);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-scroll">
      <div className="page-stack">
        <div>
          <h1 className="page-title">Upload PDF</h1>
          <p className="page-subtitle">
            Upload a PDF to extract, chunk, embed, and index it for Q&A.
          </p>
        </div>

        <div className="page-card">
          <label htmlFor="pdf-upload" className="dropzone">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-gray-300 sm:mb-4 sm:h-12 sm:w-12 sm:text-base">
              PDF
            </div>

            <p className="max-w-full break-all px-1 text-base font-medium sm:text-lg">
              {file ? file.name : "Choose a PDF file"}
            </p>

            <p className="mt-2 text-sm text-gray-400">PDF only · max 50 MB</p>

            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="file-preview-row">
              <div className="min-w-0">
                <p className="break-all font-medium">{file.name}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {formatSize(file.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary btn-primary-block shrink-0"
              >
                {uploading ? "Uploading..." : "Upload PDF"}
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 break-words rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-4 break-words rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </p>
          )}
        </div>

        <div className="page-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-medium sm:text-lg">Your documents</h2>
            <button
              type="button"
              onClick={refreshDocuments}
              className="shrink-0 rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-slate-800 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {loadingDocs ? (
            <p className="text-sm text-gray-400">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-gray-400">
              No documents yet. Upload a PDF to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc._id}
                  className="rounded-xl border border-gray-800 bg-slate-950 px-3 py-3 sm:px-4"
                >
                  <div className="doc-row">
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-medium sm:truncate sm:break-normal">
                        {doc.originalName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatSize(doc.size)}
                        <span className="mt-0.5 block sm:mt-0 sm:ml-1 sm:inline">
                          {doc.createdAt
                            ? new Date(doc.createdAt).toLocaleString()
                            : "—"}
                        </span>
                      </p>
                      {doc.status === "failed" && doc.error && (
                        <p className="mt-2 break-words text-xs text-rose-300">
                          {doc.error}
                        </p>
                      )}
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[doc.status] || STATUS_STYLES.queued
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
