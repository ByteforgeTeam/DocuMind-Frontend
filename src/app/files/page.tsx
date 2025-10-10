"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  FileText,
  File,
} from "lucide-react";
import api from "@/utils/api";
import { Upload } from "./Controls/Upload";

const FilePreview = dynamic(
  () =>
    import("@/components/dialogs/file/FilePreview").then((mod) => ({
      default: mod.FilePreview,
    })),
  { ssr: false }
);

interface DocumentResponse {
  id: number;
  filename: string;
  uploaded_at: string;
}

interface FileData {
  id: number;
  name: string;
  type: string;
  size?: string;
  uploadedDate: string;
  url?: string;
}

export default function FilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const res = await api.get("document/").json<DocumentResponse[]>();
        const formatted: FileData[] = res.map((doc) => ({
          id: doc.id,
          name: doc.filename,
          type: doc.filename.split(".").pop()?.toUpperCase() || "UNKNOWN",
          uploadedDate: new Date(doc.uploaded_at).toLocaleDateString(),
        }));
        setFiles(formatted);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (fileId: number) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setPreviewFile(file);
      setIsPreviewOpen(true);
    }
  };

  const handleDelete = async (fileId: number) => {
    try {
      await api.delete(`document/${fileId}`);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "text-red-600 bg-red-50 border-red-200";
      case "DOCX":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "TXT":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <File className="w-3 h-3" />;
      case "DOCX":
        return <FileText className="w-3 h-3" />;
      case "TXT":
        return <FileText className="w-3 h-3" />;
      default:
        return <File className="w-3 h-3" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-muted-foreground">
            Upload, manage, and organize your documents in one place
          </p>
        </div>
        <Upload onFilesUpload={() => {}} />
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">
              Loading documents...
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchTerm
                        ? "No files found matching your search."
                        : "No files available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 w-fit ${getFileTypeColor(
                            file.type
                          )}`}
                        >
                          {getFileTypeIcon(file.type)}
                          {file.type}
                        </span>
                      </TableCell>
                      <TableCell>{file.uploadedDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(file.id)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(file.id)}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FilePreview
        file={previewFile}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
}
