"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Group } from "./GroupTree";

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  allGroups: Group[];
  onSuccess: () => void;
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
  allGroups,
  onSuccess,
}: DeleteGroupDialogProps) {
  const [deleteAction, setDeleteAction] = useState<"delete" | "move">("move");
  const [targetGroupId, setTargetGroupId] = useState<string>("root");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const invoiceCount = group?._count?.invoices || 0;
  const childCount = group?._count?.children || 0;
  const hasContent = invoiceCount > 0 || childCount > 0;

  // Filter out the current group and its descendants
  const availableGroups = allGroups.filter((g) => g.id !== group?.id);

  const handleDelete = async () => {
    if (!group) return;

    setIsDeleting(true);
    try {
      const params = new URLSearchParams({
        action: deleteAction,
        ...(deleteAction === "move" && { targetGroupId }),
      });

      const response = await fetch(`/api/groups/${group.id}?${params}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      const deletionMessage = 
        deleteAction === "delete" && hasContent
          ? `Group and all its contents (${invoiceCount} ${invoiceCount === 1 ? "invoice" : "invoices"}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? "subfolder" : "subfolders"}` : ""}) deleted successfully`
          : deleteAction === "move" && hasContent
          ? `Group deleted and contents moved successfully`
          : "Group deleted successfully";

      toast({
        title: "Success",
        description: deletionMessage,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Delete group error:", error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setDeleteAction("move");
      setTargetGroupId("root");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Delete Folder
          </DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to delete folder "{group?.name}"?
          </DialogDescription>
        </DialogHeader>

        {hasContent && (
          <div className="space-y-4 py-2">
            <div className="bg-muted/40 border border-border/50 p-3 rounded-xl text-xs space-y-1.5">
              <p className="font-medium text-foreground">Folder Contents:</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                {invoiceCount > 0 && (
                  <li>
                    {invoiceCount} {invoiceCount === 1 ? "invoice" : "invoices"}
                  </li>
                )}
                {childCount > 0 && (
                  <li>
                    {childCount} {childCount === 1 ? "subfolder" : "subfolders"}
                  </li>
                )}
              </ul>
            </div>

            <RadioGroup value={deleteAction} onValueChange={(v: any) => setDeleteAction(v)} className="space-y-3">
              <div className="flex items-start space-x-2.5 rounded-xl border border-border/50 p-3 hover:bg-muted/20 transition-colors">
                <RadioGroupItem value="move" id="move" className="mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="move" className="text-xs font-medium cursor-pointer">
                    Move contents to another folder
                  </Label>
                  {deleteAction === "move" && (
                    <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="root">Root (All Invoices)</SelectItem>
                        {availableGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <RadioGroupItem value="delete" id="delete" className="mt-0.5 text-destructive" />
                <div className="flex-1">
                  <Label htmlFor="delete" className="text-xs font-medium cursor-pointer text-destructive">
                    Delete all contents permanently
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Permanently deletes all nested invoices and subfolders.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {!hasContent && (
          <p className="text-xs text-muted-foreground py-2">
            This folder is empty and will be safely deleted.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isDeleting} className="text-xs h-9">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs h-9"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

