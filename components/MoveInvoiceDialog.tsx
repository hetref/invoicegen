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
            "flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors",
            isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          )}
          style={{ paddingLeft: `${level * 14 + 8}px` }}
          onClick={() => setTargetGroupId(group.id)}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(group.id);
              }}
              className="p-0.5 -ml-1 text-muted-foreground/70 hover:text-foreground rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <div className="w-3.5" />
          )}

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <FolderOpen className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-amber-500/80")} />
            ) : (
              <Folder className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-amber-500/80")} />
            )}
            <span className="truncate">{group.name}</span>
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
      <DialogContent className="rounded-2xl sm:max-w-[425px] max-h-[460px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FolderInput className="h-4 w-4 text-primary" />
            Move Invoice
          </DialogTitle>
          <DialogDescription className="text-xs truncate max-w-[360px]">
            Move "{invoice?.fileName}" to a destination folder
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-1">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Select Destination Folder</Label>
            <div className="border border-border/60 rounded-xl p-2 max-h-[220px] overflow-y-auto bg-muted/10 space-y-0.5">
              {/* Root level */}
              <div
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  targetGroupId === "root" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTargetGroupId("root")}
              >
                <FolderOpen className={cn("h-4 w-4", targetGroupId === "root" ? "text-primary" : "text-amber-500/80")} />
                <span>All Invoices (Root)</span>
              </div>

              {/* Groups */}
              {rootGroups.map((group) => renderGroup(group))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isMoving} className="text-xs h-9">
            Cancel
          </Button>
          <Button size="sm" onClick={handleMove} disabled={isMoving} className="text-xs h-9">
            {isMoving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Moving...
              </>
            ) : (
              "Move Here"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

