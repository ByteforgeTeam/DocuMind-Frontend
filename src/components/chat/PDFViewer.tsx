"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Highlight {
  pageNumber: number;
  rects: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface PDFViewerProps {
  fileUrl: string;
  highlights?: Highlight[];
  targetPage?: number;
  onLoadSuccess?: () => void;
}

export function PDFViewer({
  fileUrl,
  highlights = [],
  targetPage,
  onLoadSuccess,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  useEffect(() => {
    if (targetPage && targetPage !== pageNumber) {
      setPageNumber(targetPage);
    }
  }, [targetPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (onLoadSuccess) {
      onLoadSuccess();
    }
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const currentPageHighlights = highlights.filter(
    (h) => h.pageNumber === pageNumber
  );

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 border-b bg-background px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2 min-w-[80px] text-center">
            {pageNumber} / {numPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div className="mx-auto w-fit relative">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="text-sm text-muted-foreground">
                  Loading PDF...
                </div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-96">
                <div className="text-sm text-destructive">
                  Failed to load PDF
                </div>
              </div>
            }
          >
            <div className="relative">
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />

              {/* Highlight overlays */}
              {currentPageHighlights.map((highlight, idx) =>
                highlight.rects.map((rect, rectIdx) => (
                  <div
                    key={`${idx}-${rectIdx}`}
                    className="absolute bg-yellow-300/40 border border-yellow-500/60 pointer-events-none"
                    style={{
                      left: `${rect.x * scale}px`,
                      top: `${rect.y * scale}px`,
                      width: `${rect.width * scale}px`,
                      height: `${rect.height * scale}px`,
                    }}
                  />
                ))
              )}
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
}
