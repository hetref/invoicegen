"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Download,
  Eye,
  Trash2,
  FileText,
  Loader2,
  HardDrive,
  File,
  FolderInput,
  Mail,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Calendar,
  DollarSign,
  AlertCircle,
  Plus,
  X,
  FileCode,
  Image as ImageIcon,
  Check,
  Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MoveInvoiceDialog } from "./MoveInvoiceDialog";
import { Group } from "./GroupTree";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { firePaidCelebration } from "@/lib/confetti";

export interface InvoiceItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  r2Key: string;
  uploadedAt: string;
  groupId: string | null;
  isManuallyCreated?: boolean;
  isExtracted?: boolean;
  extractionStatus?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  billedToName?: string | null;
  paymentToName?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  isPaid?: boolean;
  paidAt?: string | null;
}

interface InvoiceListProps {
  refreshTrigger?: number;
  currentGroupId?: string | null;
  groups?: Group[];
  onInvoiceChange?: () => void;
}

export function InvoiceList({
  refreshTrigger,
  currentGroupId,
  groups = [],
  onInvoiceChange,
}: InvoiceListProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Filter, Sort & View Mode State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "uploaded" | "created" | "extracted">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size" | "amount">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Dialogs State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [previewInvoice, setPreviewInvoice] = useState<InvoiceItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [moveInvoiceDialogOpen, setMoveInvoiceDialogOpen] = useState(false);
  const [invoiceToMove, setInvoiceToMove] = useState<InvoiceItem | null>(null);

  const [sendInvoiceDialogOpen, setSendInvoiceDialogOpen] = useState(false);
  const [invoiceToSend, setInvoiceToSend] = useState<InvoiceItem | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [hasSmtpConfigured, setHasSmtpConfigured] = useState(false);
  const [smtpSenderAddress, setSmtpSenderAddress] = useState<string>("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [emailData, setEmailData] = useState({
    recipientEmail: "",
    subject: "",
    message: "",
    senderName: "",
    replyTo: "",
  });

  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices");

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePaid = async (e: React.MouseEvent, invoice: InvoiceItem) => {
    e.stopPropagation();
    const nextPaid = !invoice.isPaid;

    if (nextPaid) {
      firePaidCelebration({ x: e.clientX, y: e.clientY });
    }

    // Optimistic UI update
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              isPaid: nextPaid,
              paidAt: nextPaid ? new Date().toISOString() : null,
            }
          : inv
      )
    );

    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: nextPaid }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: nextPaid ? "Invoice Paid" : "Invoice Unmarked",
        description: nextPaid
          ? `${invoice.fileName} marked as Paid.`
          : `${invoice.fileName} marked as unpaid.`,
      });
    } catch (err) {
      console.error("Error updating paid status:", err);
      // Revert on error
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoice.id ? { ...inv, isPaid: invoice.isPaid } : inv))
      );
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger, currentGroupId]);

  // Filter invoices by current group, search query, and filter type
  const processedInvoices = useMemo(() => {
    let result = currentGroupId !== undefined && currentGroupId !== null
      ? invoices.filter((inv) => inv.groupId === currentGroupId)
      : [...invoices];

    // Filter by type
    if (filterType === "uploaded") {
      result = result.filter((i) => !i.isManuallyCreated);
    } else if (filterType === "created") {
      result = result.filter((i) => i.isManuallyCreated);
    } else if (filterType === "extracted") {
      result = result.filter((i) => i.isExtracted);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.fileName.toLowerCase().includes(q) ||
          (i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(q)) ||
          (i.billedToName && i.billedToName.toLowerCase().includes(q)) ||
          (i.paymentToName && i.paymentToName.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sortBy === "name") {
        return a.fileName.localeCompare(b.fileName);
      }
      if (sortBy === "size") {
        return b.fileSize - a.fileSize;
      }
      if (sortBy === "amount") {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      return 0;
    });

    return result;
  }, [invoices, currentGroupId, filterType, searchQuery, sortBy]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = invoices.length;
    const uploaded = invoices.filter((i) => !i.isManuallyCreated).length;
    const created = invoices.filter((i) => i.isManuallyCreated).length;
    const extracted = invoices.filter((i) => i.isExtracted).length;
    const totalSize = invoices.reduce((sum, i) => sum + (i.fileSize || 0), 0);
    const totalAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

    return { total, uploaded, created, extracted, totalSize, totalAmount };
  }, [invoices]);

  const handleDownload = async (invoice: InvoiceItem) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/download`);
      if (!response.ok) throw new Error("Failed to get download URL");

      const { downloadUrl, fileName } = await response.json();

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download invoice file",
        variant: "destructive",
      });
    }
  };

  const handleView = async (invoice: InvoiceItem) => {
    try {
      setIsLoadingPreview(true);
      setPreviewInvoice(invoice);

      const response = await fetch(`/api/invoices/${invoice.id}/download`);
      if (!response.ok) throw new Error("Failed to get preview URL");

      const { downloadUrl, previewUrl } = await response.json();
      setPreviewUrl(previewUrl || downloadUrl);
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview Error",
        description: "Failed to load document preview",
        variant: "destructive",
      });
      setPreviewInvoice(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDeleteClick = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/invoices/${invoiceToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete invoice");

      toast({
        title: "Invoice Deleted",
        description: "The invoice document was permanently deleted.",
      });

      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices();
      onInvoiceChange?.();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete invoice file",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatCurrency = (amount?: number | null, currency?: string | null) => {
    if (amount === undefined || amount === null) return null;
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency || "₹"} ${amount.toFixed(2)}`;
    }
  };

  const handleSendClick = (invoice: InvoiceItem) => {
    setInvoiceToSend(invoice);

    const savedSmtp = localStorage.getItem("custom_smtp_settings");
    let defaultSenderName = "";
    let defaultReplyTo = "";
    let isSmtpSet = false;
    let senderEmail = "";

    if (savedSmtp) {
      try {
        const smtpSettings = JSON.parse(savedSmtp);
        if (
          smtpSettings.host &&
          smtpSettings.user &&
          smtpSettings.password &&
          smtpSettings.mailFrom
        ) {
          isSmtpSet = true;
          senderEmail = smtpSettings.mailFrom;
          defaultSenderName = smtpSettings.senderName || "";
          defaultReplyTo = smtpSettings.replyTo || "";
        }
      } catch {
        // ignore
      }
    }

    setHasSmtpConfigured(isSmtpSet);
    setSmtpSenderAddress(senderEmail);
    setSendError(null);

    setEmailData({
      recipientEmail: "",
      subject: `Invoice: ${invoice.fileName}`,
      message: `Dear Client,\n\nPlease find attached the invoice ${invoice.fileName}.\n\nBest regards,\n${defaultSenderName || "Accounts Team"}`,
      senderName: defaultSenderName,
      replyTo: defaultReplyTo,
    });
    setSendInvoiceDialogOpen(true);
  };

  const handleSendInvoice = async () => {
    if (!invoiceToSend) return;

    setSendError(null);
    const customSmtpStr = localStorage.getItem("custom_smtp_settings");
    const customSmtp = customSmtpStr ? JSON.parse(customSmtpStr) : null;

    if (
      !customSmtp ||
      !customSmtp.host ||
      !customSmtp.user ||
      !customSmtp.password ||
      !customSmtp.mailFrom
    ) {
      const err = "Please configure your custom SMTP settings in your Profile before sending invoices.";
      setSendError(err);
      toast({
        title: "SMTP Not Configured",
        description: err,
        variant: "destructive",
      });
      return;
    }

    if (!emailData.recipientEmail || !emailData.subject) {
      const err = "Please fill in recipient email and subject";
      setSendError(err);
      toast({
        title: "Validation Error",
        description: err,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceToSend.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailData,
          customSmtp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send invoice email");
      }

      toast({
        title: "Email Sent Successfully",
        description: `Invoice delivered to ${emailData.recipientEmail}`,
      });

      setSendInvoiceDialogOpen(false);
      setInvoiceToSend(null);
      setSendError(null);
    } catch (error: any) {
      console.error("Send invoice error:", error);
      const msg = error.message || "Failed to send invoice email";
      setSendError(msg);
      toast({
        title: "Email Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const isPdfMime = (mimeType: string) => mimeType === "application/pdf";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border/60 shadow-xs hover:border-border transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Invoices</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <File className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums font-mono">
                {stats.total}
              </span>
              <span className="text-[11px] text-muted-foreground">invoices</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{stats.uploaded} uploaded</span>
              <span>•</span>
              <span>{stats.created} created</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs hover:border-border transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Storage Consumed</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums font-mono">
                {formatFileSize(stats.totalSize)}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Cloud Storage Footprint</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs hover:border-border transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">AI Extracted Data</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums font-mono">
                {stats.extracted}
              </span>
              <span className="text-[11px] text-muted-foreground">processed</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {stats.totalAmount > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                  {formatCurrency(stats.totalAmount)} total parsed
                </span>
              ) : (
                <span>Structured invoice intelligence</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Card */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                {currentGroupId !== undefined && currentGroupId !== null
                  ? "Folder Invoices"
                  : "All Invoices"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Manage, search, preview, and download your stored documents
              </CardDescription>
            </div>

            {/* View Mode & Sorter */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-normal">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">Sort:</span>
                    <span className="font-medium capitalize">{sortBy}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 text-xs">
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>File Name (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("size")}>Size (Largest)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("amount")}>Amount (Highest)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Switcher Toggle */}
              <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40">
                <Button
                  type="button"
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 p-0"
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7 p-0"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by file name, invoice #, client or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-8 text-xs font-normal bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: "all", label: "All", count: stats.total },
                { id: "uploaded", label: "Uploaded", count: stats.uploaded },
                { id: "created", label: "Created", count: stats.created },
                { id: "extracted", label: "AI Extracted", count: stats.extracted },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${filterType === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] tabular-nums ${filterType === tab.id ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-xs">Loading invoice records...</span>
            </div>
          ) : processedInvoices.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="p-4 rounded-full bg-muted/60 text-muted-foreground inline-block mb-3">
                <FileText className="h-8 w-8" />
              </div>
              <h4 className="text-sm font-semibold mb-1">
                {searchQuery ? "No matching invoices found" : "No invoices found"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No invoices match "${searchQuery}". Try a different search keyword or clear filters.`
                  : currentGroupId !== null
                    ? "This folder is currently empty. Upload or move invoices here."
                    : "You haven't uploaded or generated any invoices yet."}
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs h-8"
                >
                  Clear Search
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push("/new")}
                    className="text-xs h-8 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </div>
          ) : viewMode === "table" ? (
            /* Table View */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="text-xs font-semibold h-9">Invoice File</TableHead>
                    <TableHead className="text-xs font-semibold h-9 hidden md:table-cell">Client / Vendor</TableHead>
                    <TableHead className="text-xs font-semibold h-9 text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold h-9 text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold h-9 hidden sm:table-cell text-right">Size</TableHead>
                    <TableHead className="text-xs font-semibold h-9 hidden lg:table-cell">Uploaded</TableHead>
                    <TableHead className="text-xs font-semibold h-9 text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedInvoices.map((invoice) => {
                    const isPdf = isPdfMime(invoice.mimeType);
                    const formattedAmt = formatCurrency(invoice.totalAmount, invoice.currency || "INR");

                    return (
                      <ContextMenu key={invoice.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow
                            className="group cursor-pointer hover:bg-muted/40 transition-colors border-border/40"
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                          >
                            {/* Invoice File & Details */}
                            <TableCell className="py-2.5">
                              <div className="flex items-start gap-2.5">
                                <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5">
                                  {isPdf ? (
                                    <FileText className="h-4 w-4" />
                                  ) : (
                                    <ImageIcon className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-medium text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                      {invoice.fileName}
                                    </span>
                                    {invoice.isExtracted && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      >
                                        AI Extracted
                                      </Badge>
                                    )}
                                    {invoice.isManuallyCreated && (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                                        Created PDF
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                                    {invoice.invoiceNumber && (
                                      <span>#{invoice.invoiceNumber}</span>
                                    )}
                                    <span className="sm:hidden">• {formatFileSize(invoice.fileSize)}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Client / Vendor */}
                            <TableCell className="hidden md:table-cell py-2.5 text-xs text-muted-foreground">
                              {invoice.billedToName ? (
                                <span className="text-foreground truncate max-w-[140px] block">
                                  {invoice.billedToName}
                                </span>
                              ) : invoice.paymentToName ? (
                                <span className="text-muted-foreground truncate max-w-[140px] block">
                                  {invoice.paymentToName}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </TableCell>

                            {/* Amount */}
                            <TableCell className="text-right py-2.5 text-xs font-mono tabular-nums">
                              {formattedAmt ? (
                                <span className="font-semibold text-foreground">{formattedAmt}</span>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </TableCell>

                            {/* Status / Paid Interactive Toggle */}
                            <TableCell className="text-center py-2.5">
                              <button
                                type="button"
                                onClick={(e) => handleTogglePaid(e, invoice)}
                                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                                  invoice.isPaid
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                    : "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                                }`}
                                title={invoice.isPaid ? "Click to mark as Unpaid" : "Click to mark as Paid (fires celebration)"}
                              >
                                {invoice.isPaid ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                    <span className="font-semibold">Paid</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                                    <span>Unpaid</span>
                                  </>
                                )}
                              </button>
                            </TableCell>

                            {/* Size */}
                            <TableCell className="hidden sm:table-cell text-right py-2.5 text-xs font-mono text-muted-foreground tabular-nums">
                              {formatFileSize(invoice.fileSize)}
                            </TableCell>

                            {/* Upload Date */}
                            <TableCell className="hidden lg:table-cell py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(invoice.uploadedAt), "MMM d, yyyy")}
                            </TableCell>

                            {/* Quick Action Icons */}
                            <TableCell className="text-right py-2.5 pr-4">
                              <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleView(invoice);
                                  }}
                                  title="Quick Preview"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                {invoice.isManuallyCreated && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/new?invoiceId=${invoice.id}`);
                                    }}
                                    title="Edit Invoice"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(invoice);
                                  }}
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hidden sm:inline-flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendClick(invoice);
                                  }}
                                  title="Send via Email"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(invoice.id);
                                  }}
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>

                        {/* Right Click Context Menu */}
                        <ContextMenuContent className="w-48 text-xs">
                          <ContextMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)} className="gap-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open Details Page
                          </ContextMenuItem>
                          <ContextMenuItem onClick={(e) => handleTogglePaid(e as any, invoice)} className="gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            {invoice.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                          </ContextMenuItem>
                          {invoice.isManuallyCreated && (
                            <ContextMenuItem onClick={() => router.push(`/new?invoiceId=${invoice.id}`)} className="gap-2">
                              <Edit className="h-3.5 w-3.5" />
                              Edit Invoice
                            </ContextMenuItem>
                          )}
                          <ContextMenuItem onClick={() => handleView(invoice)} className="gap-2">
                            <Eye className="h-3.5 w-3.5" />
                            Quick Preview
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleDownload(invoice)} className="gap-2">
                            <Download className="h-3.5 w-3.5" />
                            Download File
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleSendClick(invoice)} className="gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Send via Email
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => { setInvoiceToMove(invoice); setMoveInvoiceDialogOpen(true); }} className="gap-2">
                            <FolderInput className="h-3.5 w-3.5" />
                            Move to Folder
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleDeleteClick(invoice.id)} className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Invoice
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Grid / Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {processedInvoices.map((invoice) => {
                const isPdf = isPdfMime(invoice.mimeType);
                const formattedAmt = formatCurrency(invoice.totalAmount, invoice.currency || "INR");

                return (
                  <div
                    key={invoice.id}
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                    className="group border border-border/60 hover:border-primary/40 rounded-xl p-3.5 bg-card/50 hover:bg-card transition-all cursor-pointer shadow-xs hover:shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                          {isPdf ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {invoice.fileName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {format(new Date(invoice.uploadedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 text-xs">
                          <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)} className="gap-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleTogglePaid(e as any, invoice)} className="gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            {invoice.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                          </DropdownMenuItem>
                          {invoice.isManuallyCreated && (
                            <DropdownMenuItem onClick={() => router.push(`/new?invoiceId=${invoice.id}`)} className="gap-2">
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownload(invoice)} className="gap-2">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendClick(invoice)} className="gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setInvoiceToMove(invoice); setMoveInvoiceDialogOpen(true); }} className="gap-2">
                            <FolderInput className="h-3.5 w-3.5" />
                            Move
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(invoice.id)} className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
                      <div>
                        {formattedAmt ? (
                          <span className="font-semibold text-foreground font-mono">{formattedAmt}</span>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[11px]">
                            {formatFileSize(invoice.fileSize)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePaid(e, invoice)}
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                            invoice.isPaid
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted"
                          }`}
                          title={invoice.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                        >
                          {invoice.isPaid ? (
                            <>
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                              <span className="font-semibold">Paid</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                              <span>Unpaid</span>
                            </>
                          )}
                        </button>
                        {invoice.isExtracted && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Extracted
                          </Badge>
                        )}
                        {invoice.isManuallyCreated && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            Created
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Permanently Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This invoice file and all extracted records will be permanently removed from secure storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting} className="text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-9"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => { setPreviewInvoice(null); setPreviewUrl(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl">
          <DialogHeader className="p-4 sm:p-5 border-b shrink-0 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-medium truncate max-w-[500px]">
                {previewInvoice?.fileName}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {previewInvoice && formatFileSize(previewInvoice.fileSize)} • Uploaded on {previewInvoice?.uploadedAt && format(new Date(previewInvoice.uploadedAt), "MMM d, yyyy")}
              </DialogDescription>
            </div>
            {previewInvoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(previewInvoice)}
                className="h-8 text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            )}
          </DialogHeader>

          <div className="p-4 overflow-y-auto flex items-center justify-center min-h-[400px]">
            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading preview...</span>
              </div>
            ) : previewUrl && previewInvoice ? (
              <div className="border rounded-xl overflow-hidden bg-muted/20 w-full flex items-center justify-center">
                {isPdfMime(previewInvoice.mimeType) ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[580px] border-0"
                    title="Invoice Preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Invoice Preview"
                    className="w-full h-auto max-h-[580px] object-contain p-2"
                  />
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Invoice Dialog */}
      <MoveInvoiceDialog
        open={moveInvoiceDialogOpen}
        onOpenChange={setMoveInvoiceDialogOpen}
        invoice={invoiceToMove as any}
        groups={groups}
        onSuccess={() => {
          fetchInvoices();
          onInvoiceChange?.();
        }}
      />

      {/* Send Invoice Modal */}
      <Dialog open={sendInvoiceDialogOpen} onOpenChange={setSendInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl">
          <DialogHeader className="p-4 sm:p-5 border-b shrink-0 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-semibold">Send Invoice via Email</DialogTitle>
              <DialogDescription className="text-xs">
                Email {invoiceToSend?.fileName} directly to your client or recipient
              </DialogDescription>
            </div>
            {hasSmtpConfigured ? (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono shrink-0 hidden sm:inline-flex"
              >
                From: {smtpSenderAddress}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] shrink-0"
              >
                SMTP Not Configured
              </Badge>
            )}
          </DialogHeader>

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* SMTP Not Configured Banner */}
            {!hasSmtpConfigured && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Custom SMTP Credentials Required</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  To send invoices to clients from your verified address, you must first configure your custom SMTP mail server credentials in your Profile.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-amber-500/30 bg-background hover:bg-muted"
                  onClick={() => {
                    setSendInvoiceDialogOpen(false);
                    router.push("/profile#smtp");
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Configure SMTP in Profile
                </Button>
              </div>
            )}

            {/* Send Error Alert */}
            {sendError && (
              <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Email Delivery Failed</span>
                </div>
                <p className="text-[11px] leading-relaxed text-destructive/90">{sendError}</p>
                {(sendError.toLowerCase().includes("authentication") ||
                  sendError.toLowerCase().includes("smtp") ||
                  sendError.toLowerCase().includes("password")) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 bg-background"
                    onClick={() => {
                      setSendInvoiceDialogOpen(false);
                      router.push("/profile#smtp");
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Verify Credentials in Profile
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Form */}
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="recipientEmail" className="text-xs font-medium">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="client@company.com"
                    value={emailData.recipientEmail}
                    onChange={(e) => setEmailData({ ...emailData, recipientEmail: e.target.value })}
                    disabled={isSending || !hasSmtpConfigured}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs font-medium">Subject *</Label>
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    disabled={isSending || !hasSmtpConfigured}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="senderName" className="text-xs font-medium">Sender Name</Label>
                    <Input
                      id="senderName"
                      placeholder="Your Company"
                      value={emailData.senderName}
                      onChange={(e) => setEmailData({ ...emailData, senderName: e.target.value })}
                      disabled={isSending || !hasSmtpConfigured}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="replyTo" className="text-xs font-medium">Reply-To</Label>
                    <Input
                      id="replyTo"
                      placeholder="billing@company.com"
                      value={emailData.replyTo}
                      onChange={(e) => setEmailData({ ...emailData, replyTo: e.target.value })}
                      disabled={isSending || !hasSmtpConfigured}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-medium">Message</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    disabled={isSending || !hasSmtpConfigured}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Email Preview Card */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Live Email Preview</Label>
                <div className="border rounded-xl p-3.5 bg-card text-xs space-y-2.5 shadow-xs">
                  <div className="border-b pb-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {emailData.senderName || (hasSmtpConfigured ? smtpSenderAddress : "InvoiceGen")}
                      </span>
                      <span>Just now</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      To: {emailData.recipientEmail || "recipient@example.com"}
                    </div>
                    <div className="font-medium text-xs text-foreground pt-0.5">
                      {emailData.subject || "Invoice: Document"}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {emailData.message}
                  </p>

                  <div className="p-2 rounded-lg bg-muted/60 border border-border/40 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="font-medium text-[11px] truncate">{invoiceToSend?.fileName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {invoiceToSend && formatFileSize(invoiceToSend.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSendInvoiceDialogOpen(false)}
              disabled={isSending}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendInvoice}
              disabled={isSending || !hasSmtpConfigured}
              className="text-xs h-9 gap-1.5 font-medium shadow-xs"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  Send Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
