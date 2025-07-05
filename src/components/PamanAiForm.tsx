"use client";

import { askPamanAiAction } from "@/action/pamanAiAction";
import { ArrowUp, Loader2 } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ReactMarkdown from "react-markdown";

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
    const currentInput = input;
    setInput("");

    startTransition(async () => {
      // Untuk Paman AI, kita tidak perlu mengirim riwayat chat dari client
      // karena konteks selalu diambil dari database materi.
      const result = await askPamanAiAction(currentInput, []);

      if ("response" in result && result.response) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: result.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error("Gagal mendapatkan respon AI.");
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  };

  return (
    <div className="flex flex-col h-[70vh] w-full max-w-3xl mx-auto bg-white rounded-lg shadow-xl border">
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
              className={`max-w-full lg:max-w-2xl p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {/* --- PERBAIKAN UTAMA DI SINI --- */}
              {msg.role === "assistant" ? (
                // Gunakan kelas 'prose' untuk styling otomatis dari tailwindcss-typography
                <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-green-800">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                // Untuk pesan user, tampilkan seperti biasa
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
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

      <div className="p-4 border-t bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
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
