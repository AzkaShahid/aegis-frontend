"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getConversation,
  streamRag,
} from "../lib/api";

import type {
  ChatMessage,
} from "../types/chat";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";


interface ChatWindowProps {
  conversationId: number | null;
  selectedDocumentId: number | null;
  onConversationCreated: (
    conversationId: number
  ) => void;
}


const createWelcomeMessage =
  (): ChatMessage => ({
    id: crypto.randomUUID(),
    role: "assistant",
    content:
  "Hello! I'm Aegis. Ask me anything, or select a document to use document-grounded RAG.",
    status: "done",
  });


export default function ChatWindow({
  conversationId,
  selectedDocumentId,
  onConversationCreated,
}: ChatWindowProps) {

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>([
    createWelcomeMessage(),
  ]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  // When the server creates a new conversation,
  // we don't want the conversation-loading effect
  // to immediately fetch it again while streaming.
  const skipLoadRef =
    useRef<number | null>(null);


  useEffect(() => {
    let cancelled = false;


    const loadConversation = async () => {

      // New chat
      if (conversationId === null) {
        setMessages([
          createWelcomeMessage(),
        ]);

        return;
      }


      // New conversation was just created
      // by the current streaming request.
      if (
        skipLoadRef.current ===
        conversationId
      ) {
        skipLoadRef.current = null;
        return;
      }


      try {
        setLoading(true);

        const conversation =
          await getConversation(
            conversationId
          );

        if (cancelled) {
          return;
        }


        const restoredMessages =
          conversation.messages.map(
            (message) => ({
              id: String(
                message.id
              ),

              role: message.role,

              content:
                message.content,

              sources:
                message.sources ?? [],

              status: "done" as const,
            })
          );


        setMessages(
          restoredMessages.length > 0
            ? restoredMessages
            : [
                createWelcomeMessage(),
              ]
        );

      } catch (error) {
        console.error(
          "Failed to load conversation:",
          error
        );

        if (!cancelled) {
          setMessages([
            {
              id:
                crypto.randomUUID(),

              role: "assistant",

              content:
                "I couldn't load this conversation.",

              status: "done",
            },
          ]);
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };


    loadConversation();


    return () => {
      cancelled = true;
    };

  }, [conversationId]);


  const handleSend = async (
    content: string
  ) => {

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      status: "done",
    };


    const assistantId =
      crypto.randomUUID();


    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
      status: "thinking",
    };


    setMessages(
      (currentMessages) => [
        ...currentMessages,
        userMessage,
        assistantMessage,
      ]
    );


    try {
      setLoading(true);


      await streamRag(
        content,

        selectedDocumentId ??
          undefined,

        conversationId ??
          undefined,

        {
          onConversation: (
            newConversationId
          ) => {

            // Prevent immediate reload.
            skipLoadRef.current =
              newConversationId;

            onConversationCreated(
              newConversationId
            );
          },


          onSources: (
            sources
          ) => {

            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,
                          sources,
                          status:
                            "generating",
                        }
                      : message
                )
            );
          },


          onToken: (
            token
          ) => {

            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,

                          content:
                            message.content +
                            token,

                          status:
                            "generating",
                        }
                      : message
                )
            );
          },
        }
      );


      setMessages(
        (currentMessages) =>
          currentMessages.map(
            (message) =>
              message.id ===
              assistantId
                ? {
                    ...message,
                    status: "done",
                  }
                : message
          )
      );

    } catch (error) {

      console.error(
        "RAG streaming request failed:",
        error
      );


      setMessages(
        (currentMessages) =>
          currentMessages.map(
            (message) =>
              message.id ===
              assistantId
                ? {
                    ...message,

                    content:
                      "Sorry, I couldn't process your question.",

                    status:
                      "done",
                  }
                : message
          )
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex h-[75vh] flex-col rounded-3xl border border-gray-200 bg-white">

      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-5">

        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
          Aegis AI
        </p>

        <h1 className="mt-1 text-xl font-semibold">
          Intelligence Workspace
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          AI-powered document intelligence.
        </p>

        <p className="mt-2 text-xs text-gray-400">
          {selectedDocumentId
  ? "Document RAG mode · Searching the selected document."
  : "General AI mode · No document context."}
        </p>

      </div>


      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        <div className="mx-auto max-w-3xl space-y-5">

          {messages.map(
            (message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            )
          )}

        </div>

      </div>


      {/* Input */}
      <div className="border-t border-gray-100 p-4">

        <div className="mx-auto max-w-3xl">

          <ChatInput
            onSend={handleSend}
            disabled={loading}
          />

        </div>

      </div>

    </div>
  );
}