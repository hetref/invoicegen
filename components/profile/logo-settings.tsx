"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileImage,
} from "lucide-react";

interface LogoSettingsProps {
  currentLogoUrl?: string | null;
  onLogoUpdated?: (url: string | null) => void;
}

export function LogoSettings({ currentLogoUrl, onLogoUpdated }: LogoSettingsProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (file: File) => {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PNG, JPG, SVG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Logo file size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload logo");
      }

      const data = await response.json();
      const newUrl = data.logoUrl || `/api/profile/logo?t=${Date.now()}`;
      setLogoUrl(newUrl);
      if (onLogoUpdated) onLogoUpdated(newUrl);

      toast({
        title: "Logo Uploaded",
        description: "Your brand logo has been saved to cloud storage and will be available for invoices.",
      });
    } catch (error: any) {
      console.error("Logo upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteLogo = async () => {
    try {
      setDeleting(true);
      const response = await fetch("/api/profile/logo", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete logo");
      }

      setLogoUrl(null);
      if (onLogoUpdated) onLogoUpdated(null);

      toast({
        title: "Logo Removed",
        description: "Company logo removed from your account and cloud storage.",
      });
    } catch (error: any) {
      console.error("Logo deletion error:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to remove logo",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Brand & Company Logo</CardTitle>
              <CardDescription className="text-xs">
                Upload your business logo to brand newly created invoices and PDF exports
              </CardDescription>
            </div>
          </div>
          {logoUrl && (
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Logo Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          disabled={uploading || deleting}
        />

        {logoUrl ? (
          /* Active Logo Display */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
              <div className="flex items-center gap-4">
                {/* Checkerboard Pattern for transparent logo rendering */}
                <div
                  className="w-24 h-16 sm:w-32 sm:h-20 rounded-lg border border-border/80 flex items-center justify-center p-2 shadow-2xs overflow-hidden shrink-0"
                  style={{
                    backgroundColor: "#ffffff",
                    backgroundImage:
                      "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                    backgroundSize: "12px 12px",
                    backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
                  }}
                >
                  <img
                    src={logoUrl}
                    alt="Company Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-foreground">Current Invoice Logo</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Automatically available with a single checkbox toggle when creating or editing invoices.
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground font-mono">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Saved in Cloud Storage (AWS S3 / R2)</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || deleting}
                  className="h-8 text-xs gap-1.5"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span>Replace</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteLogo}
                  disabled={uploading || deleting}
                  className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Remove</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Dropzone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/60 hover:border-border hover:bg-muted/30"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>

            <div className="space-y-1 max-w-sm">
              <p className="text-xs font-semibold text-foreground">
                {uploading ? "Uploading logo to cloud storage..." : "Click or drag your logo here"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                PNG, JPEG, SVG, or WebP up to 5MB. Transparent PNG or SVG recommended for best invoice presentation.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              className="mt-1 h-7 text-xs gap-1.5"
            >
              <FileImage className="h-3.5 w-3.5" />
              <span>Select File</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
