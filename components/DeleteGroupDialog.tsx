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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Group
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{group?.name}"?
          </DialogDescription>
        </DialogHeader>

        {hasContent && (
          <div className="space-y-4 py-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">This group contains:</p>
              <ul className="list-disc list-inside space-y-1">
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

            <RadioGroup value={deleteAction} onValueChange={(v: any) => setDeleteAction(v)}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="move" id="move" />
                <div className="flex-1">
                  <Label htmlFor="move" className="font-medium cursor-pointer">
                    Move contents to another location
                  </Label>
                  {deleteAction === "move" && (
                    <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
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

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="delete" id="delete" />
                <div className="flex-1">
                  <Label htmlFor="delete" className="font-medium cursor-pointer text-destructive">
                    Delete all contents permanently
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will permanently delete all invoices and subfolders
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {!hasContent && (
          <p className="text-sm text-muted-foreground py-4">
            This group is empty and will be deleted.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

