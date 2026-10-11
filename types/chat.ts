export interface ChatSource {
  document_id: number;
  filename: string;
  page_number: number;
  similarity: number;
}

export type ChatMessageStatus =
  | "thinking"
  | "generating"
  | "done";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  status?: ChatMessageStatus;
}