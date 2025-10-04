"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2 } from "lucide-react";
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

export function InvoiceUpload({ onUploadComplete, currentGroupId, isOpen, onOpenChange }: InvoiceUploadProps) {
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
        title: "Invalid file type",
        description: "Please upload a PDF or image file (PNG, JPEG, WebP)",
        variant: "destructive",
      });
      return false;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 20MB",
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
            description: errorData.message || "You have reached your storage limit of 40 MB.",
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
        throw new Error("Failed to upload file");
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
        throw new Error("Failed to save invoice metadata");
      }

      toast({
        title: "Success!",
        description: "Invoice uploaded successfully",
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
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
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

  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Upload Invoice</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Drag and drop your invoice file here, or click to browse
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInput}
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Browse Files
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: PDF, PNG, JPEG, WebP (Max 20MB)
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="mt-4"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview Invoice</DialogTitle>
            <DialogDescription>
              Review your invoice before uploading
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            {selectedFile && (
              <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {previewUrl && selectedFile && (
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {selectedFile.type === "application/pdf" ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[500px]"
                    title="Invoice Preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Invoice Preview"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Confirm & Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

