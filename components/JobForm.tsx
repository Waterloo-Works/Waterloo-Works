"use client";

import { useState } from "react";
import { postJob, updateJob } from "@/app/actions/jobs";
import { useRouter } from "next/navigation";

interface JobFormProps {
	mode: "create" | "edit";
	jobId?: string;
	initialData?: {
		company: string;
		companyUrl?: string;
		position: string;
		contact: string;
		contactUrl?: string;
		location: string;
		employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "OTHER";
		salaryMin?: string;
		salaryMax?: string;
		notes?: string;
	};
}

export default function JobForm({ mode, jobId, initialData }: JobFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState({
		company: initialData?.company || "",
		companyUrl: initialData?.companyUrl || "",
		position: initialData?.position || "",
		contact: initialData?.contact || "",
		contactUrl: initialData?.contactUrl || "",
		location: initialData?.location || "",
		employmentType:
			(initialData?.employmentType as
				| "FULL_TIME"
				| "PART_TIME"
				| "CONTRACT"
				| "OTHER") || "FULL_TIME",
		salaryMin: initialData?.salaryMin || "",
		salaryMax: initialData?.salaryMax || "",
		notes: initialData?.notes || "",
	});
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		const jobData = {
			company: formData.company,
			companyUrl: formData.companyUrl || undefined,
			position: formData.position,
			contact: formData.contact,
			contactUrl: formData.contactUrl || undefined,
			location: formData.location,
			employmentType: formData.employmentType,
			salaryMin: formData.salaryMin || undefined,
			salaryMax: formData.salaryMax || undefined,
			notes: formData.notes || undefined,
		};

		const result =
			mode === "edit" && jobId
				? await updateJob(jobId, jobData)
				: await postJob(jobData);

		if (result.success) {
			setSuccess(true);
			setTimeout(() => router.push("/my-jobs"), 2000);
		} else {
			setError(result.error || `Failed to ${mode} job`);
		}

		setSubmitting(false);
	};

	if (success) {
		return (
			<div className="flex items-center justify-center px-6 py-20">
				<div className="max-w-md w-full text-center">
					<div className="mb-6">
						<div className="inline-block w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<svg
								className="w-8 h-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>
					<h1 className="text-3xl font-serif italic mb-4 text-black">
						{mode === "edit" ? "Job updated!" : "Job submitted!"}
					</h1>
					<p className="text-gray-700 mb-6">
						{mode === "edit"
							? "Your job posting has been updated successfully."
							: "Your job posting has been submitted for review. We'll notify you once it's approved."}
					</p>
					<p className="text-sm text-gray-500">Redirecting to my jobs...</p>
				</div>
			</div>
		);
	}

	return (
		<main className="max-w-3xl mx-auto px-6 py-12">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-serif italic text-black mb-4">
					{mode === "edit" ? "Edit Job" : "Post a Job"}
				</h1>
				<p className="text-lg text-gray-700">
					{mode === "edit"
						? "Update your job posting details below."
						: "Submit a job opportunity to share with the Waterloo.works community. Your posting will be reviewed before going live."}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Company */}
				<div>
					<label
						htmlFor="company"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Company *
					</label>
					<input
						type="text"
						id="company"
						value={formData.company}
						onChange={e =>
							setFormData({ ...formData, company: e.target.value })
						}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						required
					/>
				</div>

				{/* Company URL */}
				<div>
					<label
						htmlFor="companyUrl"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Company Website (Optional)
					</label>
					<input
						type="url"
						id="companyUrl"
						value={formData.companyUrl}
						onChange={e =>
							setFormData({ ...formData, companyUrl: e.target.value })
						}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						placeholder="https://example.com"
					/>
				</div>

				{/* Position */}
				<div>
					<label
						htmlFor="position"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Position *
					</label>
					<input
						type="text"
						id="position"
						value={formData.position}
						onChange={e =>
							setFormData({ ...formData, position: e.target.value })
						}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						required
					/>
				</div>

				{/* Contact Name */}
				<div>
					<label
						htmlFor="contact"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Contact Name *
					</label>
					<input
						type="text"
						id="contact"
						value={formData.contact}
						onChange={e =>
							setFormData({ ...formData, contact: e.target.value })
						}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						required
					/>
				</div>

				{/* Contact URL */}
				<div>
					<label
						htmlFor="contactUrl"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Contact URL (e.g., LinkedIn, Email) (Optional)
					</label>
					<input
						type="url"
						id="contactUrl"
						value={formData.contactUrl}
						onChange={e =>
							setFormData({ ...formData, contactUrl: e.target.value })
						}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						placeholder="https://linkedin.com/in/..."
					/>
				</div>

				{/* Location */}
				<div>
					<label
						htmlFor="location"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Location *
					</label>
					<input
						type="text"
						id="location"
						value={formData.location}
						onChange={e =>
							setFormData({ ...formData, location: e.target.value })
						}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						required
					/>
				</div>

				{/* Employment Type */}
				<div>
					<label
						htmlFor="employmentType"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Employment Type *
					</label>
					<select
						id="employmentType"
						value={formData.employmentType}
						onChange={e =>
							setFormData({
								...formData,
								employmentType: e.target.value as
									| "FULL_TIME"
									| "PART_TIME"
									| "CONTRACT"
									| "OTHER",
							})
						}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						required
					>
						<option value="FULL_TIME">Full-Time</option>
						<option value="PART_TIME">Part-Time</option>
						<option value="CONTRACT">Contract</option>
						<option value="OTHER">Other</option>
					</select>
				</div>

				{/* Salary Range */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="salaryMin"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Minimum Salary (Optional)
						</label>
						<input
							type="text"
							id="salaryMin"
							value={formData.salaryMin}
							onChange={e =>
								setFormData({ ...formData, salaryMin: e.target.value })
							}
							placeholder="$80k"
							className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						/>
					</div>
					<div>
						<label
							htmlFor="salaryMax"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Maximum Salary (Optional)
						</label>
						<input
							type="text"
							id="salaryMax"
							value={formData.salaryMax}
							onChange={e =>
								setFormData({ ...formData, salaryMax: e.target.value })
							}
							placeholder="$120k"
							className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						/>
					</div>
				</div>

				{/* Notes */}
				<div>
					<label
						htmlFor="notes"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Notes (Optional)
					</label>
					<textarea
						id="notes"
						value={formData.notes}
						onChange={e =>
							setFormData({ ...formData, notes: e.target.value })
						}
						rows={5}
						className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
						placeholder="Any additional information about the job or application process."
					></textarea>
				</div>

				{/* Error Message */}
				{error && (
					<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				{/* Submit Button */}
				<button
					type="submit"
					disabled={submitting}
					className="w-full px-6 py-3 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
				>
					{submitting
						? mode === "edit"
							? "Updating..."
							: "Submitting..."
						: mode === "edit"
						? "Update Job"
						: "Submit Job for Review"}
				</button>
			</form>
		</main>
	);
}
