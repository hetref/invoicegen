"use client";

import { ChevronRight, Folder, Home, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Group } from "./GroupTree";

interface GroupBreadcrumbProps {
  currentGroupId: string | null;
  groups: Group[];
  onGroupSelect: (groupId: string | null) => void;
}

export function GroupBreadcrumb({
  currentGroupId,
  groups,
  onGroupSelect,
}: GroupBreadcrumbProps) {
  // Build breadcrumb path
  const buildPath = (groupId: string | null): Group[] => {
    if (!groupId) return [];

    const path: Group[] = [];
    let currentId: string | null = groupId;

    while (currentId) {
      const group = groups.find((g) => g.id === currentId);
      if (!group) break;

      path.unshift(group);
      currentId = group.parentId;
    }

    return path;
  };

  const path = buildPath(currentGroupId);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground py-1 overflow-x-auto no-scrollbar">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 gap-1.5 text-xs font-medium hover:text-foreground shrink-0 rounded-md"
        onClick={() => onGroupSelect(null)}
      >
        <Home className="h-3.5 w-3.5 text-muted-foreground" />
        <span className={currentGroupId === null ? "text-foreground font-semibold" : ""}>
          All Invoices
        </span>
      </Button>

      {path.map((group, index) => {
        const isLast = index === path.length - 1;
        return (
          <div key={group.id} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 gap-1.5 text-xs font-medium hover:text-foreground whitespace-nowrap rounded-md ${
                isLast ? "text-foreground font-semibold bg-muted/40" : ""
              }`}
              onClick={() => onGroupSelect(group.id)}
            >
              <Folder className={`h-3.5 w-3.5 ${isLast ? "text-primary" : "text-amber-500/80"}`} />
              <span>{group.name}</span>
            </Button>
          </div>
        );
      })}
    </nav>
  );
}
