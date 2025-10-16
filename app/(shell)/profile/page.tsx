import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Fetch or create user profile
	let profile = await prisma.userProfile.findUnique({
		where: { userId: user.id },
	});

	// If no profile exists, create one and redirect to edit
	if (!profile) {
		profile = await prisma.userProfile.create({
			data: { userId: user.id },
		});
		redirect("/profile/edit");
	}

	return (
		<div className="mx-auto max-w-4xl px-6 py-8">
			{/* Header */}
			<div className="mb-8 flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold text-zinc-900">Profile</h1>
					<p className="mt-1 text-sm text-zinc-500">
						Your professional profile and job preferences
					</p>
				</div>
				<Link
					href="/profile/edit"
					className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
				>
					Edit Profile
				</Link>
			</div>

			{/* Profile Completeness */}
			<div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
				<div className="mb-2 flex items-center justify-between">
					<span className="text-sm font-medium text-zinc-700">
						Profile Completeness
					</span>
					<span className="text-sm font-semibold text-zinc-900">
						{profile.completionScore}%
					</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-zinc-100">
					<div
						className="h-full bg-zinc-900 transition-all"
						style={{ width: `${profile.completionScore}%` }}
					/>
				</div>
				{!profile.isComplete && (
					<p className="mt-2 text-xs text-zinc-500">
						Complete your profile to increase visibility to employers
					</p>
				)}
			</div>

			{/* Resume */}
			{profile.resumeUrl && (
				<section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Resume</h2>
					<div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
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
									{profile.resumeFileName}
								</p>
								<p className="text-xs text-zinc-500">
									Uploaded {new Date(profile.resumeUploadedAt!).toLocaleDateString()}
								</p>
							</div>
						</div>
						<a
							href={profile.resumeUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
						>
							Download
						</a>
					</div>
				</section>
			)}

			{/* Basic Info */}
			<section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
				<h2 className="mb-4 text-lg font-semibold text-zinc-900">Basic Info</h2>
				<dl className="space-y-3">
					{profile.headline && (
						<div>
							<dt className="text-sm font-medium text-zinc-500">Headline</dt>
							<dd className="mt-1 text-sm text-zinc-900">{profile.headline}</dd>
						</div>
					)}
					{profile.location && (
						<div>
							<dt className="text-sm font-medium text-zinc-500">Location</dt>
							<dd className="mt-1 text-sm text-zinc-900">{profile.location}</dd>
						</div>
					)}
					<div>
						<dt className="text-sm font-medium text-zinc-500">Work Preferences</dt>
						<dd className="mt-1 flex gap-2">
							{profile.openToRemote && (
								<span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
									Open to Remote
								</span>
							)}
							{profile.openToRelocation && (
								<span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
									Open to Relocation
								</span>
							)}
						</dd>
					</div>
				</dl>
			</section>

			{/* Experience */}
			{(profile.currentRole || profile.experienceSummary) && (
				<section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Experience</h2>
					<dl className="space-y-3">
						{profile.currentRole && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">Current Role</dt>
								<dd className="mt-1 text-sm text-zinc-900">{profile.currentRole}</dd>
							</div>
						)}
						{profile.yearsOfExperience && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">
									Years of Experience
								</dt>
								<dd className="mt-1 text-sm text-zinc-900">
									{profile.yearsOfExperience} years
								</dd>
							</div>
						)}
						{profile.experienceSummary && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">Summary</dt>
								<dd className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap">
									{profile.experienceSummary}
								</dd>
							</div>
						)}
					</dl>
				</section>
			)}

			{/* Skills */}
			{profile.skills.length > 0 && (
				<section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Skills</h2>
					<div className="flex flex-wrap gap-2">
						{profile.skills.map((skill) => (
							<span
								key={skill}
								className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white"
							>
								{skill}
							</span>
						))}
					</div>
				</section>
			)}

			{/* Education */}
			{(profile.degree || profile.school) && (
				<section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Education</h2>
					<dl className="space-y-3">
						{profile.degree && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">Degree</dt>
								<dd className="mt-1 text-sm text-zinc-900">{profile.degree}</dd>
							</div>
						)}
						{profile.school && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">School</dt>
								<dd className="mt-1 text-sm text-zinc-900">{profile.school}</dd>
							</div>
						)}
						{profile.graduationYear && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">
									Graduation Year
								</dt>
								<dd className="mt-1 text-sm text-zinc-900">
									{profile.graduationYear}
								</dd>
							</div>
						)}
					</dl>
				</section>
			)}

			{/* Job Preferences */}
			{(profile.desiredRoles.length > 0 ||
				profile.desiredLocations.length > 0 ||
				profile.employmentTypes.length > 0) && (
				<section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">
						Job Preferences
					</h2>
					<dl className="space-y-4">
						{profile.desiredRoles.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">
									Desired Roles
								</dt>
								<dd className="mt-1 flex flex-wrap gap-2">
									{profile.desiredRoles.map((role) => (
										<span
											key={role}
											className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
										>
											{role}
										</span>
									))}
								</dd>
							</div>
						)}
						{profile.desiredLocations.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">
									Preferred Locations
								</dt>
								<dd className="mt-1 flex flex-wrap gap-2">
									{profile.desiredLocations.map((location) => (
										<span
											key={location}
											className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
										>
											{location}
										</span>
									))}
								</dd>
							</div>
						)}
						{profile.employmentTypes.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">
									Employment Types
								</dt>
								<dd className="mt-1 flex flex-wrap gap-2">
									{profile.employmentTypes.map((type) => (
										<span
											key={type}
											className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
										>
											{type.replace("_", " ")}
										</span>
									))}
								</dd>
							</div>
						)}
						{(profile.minSalary || profile.maxSalary) && (
							<div>
								<dt className="text-sm font-medium text-zinc-500">Salary Range</dt>
								<dd className="mt-1 text-sm text-zinc-900">
									{profile.minSalary
										? `$${profile.minSalary.toLocaleString()}`
										: "No min"}{" "}
									-{" "}
									{profile.maxSalary
										? `$${profile.maxSalary.toLocaleString()}`
										: "No max"}
								</dd>
							</div>
						)}
					</dl>
				</section>
			)}

			{/* Links */}
			{(profile.linkedinUrl ||
				profile.githubUrl ||
				profile.portfolioUrl ||
				profile.personalWebsite) && (
				<section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-zinc-900">Links</h2>
					<div className="space-y-2">
						{profile.linkedinUrl && (
							<a
								href={profile.linkedinUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
							>
								<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
								</svg>
								LinkedIn
							</a>
						)}
						{profile.githubUrl && (
							<a
								href={profile.githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
							>
								<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
								GitHub
							</a>
						)}
						{profile.portfolioUrl && (
							<a
								href={profile.portfolioUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
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
										d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								Portfolio
							</a>
						)}
						{profile.personalWebsite && (
							<a
								href={profile.personalWebsite}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
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
										d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
									/>
								</svg>
								Website
							</a>
						)}
					</div>
				</section>
			)}
		</div>
	);
}
