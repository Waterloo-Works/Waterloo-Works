"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ResumeUploaderProps {
	currentFile?: string | null;
	currentFileName?: string | null;
	onUploadSuccess?: (data: {
		url: string;
		fileName: string;
		extractedData?: any;
		parsingError?: string | null;
	}) => void;
}

export function ResumeUploader({
	currentFile,
	currentFileName,
	onUploadSuccess,
}: ResumeUploaderProps) {
	const [uploading, setUploading] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleUpload = async (file: File) => {
		// Validate file type
		const validTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];

		if (!validTypes.includes(file.type)) {
			toast.error("Invalid file type. Please upload PDF, DOC, or DOCX.");
			return;
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error("File too large. Maximum size is 5MB.");
			return;
		}

		setUploading(true);

		try {
			const formData = new FormData();
			formData.append("resume", file);

			const response = await fetch("/api/profile/resume", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Upload failed");
			}

			const data = await response.json();

			if (data.success) {
				if (data.extractedData) {
					toast.success("Resume uploaded and parsed! Profile auto-filled ✨");
				} else if (data.parsingError) {
					toast.warning("Resume uploaded but parsing failed. Please fill manually.");
				} else {
					toast.success("Resume uploaded successfully!");
				}

				onUploadSuccess?.({
					url: data.profile.resumeUrl,
					fileName: data.profile.resumeFileName,
					extractedData: data.extractedData,
					parsingError: data.parsingError
				});
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to upload resume"
			);
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete your resume?")) {
			return;
		}

		setDeleting(true);

		try {
			const response = await fetch("/api/profile/resume", {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete resume");
			}

			toast.success("Resume deleted successfully!");
			onUploadSuccess?.({ url: "", fileName: "" });
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Failed to delete resume");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="space-y-4">
			{currentFile ? (
				<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200">
								<svg
									className="h-5 w-5 text-zinc-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<div>
								<p className="text-sm font-medium text-zinc-900">
									{currentFileName || "resume.pdf"}
								</p>
								<p className="text-xs text-zinc-500">Current resume</p>
							</div>
						</div>
						<div className="flex gap-2">
							<a
								href={currentFile}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
							>
								View
							</a>
							<button
								type="button"
								onClick={handleDelete}
								disabled={deleting}
								className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
							>
								{deleting ? "Deleting..." : "Remove"}
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className="rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center">
					<svg
						className="mx-auto h-12 w-12 text-zinc-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					<p className="mt-2 text-sm text-zinc-600">
						No resume uploaded yet
					</p>
				</div>
			)}

			{/* Upload Button */}
			<div>
				<input
					type="file"
					id="resume-upload"
					accept=".pdf,.doc,.docx"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) {
							handleUpload(file);
						}
						// Reset input so same file can be selected again
						e.target.value = "";
					}}
					disabled={uploading}
					className="hidden"
				/>
				<label
					htmlFor="resume-upload"
					className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 ${
						uploading ? "opacity-50 cursor-not-allowed" : ""
					}`}
				>
					<svg
						className="h-4 w-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
						/>
					</svg>
					{uploading
						? "Parsing resume..."
						: currentFile
							? "Replace Resume"
							: "Upload Resume"}
				</label>
				<p className="mt-2 text-xs text-zinc-500">
					PDF, DOC, or DOCX (max 5MB)
				</p>
			</div>
		</div>
	);
}
