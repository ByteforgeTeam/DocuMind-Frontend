"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useConversationDetail } from "@/hooks/useConversations";

interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  documentUrl: string;
  pageNumber: number;
  text: string;
  // PDF coordinates for highlighting
  boundingBoxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.itemId as string;

  const { data: conversationData, isLoading } =
    useConversationDetail(conversationId);

  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Transform API messages to component Message format
  useEffect(() => {
    if (conversationData?.messages) {
      const transformedMessages: Message[] = conversationData.messages.map(
        (msg) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          citations: undefined, // TODO: Add citations mapping if API provides it
        })
      );
      setMessages(transformedMessages);
    }
  }, [conversationData]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
  }, [messages]);

  return (
    <>
      {/* Chat Panel */}
      <div className="flex flex-1 flex-col h-full">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-muted-foreground">
                  Start a conversation
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask questions about your documents
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <span className="mt-1 block text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-5 w-5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
