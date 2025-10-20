"use client";

import { useState } from "react";
import { approveJob, rejectJob } from "@/app/actions/jobs";

export default function ApprovalButtons({ jobId }: { jobId: string }) {
	const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleApprove = async () => {
		setLoading("approve");
		const result = await approveJob(jobId);
		if (!result.success) {
			alert(result.error);
		}
		setLoading(null);
	};

	const handleReject = async () => {
		if (!rejectionReason.trim()) {
			setError("Please provide a rejection reason");
			return;
		}

		setLoading("reject");
		setError(null);
		const result = await rejectJob(jobId, rejectionReason);
		if (result.success) {
			setShowRejectModal(false);
			setRejectionReason("");
		} else {
			setError(result.error || "Failed to reject job");
		}
		setLoading(null);
	};

	return (
		<>
			<div className="flex gap-3">
				<button
					onClick={handleApprove}
					disabled={loading !== null}
					className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
				>
					{loading === "approve" ? "Approving..." : "Approve"}
				</button>
				<button
					onClick={() => setShowRejectModal(true)}
					disabled={loading !== null}
					className="px-4 py-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
				>
					Reject
				</button>
			</div>

			{/* Rejection Modal */}
			{showRejectModal && (
				<div className="fixed inset-0 bg-background/50 flex items-center justify-center p-4 z-50">
					<div className="bg-card rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-header mb-4 text-foreground">Reject Job Submission</h3>
						<p className="text-foreground mb-4">
							Please provide a reason for rejecting this job posting:
						</p>
						<textarea
							value={rejectionReason}
							onChange={e => setRejectionReason(e.target.value)}
							placeholder="e.g., Missing required information, inappropriate content..."
							rows={4}
							className="w-full px-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring mb-4"
						/>
						{error && (
							<div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
								{error}
							</div>
						)}
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowRejectModal(false);
									setRejectionReason("");
									setError(null);
								}}
								disabled={loading !== null}
								className="flex-1 px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleReject}
								disabled={loading !== null}
								className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading === "reject"
									? "Rejecting..."
									: "Confirm Rejection"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
