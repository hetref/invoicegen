"use client";

import { ChevronRight, Home } from "lucide-react";
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
    <div className="flex items-center gap-1 text-sm text-muted-foreground py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 hover:text-foreground flex-shrink-0"
        onClick={() => onGroupSelect(null)}
      >
        <Home className="h-4 w-4" />
      </Button>

      {path.map((group) => (
        <div key={group.id} className="flex items-center gap-1 flex-shrink-0">
          <ChevronRight className="h-4 w-4" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 hover:text-foreground whitespace-nowrap"
            onClick={() => onGroupSelect(group.id)}
          >
            {group.name}
          </Button>
        </div>
      ))}
    </div>
  );
}

