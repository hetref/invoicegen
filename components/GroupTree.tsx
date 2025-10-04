"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreVertical } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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

    return (
      <div key={group.id}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded-md hover:bg-accent group cursor-pointer relative",
                isSelected && "bg-accent"
              )}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
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

              <div
                className="flex items-center gap-2 flex-1 min-w-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onGroupSelect(group.id);
                }}
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-sm truncate">{group.name}</span>
                {(group._count?.invoices || 0) > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({group._count?.invoices})
                  </span>
                )}
              </div>

            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onCreateGroup(group.id)}>
              New Subfolder
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onRenameGroup(group)}>
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onDeleteGroup(group)}
              className="text-destructive"
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isExpanded && hasChildren && (
          <div>
            {group.children?.map((child) => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2">
      {/* Root level */}
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent cursor-pointer mb-1",
          currentGroupId === null && "bg-accent"
        )}
        onClick={() => onGroupSelect(null)}
      >
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">All Invoices</span>
      </div>

      {/* Groups */}
      {rootGroups.map((group) => renderGroup(group))}
    </div>
  );
}
