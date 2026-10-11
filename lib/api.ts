
const BACKEND_URL = "http://127.0.0.1:8000";


// ==================================================
// RAG
// ==================================================

export interface RagSource {
  document_id: number;
  filename: string;
  page_number: number;
  similarity: number;
}

export interface RagResponse {
  question: string;
  answer: string;
  sources: RagSource[];
}


export async function askRag(
  question: string,
  documentId?: number
): Promise<RagResponse> {
  const response = await fetch(
    `${BACKEND_URL}/api/rag`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        top_k: 3,
        document_id: documentId ?? null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `RAG request failed: ${response.status}`
    );
  }

  return response.json();
}


// ==================================================
// Document Upload
// ==================================================

export interface DocumentUploadResponse {
  message: string;
  document_id: number;
  filename: string;
  page_count: number;
  text_length: number;
  chunk_count: number;
}


export async function uploadDocument(
  file: File
): Promise<DocumentUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${BACKEND_URL}/api/documents/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    let message = `Upload failed: ${response.status}`;

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  return response.json();
}


// ==================================================
// Conversations
// ==================================================

export interface ConversationSummary {
  id: number;
  title: string;
  document_id: number | null;
  created_at: string;
  updated_at: string;
}


export interface ConversationMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources: RagSource[];
  created_at: string;
}


export interface ConversationDetail {
  id: number;
  title: string;
  document_id: number | null;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
}


export async function getConversation(
  conversationId: number
): Promise<ConversationDetail> {
  const response = await fetch(
    `${BACKEND_URL}/api/conversations/${conversationId}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load conversation: ${response.status}`
    );
  }

  return response.json();
}


export async function getConversations(): Promise<
  ConversationSummary[]
> {
  const response = await fetch(
    `${BACKEND_URL}/api/conversations`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load conversations: ${response.status}`
    );
  }

  return response.json();
}


export async function deleteConversation(
  conversationId: number
): Promise<void> {
  const response = await fetch(
    `${BACKEND_URL}/api/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete conversation: ${response.status}`
    );
  }
}


// ==================================================
// Document List
// ==================================================

export interface DocumentItem {
  id: number;
  filename: string;
  content_type: string;
  page_count: number;
  created_at: string;
}


export async function getDocuments(): Promise<
  DocumentItem[]
> {
  const response = await fetch(
    `${BACKEND_URL}/api/documents`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load documents: ${response.status}`
    );
  }

  return response.json();
}


// ==================================================
// Delete Document
// ==================================================

export async function deleteDocument(
  documentId: number
): Promise<void> {
  const response = await fetch(
    `${BACKEND_URL}/api/documents/${documentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    let message = `Delete failed: ${response.status}`;

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }
}


// ==================================================
// Streaming RAG
// ==================================================

export interface RagStreamHandlers {
  onConversation?: (
    conversationId: number
  ) => void;

  onSources: (
    sources: RagSource[]
  ) => void;

  onToken: (
    token: string
  ) => void;
}

export async function streamRag(
  question: string,
  documentId: number | undefined,
  conversationId: number | undefined,
  handlers: RagStreamHandlers
): Promise<void> {
  const response = await fetch(
    `${BACKEND_URL}/api/rag/stream`,
    {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        question,
        top_k: 3,
        document_id: documentId ?? null,
        conversation_id: conversationId ?? null,
      }),
    }
  );

  if (!response.ok) {
    let message =
      `RAG streaming request failed: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep default message
    }

    throw new Error(message);
  }

  if (!response.body) {
    throw new Error(
      "Streaming response body is unavailable."
    );
  }

  const reader =
    response.body.getReader();

  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(
      value,
      { stream: true }
    );

    let separatorIndex;

    while (
      (separatorIndex =
        buffer.indexOf("\n\n")) !== -1
    ) {
      const eventBlock =
        buffer.slice(
          0,
          separatorIndex
        );

      buffer = buffer.slice(
        separatorIndex + 2
      );

      const lines =
        eventBlock.split(/\r?\n/);

      let eventType = "message";
      let data = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType =
            line.slice(6).trim();
        }

        if (line.startsWith("data:")) {
          data += line
            .slice(5)
            .trim();
        }
      }

      if (!data) {
        continue;
      }

      const payload =
        JSON.parse(data);

      if (eventType === "conversation") {
        handlers.onConversation?.(
          payload.conversation_id
        );
      }

      if (eventType === "sources") {
        handlers.onSources(
          payload.sources ?? []
        );
      }

      if (eventType === "token") {
        handlers.onToken(
          payload.content ?? ""
        );
      }

      if (eventType === "error") {
        throw new Error(
          payload.message ??
            "RAG streaming failed."
        );
      }

      if (eventType === "done") {
        return;
      }
    }
  }
}