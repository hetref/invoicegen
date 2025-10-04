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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Group</DialogTitle>
          <DialogDescription>
            Enter a new name for "{group?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">New Name</Label>
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
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRenaming}
          >
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming}>
            {isRenaming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Renaming...
              </>
            ) : (
              "Rename"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

