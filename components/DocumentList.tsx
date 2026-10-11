"use client";

import { useEffect, useState } from "react";

import {
  deleteDocument,
  getDocuments,
} from "../lib/api";

import type { DocumentItem } from "../lib/api";

interface DocumentListProps {
  refreshKey?: number;
  selectedDocumentId?: number | null;
  onSelectDocument?: (
    documentId: number | null
  ) => void;
}

export default function DocumentList({
  refreshKey = 0,
  selectedDocumentId = null,
  onSelectDocument,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<
    DocumentItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDocuments();

      setDocuments(data);
    } catch (loadError) {
      console.error(
        "Failed to load documents:",
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load documents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshKey]);

  const handleDelete = async (
    documentId: number
  ) => {
    const confirmed = window.confirm(
      "Delete this document and its indexed chunks?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(documentId);

      await deleteDocument(documentId);

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) =>
            document.id !== documentId
        )
      );
    } catch (deleteError) {
      console.error(
        "Document deletion failed:",
        deleteError
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">
          Loading documents...
        </p>
      </div>
    );
  }
return (
  <div className="rounded-2xl border border-gray-200 bg-white p-5">
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-900">
        Documents
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Select a document to use as the Aegis knowledge source.
      </p>
       {selectedDocumentId === null && (
        <p className="mt-2 text-xs text-gray-400">
          No document selected — Aegis is in General AI mode.
        </p>
      )}
    </div>

    {error && (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    {documents.length === 0 ? (
      <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center">
        <p className="text-sm text-gray-500">
          No documents uploaded yet.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {documents.map((document) => {
          const isSelected =
            selectedDocumentId === document.id;

          return (
            <div
              key={document.id}
              className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition ${
                isSelected
                  ? "border-black bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  onSelectDocument?.(document.id)
                }
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-gray-900">
                  {document.filename}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {document.page_count}{" "}
                  {document.page_count === 1
                    ? "page"
                    : "pages"}{" "}
                  · Indexed
                </p>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                {isSelected && (
                  <span className="rounded-lg bg-black px-2.5 py-1.5 text-xs font-medium text-white">
                    Selected
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(document.id)
                  }
                  disabled={
                    deletingId === document.id
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === document.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

}