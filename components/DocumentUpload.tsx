"use client";

import { useRef, useState } from "react";

import { uploadDocument } from "../lib/api";

interface DocumentUploadProps {
  onUploaded?: () => void;
}

export default function DocumentUpload({
  onUploaded,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSelectFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setError("");

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const data = await uploadDocument(file);

      setMessage(
        `${data.filename} uploaded successfully. ${data.chunk_count} chunks indexed.`
      );

      onUploaded?.();
    } catch (uploadError) {
      console.error(
        "Document upload failed:",
        uploadError
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload document."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleSelectFile}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Upload document
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Add a PDF to your Aegis knowledge base.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Processing..." : "Choose PDF"}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}