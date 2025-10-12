"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, File, X } from "lucide-react";
import { toast } from "sonner";

interface FileData {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT";
  size: string;
  uploadedDate: string;
}

interface UploadProps {
  onFilesUpload: (files: FileData[]) => void;
}

export function Upload({ onFilesUpload }: UploadProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/document/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data, file) => {
      const fileExtension = file.name.split(".").pop()?.toUpperCase();
      const fileType = ["PDF", "DOCX", "TXT"].includes(fileExtension || "")
        ? (fileExtension as "PDF" | "DOCX" | "TXT")
        : "TXT";

      const newFile: FileData = {
        id: data.id || Date.now().toString(),
        name: file.name,
        type: fileType,
        size: formatFileSize(file.size),
        uploadedDate: new Date().toISOString().split("T")[0],
      };

      onFilesUpload([newFile]);
      toast.success("File uploaded successfully");
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    multiple: false,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <File className="w-4 h-4 text-red-500" />;
      case "docx":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "txt":
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      uploadMutation.mutate(selectedFiles[0]);
    }
  };

  const handleCloseModal = () => {
    setSelectedFiles([]);
    setIsUploadModalOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsUploadModalOpen(true)}>
        <UploadIcon className="w-4 h-4 mr-2" />
        Upload Files
      </Button>

      <Dialog open={isUploadModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Drag and drop your files here or click to browse. Supported
              formats: PDF, DOCX, TXT
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <UploadIcon className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary font-medium">
                  Drop the files here...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOCX, and TXT files
                  </p>
                </div>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Files ready to upload:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getFileIcon(file.name)}
                        <span className="text-sm font-medium truncate">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            {selectedFiles.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload file"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
