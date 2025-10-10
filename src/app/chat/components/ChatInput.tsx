import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, Files, X, FileText } from "lucide-react";
import FileSelectionModal from "./FileSelectionModal";
import { useDocuments } from "@/hooks/useDocuments";

interface ChatInputProps {
  onSendMessage: (message: string, selectedFileIds: string[]) => void;
  isLoading: boolean;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const { data: availableFiles } = useDocuments();

  const selectedFiles =
    availableFiles?.filter((file) =>
      selectedFileIds.includes(file.id.toString())
    ) || [];

  const handleToggleFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim(), selectedFileIds);
    setInput("");
  };

  return (
    <div className="border-t bg-background">
      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="border-b px-4 py-2">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{file.filename}</span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveFile(file.id.toString())}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="px-4 py-2">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setIsModalOpen(true)}
                >
                  <Files className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose Uploaded Files</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

      <FileSelectionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedFileIds={selectedFileIds}
        onToggleFile={handleToggleFile}
      />
    </div>
  );
}
