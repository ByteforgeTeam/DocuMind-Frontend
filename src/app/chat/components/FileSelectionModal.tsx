import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";

interface FileSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  onToggleFile: (fileId: string) => void;
}

export default function FileSelectionModal({
  open,
  onOpenChange,
  selectedFileIds,
  onToggleFile,
}: FileSelectionModalProps) {
  const { data: availableFiles, isLoading, error } = useDocuments();

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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-destructive">
                Failed to load documents. Please try again.
              </p>
            </div>
          ) : !availableFiles || availableFiles.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableFiles.map((file) => {
                const isSelected = selectedFileIds.includes(file.id.toString());
                return (
                  <button
                    key={file.id}
                    onClick={() => onToggleFile(file.id.toString())}
                    className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                      isSelected ? "border-primary bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on{" "}
                          {new Date(file.uploaded_at).toLocaleDateString()}
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
          )}
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
