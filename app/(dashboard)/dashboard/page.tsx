"use client";

import { useState, useEffect } from "react";
import { InvoiceUpload } from "@/components/InvoiceUpload";
import { InvoiceList } from "@/components/InvoiceList";
import { GroupTree, Group } from "@/components/GroupTree";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { RenameGroupDialog } from "@/components/RenameGroupDialog";
import { DeleteGroupDialog } from "@/components/DeleteGroupDialog";
import { GroupBreadcrumb } from "@/components/GroupBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FolderPlus,
  Loader2,
  Upload,
  FileText,
  FolderTree as FolderTreeIcon,
  Plus,
  HardDrive,
  Sparkles,
  Folder,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [uploadCardOpen, setUploadCardOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogParentId, setCreateDialogParentId] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [groupToRename, setGroupToRename] = useState<Group | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Storage Stats Widget State
  const [storageData, setStorageData] = useState<{
    currentUsage: number;
    storageLimit: number;
    percentUsed: string;
  } | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchStorageInfo = async () => {
    try {
      const res = await fetch("/api/storage/check");
      if (res.ok) {
        const data = await res.json();
        setStorageData({
          currentUsage: data.currentUsage || 0,
          storageLimit: data.storageLimit || 41943040,
          percentUsed: data.percentUsed || "0",
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchStorageInfo();
  }, []);

  const handleUploadComplete = () => {
    fetchGroups();
    fetchStorageInfo();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleInvoiceChange = () => {
    fetchGroups();
    fetchStorageInfo();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreateGroup = (parentId: string | null = null) => {
    setCreateDialogParentId(parentId);
    setCreateDialogOpen(true);
    setMobileSheetOpen(false);
  };

  const handleRenameGroup = (group: Group) => {
    setGroupToRename(group);
    setRenameDialogOpen(true);
    setMobileSheetOpen(false);
  };

  const handleDeleteGroup = (group: Group) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
    setMobileSheetOpen(false);
  };

  const handleGroupSuccess = () => {
    fetchGroups();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteSuccess = () => {
    if (groupToDelete?.id === currentGroupId) {
      setCurrentGroupId(null);
    }
    fetchGroups();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleGroupSelect = (groupId: string | null) => {
    setCurrentGroupId(groupId);
    setMobileSheetOpen(false);
  };

  const currentGroupObj = groups.find((g) => g.id === currentGroupId);

  const formatMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {currentGroupObj ? currentGroupObj.name : "Invoice Management"}
              </h1>
              <Badge variant="secondary" className="text-[11px] font-mono px-2 py-0.5">
                {currentGroupId ? "Folder View" : "All Documents"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Store, organize, extract, and manage your invoice workflows with ease.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => setUploadCardOpen(!uploadCardOpen)}
              variant={uploadCardOpen ? "secondary" : "outline"}
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium border-border/80 shadow-xs"
            >
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{uploadCardOpen ? "Hide Upload" : "Upload Invoice"}</span>
            </Button>

            <Button
              type="button"
              onClick={() => {
                const groupParam = currentGroupId ? `?groupId=${currentGroupId}` : "";
                router.push(`/new${groupParam}`);
              }}
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Invoice</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
          {/* Desktop Left Sidebar: Folders Navigation */}
          <div className="hidden lg:block lg:col-span-1 sticky top-6">
            <Card className="border-border/60 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-border/40 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-amber-500/90" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Folders
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCreateGroup()}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Create New Folder"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-2">
                {isLoadingGroups ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs">Loading folders...</span>
                  </div>
                ) : (
                  <GroupTree
                    groups={groups}
                    currentGroupId={currentGroupId}
                    onGroupSelect={setCurrentGroupId}
                    onCreateGroup={handleCreateGroup}
                    onRenameGroup={handleRenameGroup}
                    onDeleteGroup={handleDeleteGroup}
                  />
                )}
              </CardContent>

              {/* Sidebar Footer Quota Mini Widget */}
              {storageData && (
                <div className="p-3 border-t border-border/40 bg-muted/10 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <HardDrive className="h-3 w-3 text-primary" />
                      Storage
                    </span>
                    <span>
                      {formatMB(storageData.currentUsage)} / {formatMB(storageData.storageLimit)} MB ({storageData.percentUsed}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        parseFloat(storageData.percentUsed) >= 90
                          ? "bg-destructive"
                          : parseFloat(storageData.percentUsed) >= 70
                          ? "bg-amber-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, parseFloat(storageData.percentUsed))}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Mobile Header Toolbar & Breadcrumb */}
            <div className="flex items-center gap-2 bg-card/60 p-2 rounded-xl border border-border/50">
              {/* Mobile Folder Sheet Trigger */}
              <div className="lg:hidden shrink-0">
                <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 text-xs">
                      <FolderTreeIcon className="h-3.5 w-3.5 text-amber-500" />
                      <span>Folders</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[360px] p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <SheetTitle className="text-sm font-semibold flex items-center gap-2">
                          <Folder className="h-4 w-4 text-amber-500" />
                          Folders
                        </SheetTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateGroup()}
                          className="h-7 text-xs gap-1"
                        >
                          <FolderPlus className="h-3.5 w-3.5" />
                          New
                        </Button>
                      </div>
                    </SheetHeader>
                    <div className="p-3 overflow-y-auto flex-1">
                      {isLoadingGroups ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <GroupTree
                          groups={groups}
                          currentGroupId={currentGroupId}
                          onGroupSelect={handleGroupSelect}
                          onCreateGroup={handleCreateGroup}
                          onRenameGroup={handleRenameGroup}
                          onDeleteGroup={handleDeleteGroup}
                        />
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Breadcrumb Path */}
              <div className="flex-1 min-w-0 overflow-x-auto">
                <GroupBreadcrumb
                  currentGroupId={currentGroupId}
                  groups={groups}
                  onGroupSelect={setCurrentGroupId}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCreateGroup()}
                className="hidden sm:inline-flex lg:hidden h-8 text-xs gap-1 shrink-0"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Folder
              </Button>
            </div>

            {/* Expandable Upload Dropzone */}
            <InvoiceUpload
              onUploadComplete={handleUploadComplete}
              currentGroupId={currentGroupId}
              isOpen={uploadCardOpen}
              onOpenChange={setUploadCardOpen}
            />

            {/* Invoices List with Metrics, Search, Sort & Table/Grid view */}
            <InvoiceList
              refreshTrigger={refreshTrigger}
              currentGroupId={currentGroupId}
              groups={groups}
              onInvoiceChange={handleInvoiceChange}
            />
          </div>
        </div>
      </div>

      {/* Group Dialogs */}
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={createDialogParentId}
        onSuccess={handleGroupSuccess}
      />

      <RenameGroupDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        group={groupToRename}
        onSuccess={handleGroupSuccess}
      />

      <DeleteGroupDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        group={groupToDelete}
        allGroups={groups}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
