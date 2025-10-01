import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/utils/prisma";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Ensure user record exists and get admin status
	const userRecord = await prisma.user.upsert({
		where: { id: user.id },
		create: {
			id: user.id,
			email: user.email || "",
			fullName: user.user_metadata?.full_name || user.user_metadata?.name,
			source: user.user_metadata?.source,
		},
		update: {},
	});

	const isAdmin = userRecord.isAdmin || false;

	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			<Navbar />

			{/* Main Content */}
			<main className="max-w-6xl mx-auto px-6 py-12">
				<div className="mb-12">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-black mb-4">
						Dashboard
					</h1>
					<p className="text-lg md:text-xl text-gray-700">
						Welcome back,{" "}
						{user.user_metadata?.full_name || user.email?.split("@")[0]}!
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{/* Quick Actions */}
					<div className="bg-white/60 backdrop-blur-sm border border-black/10 rounded-lg p-6">
						<h2 className="text-2xl font-serif mb-4">Quick Actions</h2>
						<div className="space-y-3">
							<Link
								href="/jobs"
								className="block px-4 py-3 border border-black/20 rounded-lg hover:border-black/40 transition-colors"
							>
								Browse Job Board →
							</Link>
							<Link
								href="/post-job"
								className="block px-4 py-3 border border-black/20 rounded-lg hover:border-black/40 transition-colors"
							>
								Post a Job →
							</Link>
							<Link
								href="/my-jobs"
								className="block px-4 py-3 border border-black/20 rounded-lg hover:border-black/40 transition-colors"
							>
								My Job Submissions →
							</Link>
							{isAdmin && (
								<Link
									href="/admin"
									className="block px-4 py-3 bg-black text-[#F5F1E8] rounded-lg hover:bg-gray-800 transition-colors"
								>
									Admin Panel →
								</Link>
							)}
						</div>
					</div>

					{/* Profile Info */}
					<div className="bg-white/60 backdrop-blur-sm border border-black/10 rounded-lg p-6">
						<h2 className="text-2xl font-serif mb-4">Your Profile</h2>
						<div className="space-y-2 text-gray-700">
							<p>
								<span className="font-medium">Email:</span> {user.email}
							</p>
							{user.user_metadata?.full_name && (
								<p>
									<span className="font-medium">Name:</span>{" "}
									{user.user_metadata.full_name}
								</p>
							)}
							{user.user_metadata?.source && (
								<p>
									<span className="font-medium">Found us via:</span>{" "}
									{user.user_metadata.source}
								</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
