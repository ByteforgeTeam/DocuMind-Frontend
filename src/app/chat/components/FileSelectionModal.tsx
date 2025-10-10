import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface File {
  id: string;
  name: string;
  uploadedAt: string;
}

interface FileSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  onToggleFile: (fileId: string) => void;
}

// Hardcoded files list
const availableFiles: File[] = [
  { id: "1", name: "document-1.pdf", uploadedAt: "2024-01-15" },
  { id: "2", name: "research-paper.pdf", uploadedAt: "2024-01-14" },
  { id: "3", name: "meeting-notes.pdf", uploadedAt: "2024-01-13" },
  { id: "4", name: "project-proposal.pdf", uploadedAt: "2024-01-12" },
  { id: "5", name: "technical-specs.pdf", uploadedAt: "2024-01-11" },
];

export default function FileSelectionModal({
  open,
  onOpenChange,
  selectedFileIds,
  onToggleFile,
}: FileSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Uploaded Files</DialogTitle>
          <DialogDescription>
            Select files to use in your conversation
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {availableFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <button
                  key={file.id}
                  onClick={() => onToggleFile(file.id)}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                    isSelected ? "border-primary bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
