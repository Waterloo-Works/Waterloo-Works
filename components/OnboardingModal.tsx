"use client";

import { useState, useEffect } from "react";
import { updateUserSource } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import posthog from 'posthog-js';

interface OnboardingModalProps {
	hasSource: boolean;
	onCompleted?: () => void;
}

export function OnboardingModal({ hasSource, onCompleted }: OnboardingModalProps) {
	const [isOpen, setIsOpen] = useState(!hasSource);
	const [source, setSource] = useState<string>("");
	const [customSource, setCustomSource] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setIsOpen(!hasSource);
	}, [hasSource]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		const finalSource = source === "other" ? customSource : source;

		if (!finalSource) {
			setIsSubmitting(false);
			return;
		}

		posthog.capture('source_submitted', { source: finalSource });
		const result = await updateUserSource(finalSource);

		if (result.success) {
			setIsOpen(false);
			if (onCompleted) {
				onCompleted();
			} else {
				router.refresh();
			}
		} else {
			alert("Failed to save. Please try again.");
		}

		setIsSubmitting(false);
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-6">
			{/* Blurred backdrop */}
			<div className="absolute inset-0 bg-[#F5F1E8]/95 backdrop-blur-md" />

			{/* Modal content */}
			<div className="relative z-10 w-full max-w-md bg-white border border-black/20 rounded-lg p-8 shadow-xl">
				<h2 className="text-3xl md:text-4xl font-serif italic mb-4 text-black">
					Welcome!
				</h2>
				<p className="text-lg text-gray-700 mb-6">
					Before you continue, we&apos;d love to know how you found out about
					us.
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label
							htmlFor="source"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							How did you hear about us?
						</label>
						<select
							id="source"
							value={source}
							onChange={e => setSource(e.target.value)}
							className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
							required
						>
							<option value="">Select an option</option>
							<option value="friend">Friend or colleague</option>
							<option value="reddit">Reddit</option>
							<option value="twitter">Twitter/X</option>
							<option value="linkedin">LinkedIn</option>
							<option value="facebook">Facebook</option>
							<option value="search">Search engine</option>
							<option value="university">University/School</option>
							<option value="other">Other</option>
						</select>
					</div>

					{source === "other" && (
						<div>
							<label
								htmlFor="customSource"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Please specify
							</label>
							<textarea
								id="customSource"
								value={customSource}
								onChange={e => setCustomSource(e.target.value)}
								placeholder="Tell us how you found us..."
								className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20 min-h-[80px] resize-none"
								required
							/>
						</div>
					)}

					<button
						type="submit"
						disabled={
							isSubmitting ||
							!source ||
							(source === "other" && !customSource)
						}
						className="w-full px-6 py-3 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
					>
						{isSubmitting ? "Saving..." : "Continue"}
					</button>
				</form>
			</div>
		</div>
	);
}
