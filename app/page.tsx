"use client";

import { useState } from "react";

import DocumentUpload from "../components/DocumentUpload";
import DocumentList from "../components/DocumentList";
import ConversationSidebar from "../components/ConversationSidebar";
import ChatWindow from "../components/ChatWindow";

import type {
  ConversationSummary,
} from "../lib/api";


export default function Home() {
  const [
    refreshDocumentsKey,
    setRefreshDocumentsKey,
  ] = useState(0);

  const [
    refreshConversationsKey,
    setRefreshConversationsKey,
  ] = useState(0);


  const [
    selectedDocumentId,
    setSelectedDocumentId,
  ] = useState<number | null>(null);


  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<number | null>(null);


  const handleUploaded = () => {
    setRefreshDocumentsKey(
      (current) => current + 1
    );
  };


  const handleSelectDocument = (
    documentId: number | null
  ) => {
    setSelectedDocumentId(
      documentId
    );

    // A different document means
    // a new conversation context.
    setActiveConversationId(null);
  };


  const handleNewConversation = () => {
    setActiveConversationId(null);
    setSelectedDocumentId(null);
  };


  const handleSelectConversation = (
    conversation: ConversationSummary
  ) => {
    setActiveConversationId(
      conversation.id
    );

    setSelectedDocumentId(
      conversation.document_id
    );
  };


  const handleConversationCreated = (
    conversationId: number
  ) => {
    setActiveConversationId(
      conversationId
    );

    setRefreshConversationsKey(
      (current) => current + 1
    );
  };


  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Top upload area */}
        <div className="mb-6">
          <DocumentUpload
            onUploaded={
              handleUploaded
            }
          />
        </div>


        {/* Document list */}
        <div className="mb-6">
          <DocumentList
             refreshKey={refreshDocumentsKey}
  selectedDocumentId={selectedDocumentId}
  onSelectDocument={handleSelectDocument}
          />
        </div>


        {/* Main workspace */}
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">

          {/* Conversations */}
          <ConversationSidebar
            activeConversationId={
              activeConversationId
            }
            onSelectConversation={
              handleSelectConversation
            }
            onNewConversation={
              handleNewConversation
            }
            refreshKey={
              refreshConversationsKey
            }
          />


          {/* Chat */}
          <ChatWindow
            conversationId={
              activeConversationId
            }
            selectedDocumentId={
              selectedDocumentId
            }
            onConversationCreated={
              handleConversationCreated
            }
          />

        </div>

      </div>
    </main>
  );
}