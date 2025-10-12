"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useConversationDetail,
  useSendMessage,
} from "@/hooks/useConversations";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import ChatInput from "../components/ChatInput";
import "./css/markdown.css";

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

function AssistantMessage({
  content,
  isTyping,
  onTypingComplete,
}: {
  content: string;
  isTyping: boolean;
  onTypingComplete: () => void;
}) {
  const { displayedText } = useTypingEffect({
    text: content,
    speed: 25,
    onComplete: onTypingComplete,
  });

  const textToRender = isTyping ? displayedText : content;

  return (
    <div className="text-sm markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{textToRender}</ReactMarkdown>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.itemId as string;

  const { data: conversationData, isLoading } =
    useConversationDetail(conversationId);

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const previousMessageCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (message: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      await sendMessage({
        conversation_id: Number(conversationId),
        content: message,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

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

      // Detect new assistant message (only after initial load)
      const currentMessageCount = transformedMessages.length;
      const previousCount = previousMessageCountRef.current;

      if (!isInitialLoadRef.current && currentMessageCount > previousCount) {
        // Check if the newest message is from assistant
        const newestMessage = transformedMessages[currentMessageCount - 1];
        if (newestMessage && newestMessage.role === "assistant") {
          setTypingMessageId(newestMessage.id);
        }
      }

      // Mark initial load as complete after first render
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }

      previousMessageCountRef.current = currentMessageCount;
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
    <div className="flex flex-col h-full">
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
                  {message.role === "assistant" ? (
                    <AssistantMessage
                      content={message.content}
                      isTyping={typingMessageId === message.id}
                      onTypingComplete={() => setTypingMessageId(null)}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
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
            {(isLoading || isSending) && (
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

      {/* Chat Input - Always at the bottom */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isSending} />
        </div>
      </div>
    </div>
  );
}
