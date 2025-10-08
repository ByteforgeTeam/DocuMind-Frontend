"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileData {
  id: number;
  name: string;
  type: string;
  size?: string;
  uploadedDate: string;
  url?: string;
}

interface FilePreviewProps {
  file: FileData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreview({ file, isOpen, onOpenChange }: FilePreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [textContent, setTextContent] = useState<string>("");
  const [docxContent, setDocxContent] = useState<string>("");

  useEffect(() => {
    const loadFileContent = async () => {
      if (file && file.url) {
        if (file.type === "TXT") {
          try {
            const response = await fetch(file.url);
            const text = await response.text();
            setTextContent(text);
          } catch (error) {
            console.error("Error loading text file:", error);
            setTextContent("Error loading file content");
          }
        } else if (file.type === "DOCX") {
          try {
            const mammoth = (await import("mammoth")).default;
            const response = await fetch(file.url);
            const arrayBuffer = await response.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setDocxContent(result.value);
          } catch (error) {
            console.error("Error loading DOCX file:", error);
            setDocxContent("<p>Error loading DOCX file content</p>");
          }
        }
      }
    };

    if (isOpen) {
      setPageNumber(1);
      setTextContent("");
      setDocxContent("");
      loadFileContent();
    }
  }, [file, isOpen]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-8xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{file?.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {file?.type === "PDF" && file.url && (
            <div className="flex flex-col items-center gap-4">
              <Document
                file={file.url}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="border shadow-lg"
                />
              </Document>
              {numPages > 1 && (
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() =>
                      setPageNumber((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={pageNumber <= 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    onClick={() =>
                      setPageNumber((prev) => Math.min(prev + 1, numPages))
                    }
                    disabled={pageNumber >= numPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}

          {file?.type === "DOCX" && (
            <div
              className="prose max-w-none p-4 bg-white rounded border"
              dangerouslySetInnerHTML={{ __html: docxContent }}
            />
          )}

          {file?.type === "TXT" && (
            <pre className="whitespace-pre-wrap p-4 bg-gray-50 rounded border font-mono text-sm">
              {textContent}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
