"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreVertical,
  FolderPlus,
  Edit2,
  Trash2,
  Files,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Group {
  id: string;
  name: string;
  parentId: string | null;
  children?: Group[];
  _count?: {
    invoices: number;
    children: number;
  };
}

interface GroupTreeProps {
  groups: Group[];
  currentGroupId: string | null;
  onGroupSelect: (groupId: string | null) => void;
  onCreateGroup: (parentId: string | null) => void;
  onRenameGroup: (group: Group) => void;
  onDeleteGroup: (group: Group) => void;
}

export function GroupTree({
  groups,
  currentGroupId,
  onGroupSelect,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
}: GroupTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  const renderGroup = (group: Group, level: number = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const isSelected = currentGroupId === group.id;
    const hasChildren = (group.children?.length || 0) > 0;
    const invoiceCount = group._count?.invoices || 0;

    return (
      <div key={group.id} className="relative select-none">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                "group relative flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                isSelected
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              style={{ paddingLeft: `${level * 14 + 8}px` }}
              onClick={() => onGroupSelect(group.id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
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
                  <span className="w-3" />
                )}

                {isExpanded ? (
                  <FolderOpen className={cn("h-4 w-4 shrink-0 transition-colors", isSelected ? "text-primary" : "text-amber-500/80")} />
                ) : (
                  <Folder className={cn("h-4 w-4 shrink-0 transition-colors", isSelected ? "text-primary" : "text-amber-500/80")} />
                )}

                <span className="truncate">{group.name}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {invoiceCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] tabular-nums px-1.5 py-0.5 rounded-full",
                      isSelected
                        ? "bg-primary/20 text-primary font-bold"
                        : "bg-muted text-muted-foreground group-hover:bg-background"
                    )}
                  >
                    {invoiceCount}
                  </span>
                )}

                {/* Dropdown Menu for quick touch/click actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 p-0 hover:bg-background/80 transition-opacity"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 text-xs">
                    <DropdownMenuItem onClick={() => onCreateGroup(group.id)} className="gap-2">
                      <FolderPlus className="h-3.5 w-3.5" />
                      New Subfolder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRenameGroup(group)} className="gap-2">
                      <Edit2 className="h-3.5 w-3.5" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteGroup(group)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-44 text-xs">
            <ContextMenuItem onClick={() => onCreateGroup(group.id)} className="gap-2">
              <FolderPlus className="h-3.5 w-3.5" />
              New Subfolder
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onRenameGroup(group)} className="gap-2">
              <Edit2 className="h-3.5 w-3.5" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onDeleteGroup(group)}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isExpanded && hasChildren && (
          <div className="relative border-l border-border/40 ml-3.5 pl-0.5 space-y-0.5 my-0.5">
            {group.children?.map((child) => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalInvoicesCount = groups.reduce((acc, g) => acc + (g._count?.invoices || 0), 0);

  return (
    <div className="space-y-1 py-1">
      {/* Root level - All Invoices */}
      <div
        className={cn(
          "flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all",
          currentGroupId === null
            ? "bg-primary/10 text-primary font-semibold shadow-xs"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
        onClick={() => onGroupSelect(null)}
      >
        <div className="flex items-center gap-2">
          <Files className={cn("h-4 w-4", currentGroupId === null ? "text-primary" : "text-muted-foreground")} />
          <span>All Invoices</span>
        </div>
        {totalInvoicesCount > 0 && (
          <span
            className={cn(
              "text-[10px] tabular-nums px-1.5 py-0.5 rounded-full",
              currentGroupId === null
                ? "bg-primary/20 text-primary font-bold"
                : "bg-muted text-muted-foreground"
            )}
          >
            {totalInvoicesCount}
          </span>
        )}
      </div>

      {/* Group Hierarchy */}
      <div className="space-y-0.5 pt-1">
        {rootGroups.length === 0 ? (
          <div className="px-2.5 py-3 text-center text-[11px] text-muted-foreground">
            No folders yet. Click <span className="font-semibold">+</span> to create one.
          </div>
        ) : (
          rootGroups.map((group) => renderGroup(group))
        )}
      </div>
    </div>
  );
}
