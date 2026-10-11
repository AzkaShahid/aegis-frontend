"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || disabled) {
      return;
    }

    setMessage("");

    await onSend(trimmedMessage);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        flex
        gap-3
        border
        border-gray-200
        rounded-2xl
        p-2
        bg-white
        shadow-sm
      "
    >
      <input
        value={message}
        onChange={(event) =>
          setMessage(event.target.value)
        }
        placeholder="Ask Aegis anything..."
        disabled={disabled}
        className="
          flex-1
          px-4
          py-3
          outline-none
          text-sm
          text-gray-900
          placeholder:text-gray-400
          disabled:opacity-50
        "
      />

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="
          px-5
          py-3
          rounded-xl
          bg-black
          text-white
          text-sm
          font-medium
          transition
          hover:bg-gray-800
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        {disabled ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}