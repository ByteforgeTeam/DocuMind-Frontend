"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/hooks/useDocuments";
import { useCreateConversation } from "@/hooks/useConversations";
import { toast } from "sonner";

import ChatInput from "./components/ChatInput";

export default function ChatPage() {
  const router = useRouter();
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const { data: documents, isLoading: isLoadingDocuments } = useDocuments();
  const { mutate: createConversation, isPending } = useCreateConversation();

  const handleDocumentToggle = (docId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSendMessage = async (message: string) => {
    if (selectedDocuments.length === 0) {
      toast.error("Please select a document first");
      return;
    }

    const body = {
      initial_message: message,
      document_ids: selectedDocuments,
    };

    createConversation(body, {
      onSuccess: (data) => {
        toast.success("Conversation created successfully!");
        router.push(`/chat/${data.id}`);
      },
    });
  };

  return (
    <>
      <div className="flex flex-1 flex-col h-full items-center justify-center p-8">
        <div className="max-w-3xl w-full space-y-8">
          {/* Welcome Message */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Hello! 👋</h1>
            <p className="text-lg text-muted-foreground">
              Please select one or more documents you want to ask about
            </p>
          </div>

          {/* Document Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Select Documents</label>
            {isLoadingDocuments ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading documents...
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocumentToggle(doc.id)}
                    className={`cursor-pointer w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedDocuments.includes(doc.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedDocuments.includes(doc.id)
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {selectedDocuments.includes(doc.id) && (
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            fill="none"
                            strokeWidth="2"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{doc.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          Uploaded:{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString(
                            "en-US"
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No documents available. Please upload documents first.
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isPending} />
        </div>
      </div>
    </>
  );
}
