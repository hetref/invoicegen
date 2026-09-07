"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Loader2, CloudUpload, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceUploadProps {
  onUploadComplete?: () => void;
  currentGroupId?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceUpload({
  onUploadComplete,
  currentGroupId,
  isOpen,
  onOpenChange,
}: InvoiceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported File Type",
        description: "Please select a PDF document or image file (PNG, JPEG, WebP).",
        variant: "destructive",
      });
      return false;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 20 MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFile(files[0]);
      }
    },
    []
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Step 1: Get presigned URL
      const uploadResponse = await fetch("/api/invoices/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        if (uploadResponse.status === 413) {
          toast({
            title: "Storage Limit Exceeded",
            description: errorData.message || "You have reached your storage limit.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadUrl, invoiceId, r2Key } = await uploadResponse.json();

      // Step 2: Upload file to R2 using presigned URL
      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload file to storage");
      }

      // Step 3: Save invoice metadata
      const metadataResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: invoiceId,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          r2Key,
          groupId: currentGroupId || null,
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error("Failed to save invoice record");
      }

      toast({
        title: "Upload Completed",
        description: `Successfully uploaded ${selectedFile.name}`,
      });

      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent component
      onUploadComplete?.();

      // Close the upload card after successful upload
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="animate-in fade-in-50 slide-in-from-top-3 duration-200">
        <Card
          className={`border-2 border-dashed transition-all relative overflow-hidden ${
            isDragging
              ? "border-primary bg-primary/5 shadow-md scale-[1.005]"
              : "border-border/80 hover:border-primary/50 bg-card/60"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Close upload panel"
          >
            <X className="h-4 w-4" />
          </button>

          <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary mb-3.5 ring-8 ring-primary/5">
              <CloudUpload className="h-7 w-7" />
            </div>

            <h3 className="text-base font-semibold tracking-tight mb-1">
              Upload Invoices
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              Drag and drop your PDF or image invoice here, or click to browse from your device.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInput}
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                className="gap-2 text-xs font-medium h-9 shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Browse Files
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
              <span className="text-[11px] text-muted-foreground mr-1">Accepted:</span>
              <Badge variant="secondary" className="text-[10px] font-mono font-normal">PDF</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono font-normal">PNG</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono font-normal">JPG</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono font-normal">WebP</Badge>
              <span className="text-[11px] text-muted-foreground ml-1">(Up to 20MB)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
          <DialogHeader className="p-4 sm:p-5 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base">Upload Invoice Confirmation</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Review invoice file details before uploading to secure storage
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {selectedFile && (
              <div className="p-3 rounded-xl border bg-muted/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || "Document"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {previewUrl && selectedFile && (
              <div className="border rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center max-h-[420px]">
                {selectedFile.type === "application/pdf" ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[400px] border-0"
                    title="Invoice Preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Invoice Preview"
                    className="w-full h-auto max-h-[400px] object-contain p-2"
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isUploading}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={isUploading}
              className="text-xs h-9 gap-1.5 font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudUpload className="h-3.5 w-3.5" />
                  Confirm & Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
