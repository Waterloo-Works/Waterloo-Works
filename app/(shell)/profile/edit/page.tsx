"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ResumeUploader } from "@/components/profile/ResumeUploader";
import { SkillsInput } from "@/components/profile/SkillsInput";
import { EmploymentType } from "@prisma/client";

interface ProfileFormData {
	headline: string;
	location: string;
	openToRemote: boolean;
	openToRelocation: boolean;
	resumeUrl: string;
	resumeFileName: string;
	currentRole: string;
	yearsOfExperience: number | null;
	experienceSummary: string;
	skills: string[];
	primarySkills: string[];
	degree: string;
	school: string;
	graduationYear: number | null;
	desiredRoles: string[];
	desiredLocations: string[];
	employmentTypes: EmploymentType[];
	minSalary: number | null;
	maxSalary: number | null;
	linkedinUrl: string;
	githubUrl: string;
	portfolioUrl: string;
	personalWebsite: string;
}

const INITIAL_FORM_DATA: ProfileFormData = {
	headline: "",
	location: "",
	openToRemote: true,
	openToRelocation: false,
	resumeUrl: "",
	resumeFileName: "",
	currentRole: "",
	yearsOfExperience: null,
	experienceSummary: "",
	skills: [],
	primarySkills: [],
	degree: "",
	school: "",
	graduationYear: null,
	desiredRoles: [],
	desiredLocations: [],
	employmentTypes: [],
	minSalary: null,
	maxSalary: null,
	linkedinUrl: "",
	githubUrl: "",
	portfolioUrl: "",
	personalWebsite: "",
};

export default function EditProfilePage() {
	const router = useRouter();
	const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Fetch existing profile
	useEffect(() => {
		async function fetchProfile() {
			try {
				const response = await fetch("/api/profile");

				if (response.status === 404) {
					// No profile exists yet
					setLoading(false);
					return;
				}

				if (!response.ok) {
					throw new Error("Failed to fetch profile");
				}

				const profile = await response.json();

				setFormData({
					headline: profile.headline || "",
					location: profile.location || "",
					openToRemote: profile.openToRemote ?? true,
					openToRelocation: profile.openToRelocation ?? false,
					resumeUrl: profile.resumeUrl || "",
					resumeFileName: profile.resumeFileName || "",
					currentRole: profile.currentRole || "",
					yearsOfExperience: profile.yearsOfExperience,
					experienceSummary: profile.experienceSummary || "",
					skills: profile.skills || [],
					primarySkills: profile.primarySkills || [],
					degree: profile.degree || "",
					school: profile.school || "",
					graduationYear: profile.graduationYear,
					desiredRoles: profile.desiredRoles || [],
					desiredLocations: profile.desiredLocations || [],
					employmentTypes: profile.employmentTypes || [],
					minSalary: profile.minSalary,
					maxSalary: profile.maxSalary,
					linkedinUrl: profile.linkedinUrl || "",
					githubUrl: profile.githubUrl || "",
					portfolioUrl: profile.portfolioUrl || "",
					personalWebsite: profile.personalWebsite || "",
				});
			} catch (error) {
				console.error("Error fetching profile:", error);
				toast.error("Failed to load profile");
			} finally {
				setLoading(false);
			}
		}

		fetchProfile();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);

		try {
			const response = await fetch("/api/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error("Failed to save profile");
			}

			toast.success("Profile saved successfully!");
			router.push("/profile");
		} catch (error) {
			console.error("Error saving profile:", error);
			toast.error("Failed to save profile");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="mx-auto max-w-4xl px-6 py-8">
				<div className="text-center">
					<p className="text-zinc-600">Loading profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-6 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900">Edit Profile</h1>
				<p className="mt-1 text-sm text-zinc-500">
					Update your professional profile and job preferences
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Resume Upload */}
				<section className="rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">
						Resume (Optional)
					</h2>
					<ResumeUploader
						currentFile={formData.resumeUrl}
						currentFileName={formData.resumeFileName}
						onUploadSuccess={(data) => {
							// Auto-fill form with extracted data if available
							if (data.extractedData) {
								setFormData({
									...formData,
									resumeUrl: data.url,
									resumeFileName: data.fileName,
									// Merge extracted data, keeping existing values if user already filled them
									headline: data.extractedData.headline || formData.headline,
									location: data.extractedData.location || formData.location,
									currentRole: data.extractedData.currentRole || formData.currentRole,
									yearsOfExperience: data.extractedData.yearsOfExperience ?? formData.yearsOfExperience,
									experienceSummary: data.extractedData.experienceSummary || formData.experienceSummary,
									skills: data.extractedData.skills?.length > 0 ? data.extractedData.skills : formData.skills,
									primarySkills: data.extractedData.primarySkills?.length > 0 ? data.extractedData.primarySkills : formData.primarySkills,
									degree: data.extractedData.degree || formData.degree,
									school: data.extractedData.school || formData.school,
									graduationYear: data.extractedData.graduationYear || formData.graduationYear,
									desiredRoles: data.extractedData.desiredRoles?.length > 0 ? data.extractedData.desiredRoles : formData.desiredRoles,
									linkedinUrl: data.extractedData.linkedinUrl || formData.linkedinUrl,
									githubUrl: data.extractedData.githubUrl || formData.githubUrl,
									portfolioUrl: data.extractedData.portfolioUrl || formData.portfolioUrl,
									personalWebsite: data.extractedData.personalWebsite || formData.personalWebsite,
								});

								// Scroll to top so user sees the auto-filled data
								window.scrollTo({ top: 0, behavior: 'smooth' });
							} else {
								// Just update resume URL if no parsing happened
								setFormData({
									...formData,
									resumeUrl: data.url,
									resumeFileName: data.fileName,
								});
							}
						}}
					/>
				</section>

				{/* Basic Info */}
				<section className="rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Basic Info</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Headline
							</label>
							<input
								type="text"
								value={formData.headline}
								onChange={(e) =>
									setFormData({ ...formData, headline: e.target.value })
								}
								placeholder="e.g., Software Engineer | React & Node.js"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Location
							</label>
							<input
								type="text"
								value={formData.location}
								onChange={(e) =>
									setFormData({ ...formData, location: e.target.value })
								}
								placeholder="e.g., Waterloo, ON"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.openToRemote}
									onChange={(e) =>
										setFormData({ ...formData, openToRemote: e.target.checked })
									}
									className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
								/>
								<span className="text-sm text-zinc-700">Open to remote work</span>
							</label>

							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.openToRelocation}
									onChange={(e) =>
										setFormData({
											...formData,
											openToRelocation: e.target.checked,
										})
									}
									className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
								/>
								<span className="text-sm text-zinc-700">Open to relocation</span>
							</label>
						</div>
					</div>
				</section>

				{/* Experience */}
				<section className="rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Experience</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Current Role
							</label>
							<input
								type="text"
								value={formData.currentRole}
								onChange={(e) =>
									setFormData({ ...formData, currentRole: e.target.value })
								}
								placeholder="e.g., Senior Software Engineer"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Years of Experience
							</label>
							<input
								type="number"
								value={formData.yearsOfExperience || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										yearsOfExperience: e.target.value
											? parseInt(e.target.value)
											: null,
									})
								}
								placeholder="e.g., 5"
								min="0"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Experience Summary
							</label>
							<textarea
								value={formData.experienceSummary}
								onChange={(e) =>
									setFormData({ ...formData, experienceSummary: e.target.value })
								}
								placeholder="Describe your work experience, key achievements, and responsibilities..."
								rows={4}
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>
					</div>
				</section>

				{/* Skills */}
				<section className="rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Skills</h2>
					<div className="space-y-4">
						<SkillsInput
							skills={formData.skills}
							onChange={(skills) => setFormData({ ...formData, skills })}
							label="All Skills"
							placeholder="e.g., React, Node.js, Python"
						/>

						<SkillsInput
							skills={formData.primarySkills}
							onChange={(skills) =>
								setFormData({ ...formData, primarySkills: skills })
							}
							label="Primary Skills (Top 3-5)"
							placeholder="Your core competencies"
							maxSkills={5}
						/>
					</div>
				</section>

				{/* Education */}
				<section className="rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Education</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Degree
							</label>
							<input
								type="text"
								value={formData.degree}
								onChange={(e) =>
									setFormData({ ...formData, degree: e.target.value })
								}
								placeholder="e.g., Bachelor of Computer Science"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								School
							</label>
							<input
								type="text"
								value={formData.school}
								onChange={(e) =>
									setFormData({ ...formData, school: e.target.value })
								}
								placeholder="e.g., University of Waterloo"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Graduation Year
							</label>
							<input
								type="number"
								value={formData.graduationYear || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										graduationYear: e.target.value
											? parseInt(e.target.value)
											: null,
									})
								}
								placeholder="e.g., 2020"
								min="1950"
								max={new Date().getFullYear() + 10}
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>
					</div>
				</section>

				{/* Job Preferences */}
				<section className="rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">
						Job Preferences
					</h2>
					<div className="space-y-4">
						<SkillsInput
							skills={formData.desiredRoles}
							onChange={(roles) => setFormData({ ...formData, desiredRoles: roles })}
							label="Desired Roles"
							placeholder="e.g., Software Engineer, Full Stack Developer"
						/>

						<SkillsInput
							skills={formData.desiredLocations}
							onChange={(locations) =>
								setFormData({ ...formData, desiredLocations: locations })
							}
							label="Preferred Locations"
							placeholder="e.g., Waterloo, Toronto, Remote"
						/>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Employment Types
							</label>
							<div className="mt-2 space-y-2">
								{(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as EmploymentType[]).map(
									(type) => (
										<label key={type} className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={formData.employmentTypes.includes(type)}
												onChange={(e) => {
													if (e.target.checked) {
														setFormData({
															...formData,
															employmentTypes: [...formData.employmentTypes, type],
														});
													} else {
														setFormData({
															...formData,
															employmentTypes: formData.employmentTypes.filter(
																(t) => t !== type
															),
														});
													}
												}}
												className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
											/>
											<span className="text-sm text-zinc-700">
												{type.replace("_", " ")}
											</span>
										</label>
									)
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-700">
									Min Salary ($)
								</label>
								<input
									type="number"
									value={formData.minSalary || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											minSalary: e.target.value ? parseInt(e.target.value) : null,
										})
									}
									placeholder="e.g., 100000"
									min="0"
									step="1000"
									className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700">
									Max Salary ($)
								</label>
								<input
									type="number"
									value={formData.maxSalary || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											maxSalary: e.target.value ? parseInt(e.target.value) : null,
										})
									}
									placeholder="e.g., 150000"
									min="0"
									step="1000"
									className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Links */}
				<section className="rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Links</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-zinc-700">
								LinkedIn
							</label>
							<input
								type="url"
								value={formData.linkedinUrl}
								onChange={(e) =>
									setFormData({ ...formData, linkedinUrl: e.target.value })
								}
								placeholder="https://linkedin.com/in/yourprofile"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								GitHub
							</label>
							<input
								type="url"
								value={formData.githubUrl}
								onChange={(e) =>
									setFormData({ ...formData, githubUrl: e.target.value })
								}
								placeholder="https://github.com/yourusername"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Portfolio
							</label>
							<input
								type="url"
								value={formData.portfolioUrl}
								onChange={(e) =>
									setFormData({ ...formData, portfolioUrl: e.target.value })
								}
								placeholder="https://yourportfolio.com"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-700">
								Personal Website
							</label>
							<input
								type="url"
								value={formData.personalWebsite}
								onChange={(e) =>
									setFormData({ ...formData, personalWebsite: e.target.value })
								}
								placeholder="https://yourwebsite.com"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
							/>
						</div>
					</div>
				</section>

				{/* Actions */}
				<div className="flex gap-4">
					<Link
						href="/profile"
						className="rounded-lg border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
					>
						Cancel
					</Link>
					<button
						type="submit"
						disabled={saving}
						className="flex-1 rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
					>
						{saving ? "Saving..." : "Save Profile"}
					</button>
				</div>
			</form>
		</div>
	);
}
