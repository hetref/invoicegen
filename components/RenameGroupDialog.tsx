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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Group } from "./GroupTree";

interface RenameGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onSuccess: () => void;
}

export function RenameGroupDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
}: RenameGroupDialogProps) {
  const [name, setName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (group) {
      setName(group.name);
    }
  }, [group]);

  const handleRename = async () => {
    if (!group) return;

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Group name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (name.trim() === group.name) {
      onOpenChange(false);
      return;
    }

    if (name.trim().length > 50) {
      toast({
        title: "Error",
        description: "Group name cannot be longer than 50 characters",
        variant: "destructive",
      });
      return;
    }

    setIsRenaming(true);
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename group");
      }

      toast({
        title: "Success",
        description: "Group renamed successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Rename group error:", error);
      toast({
        title: "Error",
        description: "Failed to rename group",
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleClose = () => {
    if (!isRenaming) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Rename Folder</DialogTitle>
          <DialogDescription className="text-xs">
            Enter a new name for "{group?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-name" className="text-xs font-medium">Folder Name</Label>
            <Input
              id="new-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRenaming) {
                  handleRename();
                }
              }}
              disabled={isRenaming}
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
            disabled={isRenaming}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleRename} disabled={isRenaming} className="text-xs h-9">
            {isRenaming ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Renaming...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

