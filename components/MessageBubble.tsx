
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ChatMessage } from "../types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={
        isUser
          ? "flex justify-end"
          : "flex justify-start"
      }
    >
      <div
        className={
          isUser
            ? "max-w-2xl rounded-2xl bg-black px-5 py-3 text-sm text-white"
            : "max-w-2xl rounded-2xl bg-gray-100 px-5 py-4 text-sm text-gray-900"
        }
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div>
            {/* -------------------------------------------- */}
            {/* Thinking / generating status */}
            {/* -------------------------------------------- */}

            {message.status === "thinking" &&
            !message.content ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>
                  Finding relevant sources
                </span>

                <span className="flex gap-1">
                  <span className="animate-pulse">
                    .
                  </span>

                  <span className="animate-pulse [animation-delay:150ms]">
                    .
                  </span>

                  <span className="animate-pulse [animation-delay:300ms]">
                    .
                  </span>
                </span>
              </div>
            ) : (
              <>
                {/* -------------------------------------------- */}
                {/* Assistant answer */}
                {/* -------------------------------------------- */}

                {message.content ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {message.content}
                    </ReactMarkdown>

                    {/* Streaming cursor */}
                    {message.status ===
                      "generating" && (
                      <span className="ml-1 inline-block animate-pulse">
                        ▌
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      Generating answer
                    </span>

                    <span className="flex gap-1">
                      <span className="animate-pulse">
                        .
                      </span>

                      <span className="animate-pulse [animation-delay:150ms]">
                        .
                      </span>

                      <span className="animate-pulse [animation-delay:300ms]">
                        .
                      </span>
                    </span>
                  </div>
                )}

                {/* -------------------------------------------- */}
                {/* Sources */}
                {/* -------------------------------------------- */}

                {message.sources &&
                  message.sources.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Sources
                      </p>

                      <div className="space-y-2">
                        {message.sources.map(
                          (source, index) => (
                            <div
                              key={`${source.document_id}-${source.page_number}-${index}`}
                              className="rounded-xl border border-gray-200 bg-white px-3 py-2"
                            >
                              <p className="text-xs font-medium text-gray-800">
                                {source.filename}
                              </p>

                              <p className="text-xs text-gray-500">
                                Page{" "}
                                {source.page_number}
                                {" • "}
                                Relevance{" "}
                                {Math.round(
                                  source.similarity *
                                    100
                                )}
                                %
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

