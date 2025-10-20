"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { toast } from "sonner";
import { Upload, File, Check, X, AlertCircle, Sparkles, Loader2 } from "lucide-react";

interface ExtractedData {
	headline?: string;
	location?: string;
	currentRole?: string;
	yearsOfExperience?: number;
	experienceSummary?: string;
	skills: string[];
	primarySkills: string[];
	degree?: string;
	school?: string;
	graduationYear?: number;
	desiredRoles: string[];
	linkedinUrl?: string;
	githubUrl?: string;
	portfolioUrl?: string;
	personalWebsite?: string;
}

interface ResumeUploaderProps {
	currentFile?: string | null;
	currentFileName?: string | null;
	onUploadSuccess?: (data: {
		url: string;
		fileName: string;
		extractedData?: ExtractedData;
		parsingError?: string | null;
	}) => void;
}

type ProcessingStage = "uploading" | "parsing" | "extracting" | "complete" | "idle";

export function ResumeUploader({
	currentFile,
	currentFileName,
	onUploadSuccess,
}: ResumeUploaderProps) {
	const [uploading, setUploading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [processingStage, setProcessingStage] = useState<ProcessingStage>("idle");
	const [progress, setProgress] = useState(0);
	const [showConfetti, setShowConfetti] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	const getStageMessage = (stage: ProcessingStage): string => {
		switch (stage) {
			case "uploading":
				return "Uploading your resume...";
			case "parsing":
				return "Reading your experience...";
			case "extracting":
				return "Finding your skills...";
			case "complete":
				return "Profile auto-filled!";
			default:
				return "";
		}
	};

	const handleUpload = useCallback(async (file: File) => {
		// Validate file type
		const validTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];

		if (!validTypes.includes(file.type)) {
			setValidationError("Invalid file type. Please upload PDF, DOC, or DOCX.");
			return;
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			setValidationError("File too large. Maximum size is 5MB.");
			return;
		}

		setValidationError(null);
		setUploading(true);
		setProcessingStage("uploading");
		setProgress(0);

		try {
			const formData = new FormData();
			formData.append("resume", file);

			// Simulate progress stages
			const progressInterval = setInterval(() => {
				setProgress((prev) => {
					if (prev < 30) return prev + 10;
					if (prev < 60) return prev + 5;
					if (prev < 90) return prev + 2;
					return prev;
				});
			}, 200);

			// Update stages based on progress
			setTimeout(() => setProcessingStage("parsing"), 800);
			setTimeout(() => setProcessingStage("extracting"), 1600);

			const response = await fetch("/api/profile/resume", {
				method: "POST",
				body: formData,
			});

			clearInterval(progressInterval);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Upload failed");
			}

			const data = await response.json();

			if (data.success) {
				setProgress(100);
				setProcessingStage("complete");

				// Show confetti for success
				setShowConfetti(true);
				setTimeout(() => setShowConfetti(false), 4000);

				if (data.extractedData) {
					toast.success("Resume uploaded and parsed! Profile auto-filled ✨", {
						duration: 5000,
					});
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

				// Reset after success
				setTimeout(() => {
					setProcessingStage("idle");
					setProgress(0);
				}, 2000);
			}
		} catch (error) {
			console.error("Upload error:", error);
			setValidationError(
				error instanceof Error ? error.message : "Failed to upload resume"
			);
			setProcessingStage("idle");
			setProgress(0);
		} finally {
			setUploading(false);
		}
	}, [onUploadSuccess]);

	const handleDelete = async () => {
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

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) {
			handleUpload(acceptedFiles[0]);
		}
	}, [handleUpload]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/pdf': ['.pdf'],
			'application/msword': ['.doc'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
		},
		maxFiles: 1,
		disabled: uploading,
	});

	return (
		<div className="space-y-4">
			{showConfetti && (
				<Confetti
					recycle={false}
					numberOfPieces={200}
					gravity={0.3}
				/>
			)}

			{currentFile && !uploading ? (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-sm"
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 shadow-md">
								<File className="h-6 w-6 text-white" />
							</div>
							<div>
								<p className="text-sm font-semibold text-zinc-900">
									{currentFileName || "resume.pdf"}
								</p>
								<p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
									<Check className="h-3 w-3 text-green-600" />
									Current resume
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<a
								href={currentFile}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
							>
								View
							</a>
							<button
								type="button"
								onClick={handleDelete}
								disabled={deleting}
								className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
							>
								{deleting ? "Deleting..." : "Remove"}
							</button>
						</div>
					</div>
				</motion.div>
			) : uploading ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="rounded-xl border border-zinc-200 bg-gradient-to-br from-violet-50 to-white p-8"
				>
					<div className="flex flex-col items-center justify-center space-y-6">
						{/* Progress Ring */}
						<div className="relative">
							<svg className="h-24 w-24 -rotate-90 transform">
								<circle
									cx="48"
									cy="48"
									r="40"
									stroke="currentColor"
									strokeWidth="6"
									fill="none"
									className="text-zinc-200"
								/>
								<motion.circle
									cx="48"
									cy="48"
									r="40"
									stroke="currentColor"
									strokeWidth="6"
									fill="none"
									strokeLinecap="round"
									className="text-violet-600"
									initial={{ strokeDasharray: "0 251.2" }}
									animate={{ strokeDasharray: `${(progress / 100) * 251.2} 251.2` }}
									transition={{ duration: 0.5 }}
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center">
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
								>
									<Loader2 className="h-8 w-8 text-violet-600" />
								</motion.div>
							</div>
						</div>

						{/* Status Text */}
						<div className="text-center space-y-2">
							<motion.p
								key={processingStage}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-sm font-semibold text-zinc-900"
							>
								{getStageMessage(processingStage)}
							</motion.p>
							<p className="text-xs text-zinc-500">{progress}%</p>
						</div>

						{/* Processing Stage Indicator */}
						<div className="flex items-center gap-2">
							{["uploading", "parsing", "extracting"].map((stage, idx) => (
								<motion.div
									key={stage}
									className={`h-1.5 w-16 rounded-full ${
										processingStage === stage
											? "bg-violet-600"
											: idx < ["uploading", "parsing", "extracting"].indexOf(processingStage)
											? "bg-violet-400"
											: "bg-zinc-200"
									}`}
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ delay: idx * 0.2 }}
								/>
							))}
						</div>
					</div>
				</motion.div>
			) : (
				<div {...getRootProps()}>
					<motion.div
						className={`group relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer ${
							isDragActive
								? "border-violet-500 bg-violet-50 scale-[1.02]"
								: validationError
								? "border-red-300 bg-red-50"
								: "border-zinc-300 bg-gradient-to-br from-zinc-50 to-white hover:border-zinc-400 hover:shadow-md"
						}`}
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.99 }}
					>
						<input {...getInputProps()} />

					{/* Animated Background Gradient */}
					<div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

					<div className="relative p-10 text-center">
						<AnimatePresence mode="wait">
							{validationError ? (
								<motion.div
									key="error"
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									className="space-y-3"
								>
									<motion.div
										animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
										transition={{ duration: 0.5 }}
									>
										<AlertCircle className="mx-auto h-12 w-12 text-red-500" />
									</motion.div>
									<p className="text-sm font-medium text-red-700">{validationError}</p>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setValidationError(null);
										}}
										className="text-xs text-red-600 hover:text-red-800 underline"
									>
										Try again
									</button>
								</motion.div>
							) : isDragActive ? (
								<motion.div
									key="dragging"
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									className="space-y-3"
								>
									<motion.div
										animate={{ y: [0, -10, 0] }}
										transition={{ duration: 0.8, repeat: Infinity }}
									>
										<Upload className="mx-auto h-12 w-12 text-violet-600" />
									</motion.div>
									<p className="text-base font-semibold text-violet-700">Drop your resume here</p>
								</motion.div>
							) : (
								<motion.div
									key="empty"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="space-y-4"
								>
									<motion.div
										animate={{ y: [0, -5, 0] }}
										transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
									>
										<div className="relative mx-auto w-fit">
											<Upload className="h-12 w-12 text-zinc-400 group-hover:text-violet-600 transition-colors" />
											<motion.div
												className="absolute -top-1 -right-1"
												animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
												transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
											>
												<Sparkles className="h-4 w-4 text-violet-500" />
											</motion.div>
										</div>
									</motion.div>

									<div className="space-y-2">
										<p className="text-base font-semibold text-zinc-900">
											Drag & drop your resume
										</p>
										<p className="text-sm text-zinc-600">
											or <span className="font-medium text-violet-600">browse</span> to upload
										</p>
									</div>

									<div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
										<span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium">PDF</span>
										<span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium">DOC</span>
										<span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium">DOCX</span>
										<span className="text-zinc-400">•</span>
										<span>Max 5MB</span>
									</div>

									<div className="pt-2">
										<p className="text-xs text-zinc-500 flex items-center justify-center gap-1">
											<Sparkles className="h-3 w-3 text-violet-500" />
											We&apos;ll extract your info automatically
										</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
					</motion.div>
				</div>
			)}
		</div>
	);
}
