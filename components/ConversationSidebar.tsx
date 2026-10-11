"use client";

import { useEffect, useState } from "react";

import {
  deleteConversation,
  getConversations,
} from "../lib/api";

import type {
  ConversationSummary,
} from "../lib/api";


interface ConversationSidebarProps {
  activeConversationId: number | null;

  onSelectConversation: (
    conversation: ConversationSummary
  ) => void;

  onNewConversation: () => void;

  refreshKey?: number;
}


export default function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  refreshKey = 0,
}: ConversationSidebarProps) {
  const [
    conversations,
    setConversations,
  ] = useState<ConversationSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");


  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getConversations();

      setConversations(data);
    } catch (loadError) {
      console.error(
        "Failed to load conversations:",
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load conversations."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadConversations();
  }, [refreshKey]);


  const handleDelete = async (
    conversationId: number
  ) => {
    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(conversationId);

      await deleteConversation(
        conversationId
      );

      setConversations(
        (currentConversations) =>
          currentConversations.filter(
            (conversation) =>
              conversation.id !==
              conversationId
          )
      );

      if (
        activeConversationId ===
        conversationId
      ) {
        onNewConversation();
      }
    } catch (deleteError) {
      console.error(
        "Conversation deletion failed:",
        deleteError
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete conversation."
      );
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <aside className="flex min-h-[75vh] flex-col rounded-3xl border border-gray-200 bg-white p-4">

      {/* Header */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Aegis
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Conversations
          </h2>

          <button
            type="button"
            onClick={onNewConversation}
            className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-800"
          >
            + New Chat
          </button>
        </div>
      </div>


      {/* Error */}
      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}


      {/* Conversation list */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {loading ? (
          <p className="px-2 py-4 text-xs text-gray-500">
            Loading conversations...
          </p>
        ) : conversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-3 py-5 text-center">
            <p className="text-xs text-gray-500">
              No conversations yet.
            </p>
          </div>
        ) : (
          conversations.map(
            (conversation) => {
              const isActive =
                activeConversationId ===
                conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={`group rounded-xl border transition ${
                    isActive
                      ? "border-black bg-gray-50"
                      : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelectConversation(
                        conversation
                      )
                    }
                    className="w-full px-3 py-3 text-left"
                  >
                    <p className="truncate text-sm font-medium text-gray-900">
                      {conversation.title}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      {new Date(
                        conversation.updated_at
                      ).toLocaleString()}
                    </p>
                  </button>

                  <div className="border-t border-gray-100 px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          conversation.id
                        )
                      }
                      disabled={
                        deletingId ===
                        conversation.id
                      }
                      className="text-[11px] font-medium text-gray-400 transition hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId ===
                      conversation.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>
    </aside>
  );
}