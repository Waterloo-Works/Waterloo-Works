"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@prisma/client";

interface JobCheckboxProps {
  jobId: string;
  isSelected: boolean;
  applicationStatus: ApplicationStatus | null;
  onSelect: (jobId: string, checked: boolean) => void;
  className?: string;
}

export function JobCheckbox({
  jobId,
  isSelected,
  applicationStatus,
  onSelect,
  className,
}: JobCheckboxProps) {
  const alreadyApplied = applicationStatus !== null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        checked={isSelected}
        disabled={alreadyApplied}
        onCheckedChange={(checked) => onSelect(jobId, checked as boolean)}
        aria-label={
          alreadyApplied
            ? `Already applied (${applicationStatus})`
            : "Select for batch apply"
        }
      />
      {alreadyApplied && (
        <Badge variant="secondary" className="text-xs">
          Applied
        </Badge>
      )}
    </div>
  );
}
