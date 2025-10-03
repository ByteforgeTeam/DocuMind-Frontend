"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const PDFViewer = dynamic(
  () =>
    import("@/components/chat/PDFViewer").then((mod) => ({
      default: mod.PDFViewer,
    })),
  { ssr: false }
);

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );
  const [highlightedCitationId, setHighlightedCitationId] = useState<
    string | null
  >(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "This is a placeholder response with citations [1] and references [2]. Connect to your AI backend to get real responses.",
        timestamp: new Date(),
        citations: [
          {
            id: "cite-1",
            documentId: "doc-1",
            documentName: "sample-pdf-file.pdf",
            documentUrl: "/example-file/sample-pdf-file.pdf",
            pageNumber: 1,
            text: "This is a sample excerpt from the document that was referenced in the answer.",
            boundingBoxes: [{ x: 100, y: 200, width: 400, height: 60 }],
          },
          {
            id: "cite-2",
            documentId: "doc-1",
            documentName: "sample-pdf-file.pdf",
            documentUrl: "/example-file/sample-pdf-file.pdf",
            pageNumber: 1,
            text: "Another relevant passage from the document that supports the AI's response.",
            boundingBoxes: [{ x: 100, y: 400, width: 400, height: 80 }],
          },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
  }, [messages]);

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
    setHighlightedCitationId(citation.id);
    setIsPreviewOpen(true);

    // Scroll to citation in preview
    setTimeout(() => {
      const citationElement = document.getElementById(`preview-${citation.id}`);
      if (citationElement && previewRef.current) {
        citationElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const renderMessageContent = (message: Message) => {
    if (
      message.role === "user" ||
      !message.citations ||
      message.citations.length === 0
    ) {
      return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }

    // Parse content and replace citation markers with clickable links
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Find all citation markers like [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g;
    let match;

    while ((match = citationRegex.exec(message.content)) !== null) {
      const citationIndex = parseInt(match[1]) - 1;
      const citation = message.citations[citationIndex];

      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {message.content.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add citation link
      if (citation) {
        parts.push(
          <button
            key={`cite-${citation.id}`}
            onClick={() => handleCitationClick(citation)}
            className="inline-flex items-center text-primary hover:underline font-medium"
          >
            [{match[1]}]
          </button>
        );
      } else {
        parts.push(<span key={`cite-missing-${match.index}`}>{match[0]}</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < message.content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {message.content.slice(lastIndex)}
        </span>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{parts}</p>;
  };

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
                    {renderMessageContent(message)}
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

        {/* Chat Input */}
        <div className="border-t bg-background px-4 py-2">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Document Preview Sheet */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Preview
            </SheetTitle>
            {selectedCitation && (
              <SheetDescription>
                {selectedCitation.documentName}
              </SheetDescription>
            )}
          </SheetHeader>

          <div
            ref={previewRef}
            className="h-[calc(100vh-80px)] overflow-hidden"
          >
            {!selectedCitation ? (
              <div className="flex h-full items-center justify-center p-4">
                <div className="text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Click on a citation in the chat to view the referenced
                    passage
                  </p>
                </div>
              </div>
            ) : (
              <PDFViewer
                fileUrl={selectedCitation.documentUrl}
                targetPage={selectedCitation.pageNumber}
                highlights={messages
                  .filter((m) => m.role === "assistant" && m.citations)
                  .flatMap((m) => m.citations || [])
                  .filter((c) => c.documentUrl === selectedCitation.documentUrl)
                  .map((citation) => ({
                    pageNumber: citation.pageNumber,
                    rects: citation.boundingBoxes,
                  }))}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
