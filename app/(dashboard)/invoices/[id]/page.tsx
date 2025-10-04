"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GroupTree, Group } from "@/components/GroupTree";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { RenameGroupDialog } from "@/components/RenameGroupDialog";
import { DeleteGroupDialog } from "@/components/DeleteGroupDialog";

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

  // Group dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogParentId, setCreateDialogParentId] = useState<
    string | null
  >(null);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  useEffect(() => {
    fetchInvoice();
    fetchGroups();
    fetchUserProfile();
    
    // Check if user has API key in localStorage
    const apiKey = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!apiKey);
    
    // Poll for extraction status every 5 seconds if processing
    const interval = setInterval(() => {
      if (invoice?.extractionStatus === "processing") {
        fetchInvoice();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [params.id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) return;
      
      const data = await response.json();
      setUserProfile({ hasUsedFreeExtraction: data.user.hasUsedFreeExtraction });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      console.log("response", response);

      const data = await response.json();
      console.log("data", data);
      setInvoice(data.invoice);
      setCurrentGroupId(data.invoice.groupId);

      // Get download URL
      const urlResponse = await fetch(`/api/invoices/${params.id}/download`);
      if (urlResponse.ok) {
        const urlData = await urlResponse.json();
        console.log("urlData", urlData);
        setInvoiceUrl(urlData.downloadUrl);
      }
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
    setExtracting(true);
    try {
      // Get API key from localStorage
      const userApiKey = localStorage.getItem("gemini_api_key");

      const response = await fetch(`/api/invoices/${params.id}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userApiKey: userApiKey || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || "Failed to start extraction");
      }

      toast({
        title: "Extraction Started",
        description:
          "You will receive an email when the extraction is complete.",
      });

      // Refresh invoice data and user profile
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

  const handleDownload = async () => {
    if (invoiceUrl) {
      window.open(invoiceUrl, "_blank");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Invoice not found</p>
      </div>
    );
  }

  const isPdf = invoice.mimeType === "application/pdf";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Group Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Folders</CardTitle>
              </CardHeader>
              <CardContent className="px-2">
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>

                {/* Edit button for manually created invoices */}
                {invoice.isManuallyCreated && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/new?invoiceId=${invoice.id}`)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}

                {/* Extract button only for uploaded (non-manually created) invoices */}
                {!invoice.isManuallyCreated &&
                  !invoice.isExtracted &&
                  invoice.extractionStatus !== "processing" && (
                    <>
                      {!hasApiKey && userProfile?.hasUsedFreeExtraction ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block">
                                <Button
                                  disabled={true}
                                  className="gap-2"
                                >
                                  <Sparkles className="h-4 w-4" />
                                  Extract Invoice With AI
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Add your own Gemini AI API key in the profile page for unlimited AI extractions</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Button
                          onClick={handleExtract}
                          disabled={extracting}
                          className="gap-2"
                        >
                          {extracting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Extract Invoice With AI
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}

                {invoice.extractionStatus === "processing" && (
                  <Badge variant="secondary" className="gap-2 px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Invoice Preview */}
              <Card className="lg:sticky lg:top-6 h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {invoice.fileName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoiceUrl && (
                    <div className="w-full">
                      {isPdf ? (
                        <iframe
                          src={invoiceUrl}
                          className="w-full h-[600px] border rounded-md"
                          title="Invoice PDF"
                        />
                      ) : (
                        <img
                          src={invoiceUrl}
                          alt="Invoice"
                          className="w-full h-auto border rounded-md"
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right: Extracted Data */}
              <div className="space-y-4">
                {!invoice.isExtracted && !invoice.isManuallyCreated ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Extracted Data Yet
                      </h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Click the "Extract Invoice With AI" button to
                        automatically extract all invoice details using AI.
                      </p>
                    </CardContent>
                  </Card>
                ) : invoice.isExtracted || invoice.isManuallyCreated ? (
                  <>
                    {/* Basic Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Invoice Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {invoice.invoiceNumber && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Invoice Number
                            </p>
                            <p className="font-medium">
                              {invoice.invoiceNumber}
                            </p>
                          </div>
                        )}
                        {invoice.invoiceDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Date
                              </p>
                              <p className="font-medium">
                                {invoice.invoiceDate}
                              </p>
                            </div>
                          </div>
                        )}
                        {invoice.totalAmount && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Total Amount
                            </p>
                            <p className="text-2xl font-bold">
                              {invoice.currency || "INR"}{" "}
                              {invoice.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Billed To */}
                    {invoice.billedToName && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Billed To
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="font-medium">{invoice.billedToName}</p>
                          {invoice.billedToAddress && (
                            <p className="text-sm text-muted-foreground flex gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {invoice.billedToAddress}
                            </p>
                          )}
                          {invoice.billedToGst && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">
                                GST:
                              </span>{" "}
                              {invoice.billedToGst}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Payment To */}
                    {invoice.paymentToName && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment To
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="font-medium">{invoice.paymentToName}</p>
                          {invoice.paymentToAddress && (
                            <p className="text-sm text-muted-foreground flex gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {invoice.paymentToAddress}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Items */}
                    {invoice.items &&
                      Array.isArray(invoice.items) &&
                      invoice.items.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Items</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {invoice.items.map((item: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-3 border rounded-md"
                                >
                                  <p className="font-medium">
                                    {item.description}
                                  </p>
                                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                    <span>
                                      Qty: {item.qty} ×{" "}
                                      {invoice.currency || "INR"} {item.price}
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {invoice.currency || "INR"}{" "}
                                      {item.subtotal}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                    {/* Payment Details */}
                    {invoice.paymentDetails && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {invoice.paymentDetails.accountNumber && (
                            <div>
                              <span className="text-muted-foreground">
                                Account:
                              </span>{" "}
                              {invoice.paymentDetails.accountNumber}
                            </div>
                          )}
                          {invoice.paymentDetails.ifsc && (
                            <div>
                              <span className="text-muted-foreground">
                                IFSC:
                              </span>{" "}
                              {invoice.paymentDetails.ifsc}
                            </div>
                          )}
                          {invoice.paymentDetails.upi && (
                            <div>
                              <span className="text-muted-foreground">
                                UPI:
                              </span>{" "}
                              {invoice.paymentDetails.upi}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Contact Info */}
                    {invoice.contactInfo && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {invoice.contactInfo.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {invoice.contactInfo.phone}
                            </div>
                          )}
                          {invoice.contactInfo.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {invoice.contactInfo.email}
                            </div>
                          )}
                          {invoice.contactInfo.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              {invoice.contactInfo.website}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Dialogs */}
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
