"use client";

import { askPamanAiAction } from "@/action/pamanAiAction";
import { ArrowUp, Loader2 } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ReactMarkdown from "react-markdown";

// Tipe untuk pesan
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function PamanAiForm() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      const result = await askPamanAiAction(input, messages);

      if (result.error) {
        toast.error(result.error);
        setMessages((prev) => prev.slice(0, -1));
      } else if (result.response) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: result.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    });
  };

  return (
    <div className="flex flex-col h-[70vh] w-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl border">
      <div
        ref={chatContainerRef}
        className="flex-1 p-6 space-y-4 overflow-y-auto"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1 className="text-2xl font-bold mb-2" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-xl font-semibold mb-2" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="mb-2 leading-relaxed" {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li className="list-disc list-inside" {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong className="font-semibold" {...props} />
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Paman AI sedang berpikir...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu tentang materi di sini..."
            className="flex-1"
            disabled={isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending || !input.trim()}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
