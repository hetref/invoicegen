"use client";

import { useState, useEffect } from "react";
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
import { Loader2, FolderInput, ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Group } from "./GroupTree";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  fileName: string;
  groupId: string | null;
}

interface MoveInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  groups: Group[];
  onSuccess: () => void;
}

export function MoveInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  groups,
  onSuccess,
}: MoveInvoiceDialogProps) {
  const [targetGroupId, setTargetGroupId] = useState<string>("root");
  const [isMoving, setIsMoving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (invoice) {
      setTargetGroupId(invoice.groupId || "root");
    }
  }, [invoice]);

  // Build tree structure
  const buildTree = (parentId: string | null = null): Group[] => {
    return groups
      .filter((g) => g.parentId === parentId)
      .map((group) => ({
        ...group,
        children: buildTree(group.id),
      }));
  };

  const rootGroups = buildTree(null);

  const toggleExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleMove = async () => {
    if (!invoice) return;

    const newGroupId = targetGroupId === "root" ? null : targetGroupId;

    if (newGroupId === invoice.groupId) {
      onOpenChange(false);
      return;
    }

    setIsMoving(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: newGroupId }),
      });

      if (!response.ok) {
        throw new Error("Failed to move invoice");
      }

      toast({
        title: "Success",
        description: "Invoice moved successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Move invoice error:", error);
      toast({
        title: "Error",
        description: "Failed to move invoice",
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    if (!isMoving) {
      onOpenChange(false);
    }
  };

  const renderGroup = (group: Group, level: number = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const isSelected = targetGroupId === group.id;
    const hasChildren = (group.children?.length || 0) > 0;

    return (
      <div key={group.id}>
        <div
          className={cn(
            "flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer",
            isSelected && "bg-accent"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setTargetGroupId(group.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(group.id);
              }}
              className="p-0.5 hover:bg-accent-foreground/10 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm truncate">{group.name}</span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {group.children?.map((child) => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[400px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-5 w-5" />
            Move Invoice
          </DialogTitle>
          <DialogDescription>
            Move "{invoice?.fileName}" to a different location
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="space-y-2">
            <Label>Select Destination Folder</Label>
            <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
              {/* Root level */}
              <div
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer mb-1",
                  targetGroupId === "root" && "bg-accent"
                )}
                onClick={() => setTargetGroupId("root")}
              >
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Root (All Invoices)</span>
              </div>

              {/* Groups */}
              {rootGroups.map((group) => renderGroup(group))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isMoving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              "Move"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

