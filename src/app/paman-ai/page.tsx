"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useRef,
} from "react";
import ChatSidebar from "./ChatSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Loader2, Bot, User } from "lucide-react";
import { toast } from "sonner";
import {
  getConversationsAction,
  getMessagesAction,
  getResponseAndSaveHistoryAction,
} from "@/action/chatHistoryAction";

// Tipe data untuk pesan dan percakapan
type Message = { role: "user" | "assistant"; konten: string };
type Conversation = { id: string; judul: string };

// Tipe untuk response action
type ActionResponse =
  | { success: true; aiMessage: string; conversationId: string | null }
  | { success: false; errorMessage: string };

const PamanAiPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    const result = await getConversationsAction();
    if ("success" in result && result.success && result.data) {
      setConversations(result.data);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      const result = await getMessagesAction(activeConversationId);
      if ("success" in result && result.success && result.data) {
        setMessages(result.data as Message[]);
      }
    };
    fetchMessages();
  }, [activeConversationId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: "user", konten: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    startTransition(async () => {
      const result = (await getResponseAndSaveHistoryAction(
        activeConversationId,
        currentInput
      )) as ActionResponse;

      if (result.success) {
        const aiMessage: Message = {
          role: "assistant",
          konten: result.aiMessage,
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (!activeConversationId && result.conversationId) {
          setActiveConversationId(result.conversationId);
          fetchConversations();
        }
      } else {
        toast.error(result.errorMessage || "Gagal mendapatkan respon AI.");
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] bg-gradient-to-br from-green-50 to-blue-50">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />
      <main className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm">
        <div
          ref={chatContainerRef}
          className="flex-1 p-6 space-y-6 overflow-y-auto"
        >
          {messages.length === 0 && !isPending && (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  Paman AI
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Asisten AI untuk materi Papua Mandiri
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Mulai percakapan dengan bertanya tentang materi Papua
                    Mandiri di bawah ini.
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-lg flex items-start gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-green-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.konten}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isPending && (
            <div className="flex justify-start mb-4">
              <div className="max-w-lg flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white text-gray-800 border border-gray-200 p-4 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-gray-600">
                      Paman AI sedang berpikir...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-white/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu tentang materi Papua Mandiri..."
                disabled={isPending}
                className="pr-12 h-12 rounded-full border-2 border-gray-200 focus:border-green-400 focus:ring-green-400 bg-white/90 backdrop-blur-sm shadow-sm"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !input.trim()}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PamanAiPage;
