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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
  onSuccess: () => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  parentId = null,
  onSuccess,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Group name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (name.length > 50) {
      toast({
        title: "Error",
        description: "Group name cannot be longer than 50 characters",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      setName("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Create group error:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {parentId ? "Create New Subfolder" : "Create New Folder"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {parentId
              ? "Create a nested subfolder to further organize your invoices"
              : "Create a new folder to organize and categorize your invoices"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name" className="text-xs font-medium">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="e.g. Q1 Expenses, Marketing Invoices"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreate();
                }
              }}
              disabled={isCreating}
              className="h-9 text-xs"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isCreating}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={isCreating} className="text-xs h-9">
            {isCreating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

