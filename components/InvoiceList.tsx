"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Download, Eye, Trash2, FileText, Loader2, HardDrive, File, FolderInput, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MoveInvoiceDialog } from "./MoveInvoiceDialog";
import { Group } from "./GroupTree";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Invoice {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  r2Key: string;
  uploadedAt: string;
  groupId: string | null;
}

interface InvoiceListProps {
  refreshTrigger?: number;
  currentGroupId?: string | null;
  groups?: Group[];
  onInvoiceChange?: () => void;
}

export function InvoiceList({ refreshTrigger, currentGroupId, groups = [], onInvoiceChange }: InvoiceListProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [moveInvoiceDialogOpen, setMoveInvoiceDialogOpen] = useState(false);
  const [invoiceToMove, setInvoiceToMove] = useState<Invoice | null>(null);
  const [sendInvoiceDialogOpen, setSendInvoiceDialogOpen] = useState(false);
  const [invoiceToSend, setInvoiceToSend] = useState<Invoice | null>(null);
  const [isSending, setIsSending] = useState(false);
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
      setInvoices(data.invoices);
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

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger, currentGroupId]);

  // Filter invoices by current group
  const filteredInvoices = currentGroupId !== undefined
    ? invoices.filter((inv) => inv.groupId === currentGroupId)
    : invoices;

  const handleDownload = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/download`);
      if (!response.ok) throw new Error("Failed to get download URL");
      
      const { downloadUrl, fileName } = await response.json();
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Download started",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const handleView = async (invoice: Invoice) => {
    try {
      setIsLoadingPreview(true);
      setPreviewInvoice(invoice);
      
      const response = await fetch(`/api/invoices/${invoice.id}/download`);
      if (!response.ok) throw new Error("Failed to get preview URL");
      
      const { downloadUrl } = await response.json();
      setPreviewUrl(downloadUrl);
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Error",
        description: "Failed to load preview",
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
        title: "Success",
        description: "Invoice deleted successfully",
      });

      // Refresh the list
      fetchInvoices();
      onInvoiceChange?.(); // Notify parent to refresh groups
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleClosePreview = () => {
    setPreviewInvoice(null);
    setPreviewUrl(null);
  };

  const handleMoveClick = (invoice: Invoice) => {
    setInvoiceToMove(invoice);
    setMoveInvoiceDialogOpen(true);
  };

  const handleMoveSuccess = () => {
    fetchInvoices();
    onInvoiceChange?.(); // Notify parent to refresh groups
  };

  const handleSendClick = (invoice: Invoice) => {
    setInvoiceToSend(invoice);
    
    // Get default values from SMTP settings
    const savedSmtp = localStorage.getItem("custom_smtp_settings");
    let defaultSenderName = "";
    let defaultReplyTo = "";
    
    if (savedSmtp) {
      const smtpSettings = JSON.parse(savedSmtp);
      defaultSenderName = smtpSettings.senderName || "";
      defaultReplyTo = smtpSettings.replyTo || "";
    }
    
    setEmailData({
      recipientEmail: "",
      subject: `Invoice: ${invoice.fileName}`,
      message: `Dear recipient,\n\nPlease find attached the invoice ${invoice.fileName}.\n\nBest regards`,
      senderName: defaultSenderName,
      replyTo: defaultReplyTo,
    });
    setSendInvoiceDialogOpen(true);
  };

  const handleSendInvoice = async () => {
    if (!invoiceToSend) return;

    if (!emailData.recipientEmail || !emailData.subject) {
      toast({
        title: "Error",
        description: "Please fill in recipient email and subject",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Get custom SMTP settings from localStorage
      const customSmtpStr = localStorage.getItem("custom_smtp_settings");
      const customSmtp = customSmtpStr ? JSON.parse(customSmtpStr) : null;

      const response = await fetch(`/api/invoices/${invoiceToSend.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailData,
          customSmtp,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invoice");
      }

      toast({
        title: "Success",
        description: `Invoice sent to ${emailData.recipientEmail}`,
      });

      setSendInvoiceDialogOpen(false);
      setInvoiceToSend(null);
      setEmailData({ recipientEmail: "", subject: "", message: "", senderName: "", replyTo: "" });
    } catch (error: any) {
      console.error("Send invoice error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Calculate statistics
  const totalInvoices = filteredInvoices.length;
  const totalSize = filteredInvoices.reduce((sum, invoice) => sum + invoice.fileSize, 0);

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {totalInvoices === 1 ? "invoice" : "invoices"} stored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              across all invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
          <CardDescription>
            Manage and download your uploaded invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {currentGroupId !== undefined && currentGroupId !== null
                  ? "No invoices in this group"
                  : "No invoices uploaded yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <ContextMenu key={invoice.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow 
                          className="cursor-pointer hover:bg-accent/50"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                        >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {invoice.fileName}
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(invoice.fileSize)}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.uploadedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(invoice);
                            }}
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(invoice);
                            }}
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveClick(invoice);
                            }}
                            title="Move to Group"
                          >
                            <FolderInput className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(invoice.id);
                            }}
                            className="text-destructive hover:text-destructive"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-56">
                    <ContextMenuItem
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleView(invoice)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Quick Preview
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleDownload(invoice)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleSendClick(invoice)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invoice
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleMoveClick(invoice)}
                    >
                      <FolderInput className="mr-2 h-4 w-4" />
                      Move to Group
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleDeleteClick(invoice.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => handleClosePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewInvoice?.fileName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : previewUrl && previewInvoice ? (
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {previewInvoice.mimeType === "application/pdf" ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[600px]"
                    title="Invoice Preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Invoice Preview"
                    className="w-full h-auto max-h-[600px] object-contain"
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
        invoice={invoiceToMove}
        groups={groups}
        onSuccess={handleMoveSuccess}
      />

      {/* Send Invoice Dialog */}
      <Dialog open={sendInvoiceDialogOpen} onOpenChange={setSendInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Send {invoiceToSend?.fileName} as an email attachment with customizable headers
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Left Column - Email Form */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Email Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="recipient@example.com"
                    value={emailData.recipientEmail}
                    onChange={(e) =>
                      setEmailData({ ...emailData, recipientEmail: e.target.value })
                    }
                    disabled={isSending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Invoice: ..."
                    value={emailData.subject}
                    onChange={(e) =>
                      setEmailData({ ...emailData, subject: e.target.value })
                    }
                    disabled={isSending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name (Optional)</Label>
                  <Input
                    id="senderName"
                    placeholder="Your Company Name"
                    value={emailData.senderName}
                    onChange={(e) =>
                      setEmailData({ ...emailData, senderName: e.target.value })
                    }
                    disabled={isSending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply-To Email (Optional)</Label>
                  <Input
                    id="replyTo"
                    type="email"
                    placeholder="replies@yourdomain.com"
                    value={emailData.replyTo}
                    onChange={(e) =>
                      setEmailData({ ...emailData, replyTo: e.target.value })
                    }
                    disabled={isSending}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message..."
                  rows={6}
                  value={emailData.message}
                  onChange={(e) =>
                    setEmailData({ ...emailData, message: e.target.value })
                  }
                  disabled={isSending}
                />
              </div>
            </div>

            {/* Right Column - Email Preview */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Email Preview</h3>
              <div className="bg-white border rounded-lg p-4 text-sm" style={{borderColor: '#e5e5e5', backgroundColor: '#ffffff'}}>
                <div className="border-b pb-2 mb-3" style={{borderColor: '#e5e5e5'}}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium text-gray-900">
                        {emailData.senderName ? `${emailData.senderName}` : 'InvoiceGen'}
                        {emailData.recipientEmail && (
                          <span className="text-gray-500"> &lt;email@address&gt;</span>
                        )}
                      </div>
                      <div className="text-gray-600 text-xs">to: {emailData.recipientEmail || 'recipient@example.com'}</div>
                    </div>
                    <div className="text-xs text-gray-500">Just now</div>
                  </div>
                  <div className="font-medium text-gray-900">
                    {emailData.subject || 'Invoice: [filename]'}
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">
                    {emailData.message || 
                      `Dear recipient,\n\nPlease find attached the invoice ${invoiceToSend?.fileName}.\n\nBest regards`}
                  </p>
                  <div className="border rounded p-2 bg-gray-50 flex items-center text-xs text-gray-600">
                    <div className="bg-gray-200 rounded w-8 h-8 flex items-center justify-center mr-2">
                      📎
                    </div>
                    <div>
                      <div className="font-medium">{invoiceToSend?.fileName}</div>
                      <div>{invoiceToSend && Math.round(invoiceToSend.fileSize / 1024)} KB • PDF</div>
                    </div>
                  </div>
                  {emailData.replyTo && (
                    <div className="mt-2 text-xs text-gray-500">
                      Reply-To: {emailData.replyTo}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>💡 <strong>Preview:</strong> This shows roughly how your email will appear in Gmail and other email clients.</p>
                <p>The sender name and reply-to address help recipients identify who sent the invoice.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendInvoiceDialogOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button onClick={handleSendInvoice} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

