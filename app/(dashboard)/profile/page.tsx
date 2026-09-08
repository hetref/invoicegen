"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  FileText,
  HardDrive,
  Folder,
  Upload,
  PenSquare,
  Save,
  X,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Camera,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { AiExtractionSettings } from "@/components/profile/ai-settings";
import { SmtpSettings } from "@/components/profile/smtp-settings";
import { LogoSettings } from "@/components/profile/logo-settings";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  logoUrl?: string | null;
  hasLogo?: boolean;
  createdAt: string;
  lastLoginMethod: string | null;
  hasUsedFreeExtraction: boolean;
  storageLimit?: number;
  maxInvoices?: number | null;
  role?: string;
}

interface ProfileStats {
  totalInvoices: number;
  totalSize: number;
  storageLimit: number;
  remainingStorage: number;
  percentUsed: string;
  maxInvoices?: number | null;
  uploadedInvoices: number;
  createdInvoices: number;
  invoicesThisMonth: number;
  totalGroups: number;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
      setEditedName(data.user.name);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogoUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to upload logo");
      }

      const data = await response.json();
      const newUrl = data.logoUrl || `/api/profile/logo?v=${Date.now()}`;
      setUser((prev) => (prev ? { ...prev, image: newUrl, logoUrl: newUrl } : null));

      toast({
        title: "Logo Saved",
        description: "Your logo is saved to AWS S3 storage and will appear on your invoices.",
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleDirectLogoDelete = async () => {
    try {
      setIsUploadingAvatar(true);
      const response = await fetch("/api/profile/logo", {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete logo");
      }

      setUser((prev) => (prev ? { ...prev, image: null, logoUrl: null } : null));
      toast({
        title: "Logo Removed",
        description: "Brand logo has been removed from cloud storage.",
      });
    } catch (error: any) {
      console.error("Error deleting logo:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to remove logo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      toast({
        title: "Validation Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setUser(data.user);
      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your display name has been updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not save profile changes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || "");
    setIsEditing(false);
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResendingVerification(true);
    try {
      const { sendVerificationEmail } = await import("@/lib/actions/auth-actions");
      const result = await sendVerificationEmail(user.email);

      if (result.success) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox and spam folder.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while sending verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-xs">Loading profile data...</span>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm">Failed to load account profile</p>
        <Button size="sm" variant="outline" onClick={fetchProfile} className="text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Account & Preferences</h1>
              <Badge variant="secondary" className="text-[11px] font-mono px-2 py-0.5">
                {user.role || "User"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage your personal credentials, storage limits, AI providers, and email delivery.
            </p>
          </div>

          {user.emailVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="h-8 text-xs gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Button>
          )}
        </div>

        {/* Email Verification Warning for Unverified Users */}
        {!user.emailVerified && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="ml-2 space-y-2">
              <p className="font-semibold text-xs">Email Verification Required</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please verify your email address to unlock full invoice management and cloud features.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="h-7 text-xs border-amber-500/30 bg-background hover:bg-muted"
              >
                {isResendingVerification ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3 mr-1.5" />
                    Resend Verification Link
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Personal Information & Settings (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details Card */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                    <CardDescription className="text-xs">
                      Update your account name and review profile identity
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Avatar and Identity */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Interactive Avatar with upload trigger */}
                    <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                      <Avatar className="h-16 w-16 border-2 border-border shadow-xs">
                        <AvatarImage
                          src={
                            user.image
                              ? user.image.startsWith("http://") || user.image.startsWith("https://")
                                ? user.image
                                : "/api/profile/logo"
                              : undefined
                          }
                          alt={user.name}
                        />
                        <AvatarFallback className="text-base font-semibold bg-muted text-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-foreground">{user.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {user.emailVerified ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-1.5 py-0"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0"
                          >
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Upload / Manage Logo Buttons directly in Personal Information */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDirectLogoUpload(e.target.files[0]);
                        }
                      }}
                      disabled={isUploadingAvatar}
                    />

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="h-8 text-xs gap-1.5 shadow-2xs"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      <span>{user.image ? "Change Logo" : "Upload Logo"}</span>
                    </Button>

                    {user.image && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleDirectLogoDelete}
                        disabled={isUploadingAvatar}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="border-border/40" />

                {/* Name & Email Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium">Display Name</Label>
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input
                          id="name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Your Full Name"
                          disabled={updating}
                          className="h-9 text-xs flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !updating) {
                              handleUpdateProfile();
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateProfile}
                            disabled={updating}
                            className="h-9 text-xs gap-1.5 flex-1 sm:flex-initial justify-center shadow-xs"
                          >
                            {updating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={updating}
                            className="h-9 text-xs flex-1 sm:flex-initial justify-center"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="sm:hidden ml-1">Cancel</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 border border-border/60 rounded-xl bg-muted/20 text-xs">
                        <span className="font-medium text-foreground">{user.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                          className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <PenSquare className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Email Address</Label>
                    <div className="flex items-center justify-between p-2.5 border border-border/60 rounded-xl bg-muted/20 text-xs">
                      <span className="font-mono text-muted-foreground truncate mr-2">{user.email}</span>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">Primary</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 border border-border/60 rounded-xl bg-muted/10 space-y-1">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Member Since
                      </span>
                      <span className="font-mono text-xs font-medium text-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>

                    <div className="p-3 border border-border/60 rounded-xl bg-muted/10 space-y-1">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        Authentication Method
                      </span>
                      <span className="text-xs font-medium capitalize text-foreground">
                        {user.lastLoginMethod || "Email & Password"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand & Company Logo Card */}
            <LogoSettings
              currentLogoUrl={user.logoUrl || (user.image ? (user.image.startsWith("http") ? user.image : "/api/profile/logo") : null)}
              onLogoUpdated={(newUrl) => {
                setUser((prev) => (prev ? { ...prev, logoUrl: newUrl, image: newUrl } : null));
              }}
            />

            {/* AI Intelligence Provider & Model Selector */}
            <AiExtractionSettings />

            {/* Email Delivery (Custom SMTP) Settings */}
            <SmtpSettings />
          </div>

          {/* Right Column: Storage & Metrics Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Storage Quota Card */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Storage & Quota</CardTitle>
                    <CardDescription className="text-[11px]">
                      Cloud storage consumption
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono tracking-tight tabular-nums">
                      {formatBytes(stats.totalSize)}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      of {formatBytes(stats.storageLimit || 41943040)} ({stats.percentUsed}%)
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        parseFloat(stats.percentUsed) >= 90
                          ? "bg-destructive"
                          : parseFloat(stats.percentUsed) >= 70
                          ? "bg-amber-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, parseFloat(stats.percentUsed)))}%` }}
                    />
                  </div>
                </div>

                <Separator className="border-border/40" />

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Allocated Limit</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatBytes(stats.storageLimit || 41943040)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available Space</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatBytes(Math.max(0, (stats.storageLimit || 41943040) - stats.totalSize))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg. per Invoice</span>
                    <span className="font-mono font-medium text-foreground">
                      {stats.totalInvoices > 0
                        ? formatBytes(Math.round(stats.totalSize / stats.totalInvoices))
                        : "0 B"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Activity Metrics Card */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Invoice Activity</CardTitle>
                    <CardDescription className="text-[11px]">
                      Document library overview
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Total Invoices</span>
                  </div>
                  <span className="font-bold font-mono text-sm text-foreground">{stats.totalInvoices}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Upload className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Uploaded Files</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">{stats.uploadedInvoices}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PenSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Created Invoices</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">{stats.createdInvoices}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    <span>Added This Month</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">{stats.invoicesThisMonth}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Folder className="h-3.5 w-3.5 text-amber-500" />
                    <span>Total Folders</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">{stats.totalGroups}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
