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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Building, MapPin, Briefcase, Loader2 } from "lucide-react";
import { batchApply, type BatchApplyResult } from "@/app/actions/applications";
import { toast } from "sonner";

type Job = Awaited<ReturnType<typeof import("@/app/actions/jobs").getJobs>>[number];

interface BatchApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJobs: Job[];
  resumeFileName: string | null;
  resumeUploadedAt: Date | null;
  onSuccess: () => void;
}

export function BatchApplyModal({
  isOpen,
  onClose,
  selectedJobs,
  resumeFileName,
  resumeUploadedAt,
  onSuccess,
}: BatchApplyModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!resumeFileName) {
      toast.error("Please upload your resume before applying");
      return;
    }

    setIsSubmitting(true);

    try {
      const result: BatchApplyResult = await batchApply({
        jobIds: selectedJobs.map((j) => j.id),
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        toast.success(
          `Successfully applied to ${result.appliedCount} job${result.appliedCount !== 1 ? "s" : ""}!`,
          {
            description:
              result.skippedCount > 0
                ? `${result.skippedCount} job${result.skippedCount !== 1 ? "s" : ""} skipped (already applied)`
                : undefined,
          }
        );
        onSuccess();
        onClose();
        setNotes("");
      } else {
        toast.error("Failed to apply to jobs", {
          description: result.errors[0]?.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Batch apply error:", error);
      toast.error("Failed to apply to jobs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply to {selectedJobs.length} Jobs</DialogTitle>
          <DialogDescription>
            Review your application details before submitting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resume Preview */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">
                  {resumeFileName || "No resume uploaded"}
                </p>
                {resumeUploadedAt && (
                  <p className="text-sm text-muted-foreground">
                    Last updated{" "}
                    {new Date(resumeUploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selected Jobs List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Jobs</p>
            <ScrollArea className="h-48 rounded-lg border">
              <div className="p-2">
                {selectedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50"
                  >
                    {job.companyImageUrl && (
                      <img
                        src={job.companyImageUrl}
                        alt={job.company}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    {!job.companyImageUrl && (
                      <Building className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.position}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {job.employmentType.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <label
              htmlFor="batch-apply-notes"
              className="text-sm font-medium"
            >
              Notes (optional)
            </label>
            <Textarea
              id="batch-apply-notes"
              placeholder="Add notes for these applications (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Applying..." : "Confirm & Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
