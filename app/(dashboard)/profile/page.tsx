"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Key,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  lastLoginMethod: string | null;
  hasUsedFreeExtraction: boolean;
}

interface ProfileStats {
  totalInvoices: number;
  totalSize: number;
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
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [currentAiModel, setCurrentAiModel] = useState("gemini-2.5-flash");
  const [smtpSettings, setSmtpSettings] = useState({
    host: "",
    port: "587",
    user: "",
    password: "",
    mailFrom: "",
    senderName: "",
    replyTo: "",
    secure: false,
  });
  const [isEditingSmtp, setIsEditingSmtp] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const { toast} = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    // Load Gemini API key from localStorage
    const savedApiKey = localStorage.getItem("gemini_api_key");
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
    }
    // Load SMTP settings from localStorage
    const savedSmtp = localStorage.getItem("custom_smtp_settings");
    if (savedSmtp) {
      setSmtpSettings(JSON.parse(savedSmtp));
    }
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
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      toast({
        title: "Error",
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
        body: JSON.stringify({ name: editedName }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setUser(data.user);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
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

  const handleSaveApiKey = () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "Error",
        description: "API key cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem("gemini_api_key", geminiApiKey.trim());
    setIsEditingApiKey(false);
    
    toast({
      title: "Success",
      description: "Gemini API key saved successfully",
    });
  };

  const handleCancelApiKeyEdit = () => {
    const savedApiKey = localStorage.getItem("gemini_api_key");
    setGeminiApiKey(savedApiKey || "");
    setIsEditingApiKey(false);
  };

  const handleDeleteApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setGeminiApiKey("");
    toast({
      title: "Success",
      description: "Gemini API key removed",
    });
  };

  const handleSaveSmtp = () => {
    if (!smtpSettings.host || !smtpSettings.user || !smtpSettings.password || !smtpSettings.mailFrom) {
      toast({
        title: "Error",
        description: "Please fill in all required SMTP fields",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem("custom_smtp_settings", JSON.stringify(smtpSettings));
    setIsEditingSmtp(false);
    
    toast({
      title: "Success",
      description: "Custom SMTP settings saved successfully",
    });
  };

  const handleCancelSmtpEdit = () => {
    const savedSmtp = localStorage.getItem("custom_smtp_settings");
    if (savedSmtp) {
      setSmtpSettings(JSON.parse(savedSmtp));
    } else {
      setSmtpSettings({
        host: "",
        port: "587",
        user: "",
        password: "",
        mailFrom: "",
        senderName: "",
        replyTo: "",
        secure: false,
      });
    }
    setIsEditingSmtp(false);
  };

  const handleDeleteSmtp = () => {
    localStorage.removeItem("custom_smtp_settings");
    setSmtpSettings({
      host: "",
      port: "587",
      user: "",
      password: "",
      mailFrom: "",
      senderName: "",
      replyTo: "",
      secure: false,
    });
    toast({
      title: "Success",
      description: "Custom SMTP settings removed",
    });
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
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {user.emailVerified && (
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          )}
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and view your statistics
          </p>
        </div>

        {/* Email Verification Warning for Unverified Users */}
        {!user.emailVerified && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold text-yellow-900">
                  Email Verification Required
                </p>
                <p className="text-sm text-yellow-700">
                  You must verify your email address to access dashboard features. 
                  Please check your inbox for the verification email or click the button below to resend it.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  {isResendingVerification ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Profile Picture
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.image ? "Using custom avatar" : "Using default avatar"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={updating}
                      />
                      <Button
                        size="icon"
                        onClick={handleUpdateProfile}
                        disabled={updating}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="gap-2"
                      >
                        <PenSquare className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    {user.emailVerified ? (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                  {!user.emailVerified && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Please verify your email to access all features
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className="text-xs h-7"
                      >
                        {isResendingVerification ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Resend Verification"
                        )}
                      </Button>
                    </div>
                  )}
                  {user.emailVerified && (
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  )}
                </div>

                {/* Account Created */}
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* Login Method */}
                {user.lastLoginMethod && (
                  <div className="space-y-2">
                    <Label>Login Method</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {user.lastLoginMethod}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gemini API Key Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Extraction Settings
                </CardTitle>
                <CardDescription>
                  Manage your Gemini API key for unlimited AI invoice extractions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Key Input */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Gemini API Key</Label>
                  {isEditingApiKey || !geminiApiKey ? (
                    <div className="space-y-2">
                      <Input
                        id="apiKey"
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="Enter your Gemini API key"
                        disabled={updating}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveApiKey}
                          disabled={updating || !geminiApiKey.trim()}
                          className="gap-2"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                        {geminiApiKey && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelApiKeyEdit}
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">••••••••••••••••</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingApiKey(true)}
                          className="gap-2"
                        >
                          <PenSquare className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleDeleteApiKey}
                          className="gap-2 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {geminiApiKey 
                      ? "Your API key is saved locally and enables unlimited AI extractions" 
                      : "Without an API key, you get 1 free AI extraction"}
                  </p>
                </div>

                <Separator />

                {/* AI Model Display */}
                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{currentAiModel}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This model is used for extracting invoice data
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Custom SMTP Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Custom SMTP Settings
                </CardTitle>
                <CardDescription>
                  Configure your own SMTP server for sending invoices via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingSmtp || !smtpSettings.host ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host *</Label>
                      <Input
                        id="smtpHost"
                        type="text"
                        value={smtpSettings.host}
                        onChange={(e) =>
                          setSmtpSettings({ ...smtpSettings, host: e.target.value })
                        }
                        placeholder="smtp.example.com"
                        disabled={updating}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">Port *</Label>
                        <Input
                          id="smtpPort"
                          type="text"
                          value={smtpSettings.port}
                          onChange={(e) =>
                            setSmtpSettings({ ...smtpSettings, port: e.target.value })
                          }
                          placeholder="587"
                          disabled={updating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={smtpSettings.secure}
                            onChange={(e) =>
                              setSmtpSettings({ ...smtpSettings, secure: e.target.checked })
                            }
                            disabled={updating}
                          />
                          Use SSL/TLS
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username/Email *</Label>
                      <Input
                        id="smtpUser"
                        type="text"
                        value={smtpSettings.user}
                        onChange={(e) =>
                          setSmtpSettings({ ...smtpSettings, user: e.target.value })
                        }
                        placeholder="your-email@example.com"
                        disabled={updating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password *</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={smtpSettings.password}
                        onChange={(e) =>
                          setSmtpSettings({ ...smtpSettings, password: e.target.value })
                        }
                        placeholder="••••••••"
                        disabled={updating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpMailFrom">Mail From Address *</Label>
                      <Input
                        id="smtpMailFrom"
                        type="email"
                        value={smtpSettings.mailFrom}
                        onChange={(e) =>
                          setSmtpSettings({ ...smtpSettings, mailFrom: e.target.value })
                        }
                        placeholder="noreply@yourdomain.com"
                        disabled={updating}
                      />
                      <p className="text-xs text-muted-foreground">
                        The email address that will appear as the sender
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpSenderName">Sender Display Name (Optional)</Label>
                      <Input
                        id="smtpSenderName"
                        type="text"
                        value={smtpSettings.senderName}
                        onChange={(e) =>
                          setSmtpSettings({ ...smtpSettings, senderName: e.target.value })
                        }
                        placeholder="Your Company Name"
                        disabled={updating}
                      />
                      <p className="text-xs text-muted-foreground">
                        The name that will appear as the sender (e.g., "Company Name &lt;email@address&gt;")
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpReplyTo">Reply-To Email (Optional)</Label>
                      <Input
                        id="smtpReplyTo"
                        type="email"
                        value={smtpSettings.replyTo}
                        onChange={(e) =>
                          setSmtpSettings({ ...smtpSettings, replyTo: e.target.value })
                        }
                        placeholder="replies@yourdomain.com"
                        disabled={updating}
                      />
                      <p className="text-xs text-muted-foreground">
                        Where replies should be sent (can differ from sender address)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveSmtp}
                        disabled={updating}
                        className="gap-2"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      {smtpSettings.host && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelSmtpEdit}
                          disabled={updating}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{smtpSettings.host}</p>
                        <p className="text-xs text-muted-foreground">
                          {smtpSettings.user} • Port {smtpSettings.port}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          From: {smtpSettings.senderName ? `${smtpSettings.senderName} <${smtpSettings.mailFrom}>` : smtpSettings.mailFrom}
                        </p>
                        {smtpSettings.replyTo && (
                          <p className="text-xs text-muted-foreground">
                            Reply-To: {smtpSettings.replyTo}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingSmtp(true)}
                          className="gap-2"
                        >
                          <PenSquare className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleDeleteSmtp}
                          className="gap-2 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your custom SMTP settings will be used for sending invoices via email
                    </p>
                  </div>
                )}
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>💡 <strong>Note:</strong> Without custom SMTP settings, the default Gmail SMTP will be used (if configured).</p>
                  <p><strong>Common SMTP Ports:</strong> 587 (TLS), 465 (SSL), 25 (Non-secure)</p>
                  <p><strong>Mail From:</strong> This is the email address that will appear as the sender. It may differ from your SMTP username depending on your email provider's configuration.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Storage Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold">{formatBytes(stats.totalSize)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Storage Used
                  </p>
                </div>
                
                {/* Visual storage representation */}
                <div className="space-y-2 mb-4">
                  <Progress 
                    value={stats.totalSize > 0 ? Math.min((stats.totalSize / (40 * 1024 * 1024)) * 100, 100) : 0} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {stats.totalSize > 0 
                      ? `${((stats.totalSize / (40 * 1024 * 1024)) * 100).toFixed(1)}% of 40 MB`
                      : "No storage used yet"}
                  </p>
                </div>

                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average per invoice</span>
                    <span className="font-medium">
                      {stats.totalInvoices > 0
                        ? formatBytes(Math.round(stats.totalSize / stats.totalInvoices))
                        : "0 Bytes"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Invoices</span>
                    </div>
                    <span className="text-xl font-bold">{stats.totalInvoices}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.uploadedInvoices}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PenSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.createdInvoices}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">This Month</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.invoicesThisMonth}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Groups</span>
                    </div>
                    <span className="text-lg font-semibold">{stats.totalGroups}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

