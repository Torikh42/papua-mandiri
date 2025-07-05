"use client";

import { Button } from "@/components/ui/button";
import { MessageSquarePlus, MessageSquare, Bot } from "lucide-react";
import React from "react";

type Conversation = {
  id: string;
  judul: string;
};

type ChatSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
};

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: ChatSidebarProps) => {
  return (
    <div className="w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Paman AI</h1>
            <p className="text-sm text-gray-600">Papua Mandiri Assistant</p>
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white shadow-md transition-all duration-200 transform hover:scale-105"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Percakapan Baru
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Belum ada percakapan</p>
              <p className="text-gray-400 text-xs mt-1">
                Mulai chat baru untuk memulai
              </p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className={`w-full text-left p-3 rounded-xl text-sm flex items-center gap-3 transition-all duration-200 group ${
                  activeConversationId === convo.id
                    ? "bg-gradient-to-r from-green-100 to-blue-100 text-green-800 font-semibold shadow-sm border-2 border-green-200"
                    : "hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activeConversationId === convo.id
                      ? "bg-gradient-to-r from-green-400 to-blue-500 text-white"
                      : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{convo.judul}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Klik untuk membuka
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            AI Assistant untuk Papua Mandiri
          </p>
          <p className="text-xs text-gray-400 mt-1">Powered by Paman AI</p>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
