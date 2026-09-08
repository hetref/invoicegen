"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Sparkles,
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Globe,
  Edit,
  FolderTree,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Hash,
  CheckCircle2,
  AlertCircle,
  Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GroupTree, Group } from "@/components/GroupTree";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { RenameGroupDialog } from "@/components/RenameGroupDialog";
import { DeleteGroupDialog } from "@/components/DeleteGroupDialog";
import { PaidStamp } from "@/components/ui/paid-stamp";
import { firePaidCelebration } from "@/lib/confetti";

interface Invoice {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  groupId: string | null;
  uploadedAt: string;
  isManuallyCreated: boolean;
  isExtracted: boolean;
  extractionStatus: string | null;
  extractedAt: string | null;
  invoiceDate: string | null;
  invoiceNumber: string | null;
  billedToName: string | null;
  billedToAddress: string | null;
  billedToGst: string | null;
  paymentToName: string | null;
  paymentToAddress: string | null;
  items: any;
  paymentDetails: any;
  contactInfo: any;
  totalAmount: number | null;
  currency: string | null;
  isPaid?: boolean;
  paidAt?: string | null;
}

export default function SingleInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ hasUsedFreeExtraction: boolean } | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [mobileFoldersOpen, setMobileFoldersOpen] = useState(false);
  const [dbAiConfig, setDbAiConfig] = useState<{
    aiProvider?: string;
    geminiApiKey?: string;
    geminiModel?: string;
    groqApiKey?: string;
    groqModel?: string;
  } | null>(null);

  // Group dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogParentId, setCreateDialogParentId] = useState<string | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  const invoiceId = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] : String(params.id);
  }, [params?.id]);

  useEffect(() => {
    if (!params) return;
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    fetchInvoice();
    fetchGroups();
    fetchUserProfile();

    // Check if user has API key in localStorage (Gemini or Groq)
    const activeProvider = localStorage.getItem("ai_provider") || "gemini";
    const geminiKey = localStorage.getItem("gemini_api_key");
    const groqKey = localStorage.getItem("groq_api_key");
    const hasKey = activeProvider === "groq" ? !!groqKey : !!geminiKey || !!groqKey;
    setHasApiKey(hasKey);
  }, [invoiceId, params]);

  // Dedicated active polling for extraction status
  useEffect(() => {
    if (!invoiceId || invoice?.extractionStatus !== "processing") return;

    const interval = setInterval(() => {
      fetchInvoice();
    }, 4000);

    return () => clearInterval(interval);
  }, [invoiceId, invoice?.extractionStatus]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) return;

      const data = await response.json();
      setUserProfile({ hasUsedFreeExtraction: data.user.hasUsedFreeExtraction });

      if (data.aiConfig) {
        setDbAiConfig(data.aiConfig);
        const activeProvider =
          (localStorage.getItem("ai_provider") as "gemini" | "groq") ||
          data.aiConfig.aiProvider ||
          "gemini";
        const hasKey =
          activeProvider === "groq"
            ? Boolean(localStorage.getItem("groq_api_key") || data.aiConfig.groqApiKey)
            : Boolean(localStorage.getItem("gemini_api_key") || data.aiConfig.geminiApiKey);
        setHasApiKey(hasKey);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchInvoice = async () => {
    if (!invoiceId) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");

      const data = await response.json();
      setInvoice(data.invoice);
      setCurrentGroupId(data.invoice.groupId);

      // Set file URL for inline preview with dynamic DevAlly stamp
      setInvoiceUrl(`/api/invoices/${invoiceId}/file?t=${Date.now()}`);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      const data = await response.json();
      setGroups(data.groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleExtract = async () => {
    if (!invoiceId) return;

    setExtracting(true);
    try {
      const provider =
        (localStorage.getItem("ai_provider") as "gemini" | "groq") ||
        dbAiConfig?.aiProvider ||
        "gemini";

      const userApiKey =
        provider === "groq"
          ? (localStorage.getItem("groq_api_key") || dbAiConfig?.groqApiKey || undefined)
          : (localStorage.getItem("gemini_api_key") || dbAiConfig?.geminiApiKey || undefined);

      const model =
        provider === "groq"
          ? (localStorage.getItem("groq_model") || dbAiConfig?.groqModel || "llama-3.3-70b-versatile")
          : (localStorage.getItem("gemini_model") || dbAiConfig?.geminiModel || "gemini-2.5-flash");

      const response = await fetch(`/api/invoices/${invoiceId}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          userApiKey: userApiKey || undefined,
          model,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || "Failed to start extraction");
      }

      toast({
        title: "Extraction Started",
        description: `AI extraction pipeline running with ${provider === "gemini" ? "Google Gemini" : "Groq"} (${model}).`,
      });

      fetchInvoice();
      fetchUserProfile();
    } catch (error: any) {
      console.error("Error starting extraction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start extraction",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleDownload = () => {
    if (invoiceId) {
      window.open(`/api/invoices/${invoiceId}/file?download=1`, "_blank");
      return;
    }
    toast({
      title: "Download Unavailable",
      description: "Unable to retrieve invoice download link.",
      variant: "destructive",
    });
  };

  const handleCreateGroup = (parentId: string | null = null) => {
    setCreateDialogParentId(parentId);
    setCreateDialogOpen(true);
  };

  const handleRenameGroup = (group: Group) => {
    setGroupToEdit(group);
    setRenameDialogOpen(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setGroupToEdit(group);
    setDeleteDialogOpen(true);
  };

  const handleTogglePaid = async () => {
    if (!invoice || !invoiceId) return;
    const nextPaid = !invoice.isPaid;

    if (nextPaid) {
      firePaidCelebration();
    }

    const updatedPaidAt = nextPaid ? new Date().toISOString() : null;

    // Optimistic UI update
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            isPaid: nextPaid,
            paidAt: updatedPaidAt,
            paymentDetails: {
              ...(typeof prev.paymentDetails === "object" && prev.paymentDetails !== null
                ? prev.paymentDetails
                : {}),
              isPaid: nextPaid,
              paidAt: updatedPaidAt,
            },
          }
        : null
    );

    // Refresh file preview immediately with cache-busting timestamp
    setInvoiceUrl(`/api/invoices/${invoiceId}/file?t=${Date.now()}`);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: nextPaid }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: nextPaid ? "DevAlly PAID Stamp Applied! 🎉" : "Marked as Unpaid",
        description: nextPaid
          ? `${invoice.fileName} is now stamped with DevAlly verified PAID status.`
          : `${invoice.fileName} marked as unpaid.`,
      });

      // Confirm preview reflects persisted stamped document
      setInvoiceUrl(`/api/invoices/${invoiceId}/file?t=${Date.now()}`);
    } catch (err: any) {
      console.error("Error updating paid status:", err);
      fetchInvoice();
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Safe date helper to avoid Invalid Date / locale exceptions
  const formatPaidDate = (dateStr?: string | null) => {
    if (!dateStr) return undefined;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString();
    } catch {
      return String(dateStr);
    }
  };

  // Safe line item value renderer to prevent object-as-React-child crashes
  const renderItemValue = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") {
      return String(val.amount ?? val.value ?? val.name ?? val.text ?? JSON.stringify(val));
    }
    return String(val);
  };

  // Safe accessors for items, paymentDetails, and contactInfo
  const parsedItems = useMemo(() => {
    if (!invoice?.items) return [];
    if (Array.isArray(invoice.items)) return invoice.items;
    if (typeof invoice.items === "string") {
      try {
        const p = JSON.parse(invoice.items);
        if (Array.isArray(p)) return p;
        if (p && typeof p === "object" && Array.isArray(p.items)) return p.items;
        if (p && typeof p === "object" && Array.isArray(p.lineItems)) return p.lineItems;
        return [];
      } catch {
        return [];
      }
    }
    if (typeof invoice.items === "object") {
      const obj = invoice.items as any;
      if (Array.isArray(obj.items)) return obj.items;
      if (Array.isArray(obj.lineItems)) return obj.lineItems;
    }
    return [];
  }, [invoice?.items]);

  const paymentDetails = useMemo(() => {
    if (!invoice?.paymentDetails) return null;
    let details = invoice.paymentDetails;
    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch {
        return null;
      }
    }
    if (typeof details === "object" && details !== null) {
      const hasBankingInfo = Boolean(
        details.accountNumber ||
        details.ifsc ||
        details.upi ||
        details.bankName ||
        details.iban ||
        details.swiftCode ||
        details.accountHolder ||
        details.routingNumber
      );
      return hasBankingInfo ? details : null;
    }
    return null;
  }, [invoice?.paymentDetails]);

  const contactInfo = useMemo(() => {
    if (!invoice?.contactInfo) return null;
    let contact = invoice.contactInfo;
    if (typeof contact === "string") {
      try {
        contact = JSON.parse(contact);
      } catch {
        return null;
      }
    }
    if (typeof contact === "object" && contact !== null) {
      const hasContact = Boolean(contact.phone || contact.email || contact.website);
      return hasContact ? contact : null;
    }
    return null;
  }, [invoice?.contactInfo]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-neutral-600" />
        <p className="text-xs text-neutral-500 font-medium">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Invoice not found</h2>
          <p className="text-xs text-neutral-500 mt-1">This invoice may have been deleted or moved.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="rounded-full text-xs"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isPdf = invoice.mimeType === "application/pdf";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 pb-16">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Top Responsive Context Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          {/* Back & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="h-8 px-2.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 gap-1.5 -ml-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>

            <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-semibold text-neutral-950 truncate max-w-[180px] sm:max-w-xs">
                {invoice.fileName}
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                ({formatFileSize(invoice.fileSize)})
              </span>
            </div>
          </div>

          {/* Action Buttons - Touch friendly on mobile */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Interactive Paid Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePaid}
              className={`h-8 px-3 rounded-full text-xs font-medium gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 ${
                invoice.isPaid
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-semibold"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              }`}
              title={invoice.isPaid ? "Click to mark as Unpaid" : "Click to mark as Paid (fires celebration)"}
            >
              {invoice.isPaid ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Paid (DevAlly)</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-neutral-400 shrink-0" />
                  <span>Mark as Paid</span>
                </>
              )}
            </Button>

            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 px-3 rounded-full text-xs font-medium border-neutral-200 text-neutral-700 hover:bg-neutral-50 gap-1.5 flex-1 sm:flex-initial justify-center"
            >
              <Download className="h-3.5 w-3.5 text-neutral-500" />
              <span>Download</span>
            </Button>

            {/* Edit button for manually created invoices */}
            {invoice.isManuallyCreated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/new?invoiceId=${invoice.id}`)}
                className="h-8 px-3 rounded-full text-xs font-medium border-neutral-200 text-neutral-700 hover:bg-neutral-50 gap-1.5 flex-1 sm:flex-initial justify-center"
              >
                <Edit className="h-3.5 w-3.5 text-neutral-500" />
                <span>Edit</span>
              </Button>
            )}

            {/* Extract button only for uploaded invoices */}
            {!invoice.isManuallyCreated &&
              !invoice.isExtracted &&
              invoice.extractionStatus !== "processing" && (
                <>
                  {!hasApiKey && userProfile?.hasUsedFreeExtraction ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block flex-1 sm:flex-initial">
                            <Button
                              size="sm"
                              disabled={true}
                              className="w-full h-8 px-3 rounded-full text-xs font-medium gap-1.5"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Extract AI</span>
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          <p>Add your Gemini or Groq API key in the Profile page for unlimited AI extractions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleExtract}
                      disabled={extracting}
                      className="h-8 px-3.5 rounded-full text-xs font-medium bg-neutral-950 hover:bg-neutral-800 text-white gap-1.5 flex-1 sm:flex-initial justify-center shadow-xs"
                    >
                      {extracting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Extract with AI</span>
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}

            {invoice.extractionStatus === "processing" && (
              <Badge variant="secondary" className="h-8 gap-1.5 px-3 rounded-full text-xs bg-amber-50 text-amber-800 border-amber-200">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Extracting...</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Collapsible Folder Tree Selector */}
        <div className="block lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFoldersOpen(!mobileFoldersOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/80 text-xs font-medium text-neutral-700 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-neutral-500" />
              <span>Drive Folders & Organization</span>
            </div>
            {mobileFoldersOpen ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </button>

          {mobileFoldersOpen && (
            <div className="mt-2 p-3 rounded-xl bg-white border border-neutral-200/80 shadow-xs">
              <GroupTree
                groups={groups}
                currentGroupId={currentGroupId}
                onGroupSelect={(groupId) =>
                  router.push(`/dashboard?group=${groupId || ""}`)
                }
                onCreateGroup={handleCreateGroup}
                onRenameGroup={handleRenameGroup}
                onDeleteGroup={handleDeleteGroup}
              />
            </div>
          )}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* Desktop Left Sidebar - Group Folders */}
          <div className="hidden lg:block lg:col-span-3">
            <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <FolderTree className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Folders</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <GroupTree
                  groups={groups}
                  currentGroupId={currentGroupId}
                  onGroupSelect={(groupId) =>
                    router.push(`/dashboard?group=${groupId || ""}`)
                  }
                  onCreateGroup={handleCreateGroup}
                  onRenameGroup={handleRenameGroup}
                  onDeleteGroup={handleDeleteGroup}
                />
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Content Area (Desktop 9 cols, Mobile 1 col) */}
          <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* Document Preview Card */}
            <div className="lg:col-span-6 lg:sticky lg:top-20">
              <Card className="rounded-2xl border-neutral-200/80 shadow-xs overflow-hidden">
                <CardHeader className="p-3.5 sm:p-4 bg-neutral-50/80 border-b border-neutral-200/80 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="h-4 w-4 text-neutral-700 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-900 truncate">
                      {invoice.fileName}
                    </span>
                  </div>
                  <a
                    href={`/api/invoices/${invoice.id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-950 transition-colors shrink-0"
                  >
                    <span>Full View</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 bg-neutral-100/50 relative">
                  {/* Translucent DevAlly Verified Paid Stamp Overlay for image files (PDFs have stamp embedded directly inside the document) */}
                  {!isPdf && invoice.isPaid && (
                    <div className="absolute top-5 right-5 z-20 pointer-events-none drop-shadow-md">
                      <PaidStamp
                        date={formatPaidDate(invoice.paidAt)}
                        size="md"
                      />
                    </div>
                  )}

                  {invoiceUrl ? (
                    <div className="w-full rounded-xl overflow-hidden border border-neutral-200/80 bg-white">
                      {isPdf ? (
                        <iframe
                          key={`${invoice.id}-${invoice.isPaid ? "paid" : "unpaid"}`}
                          src={invoiceUrl}
                          className="w-full h-[380px] sm:h-[500px] lg:h-[620px]"
                          title="Invoice PDF Preview"
                        />
                      ) : (
                        <div className="flex items-center justify-center p-2 bg-neutral-50 min-h-[300px]">
                          <img
                            src={invoiceUrl}
                            alt="Invoice Preview"
                            className="max-h-[600px] w-auto max-w-full rounded-lg object-contain shadow-xs"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-xs text-neutral-400">
                      No preview available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Extracted Structured Data Column */}
            <div className="lg:col-span-6 space-y-4">
              {!invoice.isExtracted && !invoice.isManuallyCreated ? (
                <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
                  <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        No Extracted Data Yet
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Extract vendor details, line items, taxes, and totals automatically using dual-engine AI.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleExtract}
                      disabled={extracting}
                      className="rounded-full h-8 px-4 text-xs font-medium bg-neutral-950 text-white hover:bg-neutral-800 gap-1.5 shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Extract with AI</span>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Basic Invoice Information Card */}
                  <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b border-neutral-100">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Invoice Summary</span>
                        </CardTitle>
                        <div className="flex items-center gap-1.5">
                          {invoice.isPaid && (
                            <Badge className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              DevAlly PAID
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] font-mono border-neutral-200 bg-neutral-50">
                            {invoice.isManuallyCreated ? "Created" : "AI Parsed"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        {invoice.invoiceNumber && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Number</span>
                            <p className="text-xs font-mono font-semibold text-neutral-900">{renderItemValue(invoice.invoiceNumber)}</p>
                          </div>
                        )}
                        {invoice.invoiceDate && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Date</span>
                            <div className="flex items-center gap-1 text-xs text-neutral-800">
                              <Calendar className="h-3 w-3 text-neutral-400" />
                              <span>{renderItemValue(invoice.invoiceDate)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {invoice.totalAmount !== null && invoice.totalAmount !== undefined && (
                        <div className="pt-2 border-t border-neutral-100 flex items-baseline justify-between">
                          <span className="text-xs text-neutral-500 font-medium">Total Balance</span>
                          <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-950">
                            {invoice.currency || "USD"} {typeof invoice.totalAmount === "number" ? invoice.totalAmount.toFixed(2) : renderItemValue(invoice.totalAmount)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Billed To Card */}
                  {invoice.billedToName && (
                    <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b border-neutral-100">
                        <CardTitle className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Billed To</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-1.5 text-xs">
                        <p className="font-semibold text-neutral-900">{renderItemValue(invoice.billedToName)}</p>
                        {invoice.billedToAddress && (
                          <p className="text-neutral-600 leading-relaxed flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <span>{renderItemValue(invoice.billedToAddress)}</span>
                          </p>
                        )}
                        {invoice.billedToGst && (
                          <div className="pt-1 text-[11px] font-mono text-neutral-500">
                            <span>GST/Tax: </span>
                            <span className="font-semibold text-neutral-800">{renderItemValue(invoice.billedToGst)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment To Card */}
                  {invoice.paymentToName && (
                    <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b border-neutral-100">
                        <CardTitle className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Payment To (Issuer)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-1.5 text-xs">
                        <p className="font-semibold text-neutral-900">{renderItemValue(invoice.paymentToName)}</p>
                        {invoice.paymentToAddress && (
                          <p className="text-neutral-600 leading-relaxed flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <span>{renderItemValue(invoice.paymentToAddress)}</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Line Items Card */}
                  {parsedItems.length > 0 && (
                    <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b border-neutral-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                          Line Items ({parsedItems.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 space-y-2">
                        {parsedItems.map((item: any, index: number) => {
                          const desc = renderItemValue(item?.description || item?.name || item?.item || `Item ${index + 1}`);
                          const total = renderItemValue(item?.subtotal ?? item?.total ?? item?.amount ?? item?.price ?? 0);
                          const qty = renderItemValue(item?.qty ?? item?.quantity ?? 1);
                          const rate = renderItemValue(item?.price ?? item?.rate ?? item?.unitPrice ?? item?.subtotal ?? 0);
                          return (
                            <div
                              key={index}
                              className="p-2.5 sm:p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/60 space-y-1 text-xs"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-medium text-neutral-900 leading-snug">
                                  {desc}
                                </p>
                                <span className="font-mono font-semibold text-neutral-950 shrink-0">
                                  {invoice.currency || "USD"} {total}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                                <span>Qty: {qty}</span>
                                <span>•</span>
                                <span>Rate: {invoice.currency || "USD"} {rate}</span>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Details Card */}
                  {paymentDetails && (
                    <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b border-neutral-100">
                        <CardTitle className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Banking & Settlement</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2 text-xs font-mono text-neutral-700">
                        {paymentDetails.bankName && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Bank:</span>
                            <span className="font-semibold text-neutral-900">{renderItemValue(paymentDetails.bankName)}</span>
                          </div>
                        )}
                        {paymentDetails.accountNumber && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Account:</span>
                            <span className="font-semibold text-neutral-900">{renderItemValue(paymentDetails.accountNumber)}</span>
                          </div>
                        )}
                        {paymentDetails.ifsc && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">IFSC/Routing:</span>
                            <span className="font-semibold text-neutral-900">{renderItemValue(paymentDetails.ifsc)}</span>
                          </div>
                        )}
                        {paymentDetails.upi && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">UPI ID:</span>
                            <span className="font-semibold text-neutral-900">{renderItemValue(paymentDetails.upi)}</span>
                          </div>
                        )}
                        {paymentDetails.iban && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">IBAN:</span>
                            <span className="font-semibold text-neutral-900">{renderItemValue(paymentDetails.iban)}</span>
                          </div>
                        )}
                        {paymentDetails.swiftCode && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">SWIFT:</span>
                            <span className="font-semibold text-neutral-900">{renderItemValue(paymentDetails.swiftCode)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Contact Info Card */}
                  {contactInfo && (
                    <Card className="rounded-2xl border-neutral-200/80 shadow-xs">
                      <CardHeader className="p-4 pb-2 border-b border-neutral-100">
                        <CardTitle className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                          Contact Channels
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2 text-xs text-neutral-700">
                        {contactInfo.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span>{renderItemValue(contactInfo.phone)}</span>
                          </div>
                        )}
                        {contactInfo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{renderItemValue(contactInfo.email)}</span>
                          </div>
                        )}
                        {contactInfo.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            {(() => {
                              const siteStr = renderItemValue(contactInfo.website);
                              const siteUrl = siteStr.startsWith("http") ? siteStr : `https://${siteStr}`;
                              return (
                                <a
                                  href={siteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-neutral-900 hover:underline truncate"
                                >
                                  {siteStr}
                                </a>
                              );
                            })()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Group Management Dialogs */}
        <CreateGroupDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          parentId={createDialogParentId}
          onSuccess={fetchGroups}
        />
        <RenameGroupDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          group={groupToEdit}
          onSuccess={fetchGroups}
        />
        <DeleteGroupDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          group={groupToEdit}
          allGroups={groups}
          onSuccess={fetchGroups}
        />
      </div>
    </div>
  );
}
