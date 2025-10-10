"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/hooks/useDocuments";
import { useCreateConversation } from "@/hooks/useConversations";
import { toast } from "sonner";
import { FileText } from "lucide-react";

import ChatInput from "./components/ChatInput";
import { Upload } from "@/app/files/Controls/Upload";

export default function ChatPage() {
  const router = useRouter();
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch,
  } = useDocuments();

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
        router.push(`/chat/${data.id}`);
      },
    });
  };

  const handleUploadSuccess = () => {
    refetch();
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
            {/* Label hanya tampil jika ada dokumen atau loading */}
            {(isLoadingDocuments || (documents && documents.length > 0)) && (
              <label className="text-sm font-medium">Select Documents</label>
            )}
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
              <div className="border-2 border-dashed border-border rounded-xl p-12 bg-muted/30">
                <div className="text-center space-y-6">
                  {/* Icon/Ilustrasi */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl"></div>
                      <FileText className="relative w-20 h-20 text-muted-foreground/50" />
                    </div>
                  </div>
                  {/* Pesan */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No Documents Yet</h3>
                    <p className="text-muted-foreground">
                      Upload a document first to start a conversation
                    </p>
                  </div>
                  {/* Upload Button */}
                  <Upload onFilesUpload={handleUploadSuccess} />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isPending} />
        </div>
      </div>

      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-card rounded-xl shadow-2xl p-10 flex flex-col items-center gap-6 border border-primary/20 w-full max-w-md mx-4">
            <div className="w-full space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Creating Conversation</p>
                <p className="text-sm text-muted-foreground">
                  Please wait a moment...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-2">
                <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full"
                    style={{
                      animation: "progress 1.5s ease-in-out infinite",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 75%;
            margin-left: 12.5%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </>
  );
}
