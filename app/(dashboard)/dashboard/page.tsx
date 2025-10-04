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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FolderPlus, Loader2, Upload, FileText, FolderTree as FolderTreeIcon } from "lucide-react";
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
  const { toast } = useToast();
  const router = useRouter();

  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      
      const data = await response.json();
      setGroups(data.groups);
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

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleUploadComplete = () => {
    fetchGroups(); // Refresh groups to update counts
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleInvoiceChange = () => {
    fetchGroups(); // Refresh groups when invoices are moved or deleted
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
    // If we deleted the current group, go back to root
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Desktop Sidebar - Group Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Folders</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCreateGroup()}
                    className="h-8 w-8 p-0"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </div>
                {isLoadingGroups ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Mobile Folder Button & Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Folder Sheet */}
              <div className="lg:hidden">
                <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <FolderTreeIcon className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle>Folders</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {isLoadingGroups ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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

              {/* Breadcrumb */}
              <div className="flex-1 min-w-0 overflow-x-auto">
                <GroupBreadcrumb
                  currentGroupId={currentGroupId}
                  groups={groups}
                  onGroupSelect={setCurrentGroupId}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => setUploadCardOpen(!uploadCardOpen)}
                variant={uploadCardOpen ? "default" : "outline"}
                className="gap-2 flex-1 sm:flex-none"
                size="sm"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden xs:inline">
                  {uploadCardOpen ? "Hide Upload" : "Upload Invoice"}
                </span>
                <span className="xs:hidden my-1 md:my-0">Upload</span>
              </Button>
              <Button
                onClick={() => {
                  const groupParam = currentGroupId ? `?groupId=${currentGroupId}` : "";
                  router.push(`/new${groupParam}`);
                }}
                variant="outline"
                className="gap-2 flex-1 sm:flex-none"
                size="sm"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden xs:inline">Create Invoice</span>
                <span className="xs:hidden my-1 md:my-0">Create</span>
              </Button>
              <Button 
                onClick={() => handleCreateGroup()} 
                className="gap-2 flex-1 sm:flex-none lg:hidden"
                size="sm"
              >
                <FolderPlus className="h-4 w-4" />
                <span className="hidden xs:inline">New Folder</span>
                <span className="xs:hidden my-1 md:my-0">Folder</span>
              </Button>
            </div>

            {/* Upload Section */}
            <InvoiceUpload
              onUploadComplete={handleUploadComplete}
              currentGroupId={currentGroupId}
              isOpen={uploadCardOpen}
              onOpenChange={setUploadCardOpen}
            />

            {/* Invoice List Section */}
            <InvoiceList
              refreshTrigger={refreshTrigger}
              currentGroupId={currentGroupId}
              groups={groups}
              onInvoiceChange={handleInvoiceChange}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
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
