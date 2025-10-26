"use client";

import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchApplyButtonProps {
  isActive: boolean;
  selectedCount: number;
  onToggle: () => void;
  className?: string;
}

export function BatchApplyButton({
  isActive,
  selectedCount,
  onToggle,
  className,
}: BatchApplyButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className={cn("gap-2", className)}
    >
      {isActive ? (
        <CheckSquare className="h-4 w-4" />
      ) : (
        <Square className="h-4 w-4" />
      )}
      {isActive && selectedCount > 0 ? (
        <span>Apply to {selectedCount}</span>
      ) : (
        <span>Batch Apply</span>
      )}
    </Button>
  );
}
