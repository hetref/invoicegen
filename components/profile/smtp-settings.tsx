"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Server,
  Key,
  Save,
  Trash2,
  PenSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Info,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export interface CustomSmtpConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  mailFrom: string;
  senderName: string;
  replyTo: string;
  secure: boolean;
}

const DEFAULT_SMTP_CONFIG: CustomSmtpConfig = {
  host: "",
  port: "587",
  user: "",
  password: "",
  mailFrom: "",
  senderName: "",
  replyTo: "",
  secure: false,
};

const SMTP_PRESETS = [
  {
    name: "Gmail / Google",
    host: "smtp.gmail.com",
    port: "587",
    secure: false,
    tip: "Use a 16-character Google App Password (not your normal password).",
    appPasswordUrl: "https://myaccount.google.com/apppasswords",
  },
  {
    name: "Outlook / 365",
    host: "smtp.office365.com",
    port: "587",
    secure: false,
    tip: "Requires SMTP AUTH enabled in Microsoft 365 Admin Center.",
    appPasswordUrl: "https://account.live.com/proofs/AppPassword",
  },
  {
    name: "SendGrid",
    host: "smtp.sendgrid.net",
    port: "587",
    secure: false,
    tip: "Username is literally 'apikey', password is your SendGrid API key.",
    appPasswordUrl: "https://app.sendgrid.com/settings/api_keys",
  },
  {
    name: "Amazon SES",
    host: "email-smtp.us-east-1.amazonaws.com",
    port: "587",
    secure: false,
    tip: "Use your AWS SES SMTP credentials, not IAM secret keys.",
    appPasswordUrl: "https://console.aws.amazon.com/ses",
  },
];

export function SmtpSettings() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
    error?: string;
  } | null>(null);

  const [smtpConfig, setSmtpConfig] = useState<CustomSmtpConfig>(DEFAULT_SMTP_CONFIG);
  const [formConfig, setFormConfig] = useState<CustomSmtpConfig>(DEFAULT_SMTP_CONFIG);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("custom_smtp_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSmtpConfig(parsed);
        setFormConfig(parsed);
      }
    } catch (e) {
      console.error("Failed to load SMTP settings:", e);
    }
  }, []);

  const hasConfiguredSmtp = Boolean(
    smtpConfig.host && smtpConfig.user && smtpConfig.password && smtpConfig.mailFrom
  );

  const applyPreset = (preset: (typeof SMTP_PRESETS)[0]) => {
    setFormConfig((prev) => ({
      ...prev,
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
    }));
    toast({
      title: `${preset.name} Preset Applied`,
      description: `Host set to ${preset.host}:${preset.port}. ${preset.tip}`,
    });
  };

  const handleTestConnection = async () => {
    const configToTest = isEditing || !hasConfiguredSmtp ? formConfig : smtpConfig;

    if (
      !configToTest.host.trim() ||
      !configToTest.user.trim() ||
      !configToTest.password.trim() ||
      !configToTest.mailFrom.trim()
    ) {
      toast({
        title: "Incomplete Fields",
        description: "Please fill in Host, Username, Password, and Mail From to test the connection.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configToTest),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          latencyMs: data.latencyMs,
          message: data.message,
        });
        toast({
          title: "SMTP Connection Verified",
          description: `Connected to ${configToTest.host} in ${data.latencyMs}ms!`,
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || "Failed to verify SMTP server credentials",
        });
        toast({
          title: "SMTP Verification Failed",
          description: data.error || "Could not authenticate with SMTP server",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || "Network error when testing SMTP server",
      });
      toast({
        title: "Test Error",
        description: "Failed to communicate with SMTP test endpoint",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (
      !formConfig.host.trim() ||
      !formConfig.user.trim() ||
      !formConfig.password.trim() ||
      !formConfig.mailFrom.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Host, Username, Password, and Mail From are required fields.",
        variant: "destructive",
      });
      return;
    }

    const cleanedConfig: CustomSmtpConfig = {
      host: formConfig.host.trim(),
      port: formConfig.port.trim() || (formConfig.secure ? "465" : "587"),
      user: formConfig.user.trim(),
      password: formConfig.password.trim().replace(/\s+/g, ""),
      mailFrom: formConfig.mailFrom.trim(),
      senderName: formConfig.senderName.trim(),
      replyTo: formConfig.replyTo.trim(),
      secure: formConfig.secure,
    };

    localStorage.setItem("custom_smtp_settings", JSON.stringify(cleanedConfig));
    setSmtpConfig(cleanedConfig);
    setFormConfig(cleanedConfig);
    setIsEditing(false);
    setTestResult(null);

    toast({
      title: "SMTP Settings Saved",
      description: "Your custom email delivery settings are active.",
    });
  };

  const handleCancel = () => {
    setFormConfig(smtpConfig);
    setIsEditing(false);
    setTestResult(null);
  };

  const handleDelete = () => {
    localStorage.removeItem("custom_smtp_settings");
    setSmtpConfig(DEFAULT_SMTP_CONFIG);
    setFormConfig(DEFAULT_SMTP_CONFIG);
    setIsEditing(false);
    setTestResult(null);

    toast({
      title: "SMTP Configuration Removed",
      description: "Email invoice sending is disabled until new SMTP settings are configured.",
    });
  };

  if (!mounted) return null;

  return (
    <Card className="border-border/60 shadow-xs" id="smtp">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Email Delivery (Custom SMTP)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configure your own email server to send invoices directly to clients from your verified address.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasConfiguredSmtp ? (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] px-2 py-0.5"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active & Ready
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-muted/40 text-muted-foreground border-border/60 text-[11px] px-2 py-0.5"
              >
                <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                Not Configured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* State 1: Configured and in Read Mode */}
        {hasConfiguredSmtp && !isEditing ? (
          <div className="space-y-4">
            {/* Overview Card */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                    {smtpConfig.host}
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 shrink-0">
                    Port {smtpConfig.port} {smtpConfig.secure ? "(SSL)" : "(TLS)"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <PenSquare className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px] block">Username / Account</span>
                  <span className="font-mono text-foreground">{smtpConfig.user}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Mail From</span>
                  <span className="font-mono text-foreground">
                    {smtpConfig.senderName ? `"${smtpConfig.senderName}" <${smtpConfig.mailFrom}>` : smtpConfig.mailFrom}
                  </span>
                </div>
                {smtpConfig.replyTo && (
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Reply-To</span>
                    <span className="font-mono text-foreground">{smtpConfig.replyTo}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-[11px] block">Security Protocol</span>
                  <span className="text-foreground">{smtpConfig.secure ? "SSL/TLS (Port 465)" : "STARTTLS (Port 587)"}</span>
                </div>
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="h-8 text-xs gap-1.5 shadow-xs"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Testing SMTP Server...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Test Connection
                  </>
                )}
              </Button>

              {testResult && (
                <div
                  className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
                    testResult.success
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Verified in {testResult.latencyMs}ms</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[320px]">{testResult.error}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* State 2: Configuration / Edit Form */
          <div className="space-y-4">
            {/* Quick Provider Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Quick Provider Presets</Label>
              <div className="flex flex-wrap items-center gap-1.5">
                {SMTP_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-border/60 bg-muted/30 hover:bg-muted text-foreground transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="border-border/40" />

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="smtpHost" className="text-xs font-medium">SMTP Server Host *</Label>
                <Input
                  id="smtpHost"
                  value={formConfig.host}
                  onChange={(e) => setFormConfig({ ...formConfig, host: e.target.value })}
                  placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="smtpPort" className="text-xs font-medium">Port *</Label>
                <Input
                  id="smtpPort"
                  value={formConfig.port}
                  onChange={(e) => setFormConfig({ ...formConfig, port: e.target.value })}
                  placeholder="587"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={formConfig.secure}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        secure: e.target.checked,
                        port: e.target.checked ? "465" : "587",
                      })
                    }
                    className="rounded border-border"
                  />
                  <span>Use Direct SSL/TLS (Port 465)</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="smtpUser" className="text-xs font-medium">Username / Account Email *</Label>
                <Input
                  id="smtpUser"
                  value={formConfig.user}
                  onChange={(e) => setFormConfig({ ...formConfig, user: e.target.value })}
                  placeholder="billing@yourdomain.com"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smtpPassword" className="text-xs font-medium">Password / App Password *</Label>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    Google App Password <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="smtpPassword"
                    type={showPassword ? "text" : "password"}
                    value={formConfig.password}
                    onChange={(e) => setFormConfig({ ...formConfig, password: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="h-9 text-xs pr-9 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="smtpMailFrom" className="text-xs font-medium">Mail From (Sender Address) *</Label>
                <Input
                  id="smtpMailFrom"
                  type="email"
                  value={formConfig.mailFrom}
                  onChange={(e) => setFormConfig({ ...formConfig, mailFrom: e.target.value })}
                  placeholder="billing@yourdomain.com"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="smtpSenderName" className="text-xs font-medium">Sender Display Name (Optional)</Label>
                <Input
                  id="smtpSenderName"
                  value={formConfig.senderName}
                  onChange={(e) => setFormConfig({ ...formConfig, senderName: e.target.value })}
                  placeholder="e.g. DevAlly Invoicing"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="smtpReplyTo" className="text-xs font-medium">Reply-To Address (Optional)</Label>
                <Input
                  id="smtpReplyTo"
                  type="email"
                  value={formConfig.replyTo}
                  onChange={(e) => setFormConfig({ ...formConfig, replyTo: e.target.value })}
                  placeholder="support@yourdomain.com"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Test Result Display if present */}
            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className="font-semibold">{testResult.success ? "Connection Succeeded" : "Connection Failed"}</p>
                  <p className="text-[11px] leading-relaxed">
                    {testResult.success ? `${testResult.message} (${testResult.latencyMs}ms)` : testResult.error}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="h-9 text-xs gap-1.5 font-medium shadow-xs justify-center"
              >
                <Save className="h-3.5 w-3.5" />
                Save Configuration
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="h-9 text-xs gap-1.5 shadow-xs justify-center"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Test Connection
                  </>
                )}
              </Button>

              {hasConfiguredSmtp && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-9 text-xs justify-center"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Security & Info Box */}
        <div className="p-3 rounded-xl bg-muted/20 border border-border/40 text-[11px] text-muted-foreground space-y-1 leading-relaxed">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Encrypted & Client-Isolated</span>
          </div>
          <p>
            Your SMTP credentials are saved strictly in your secure local browser storage and delivered over encrypted HTTPS only when you trigger an email dispatch. No email operations will be run unless you configure this mail server.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
