import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/utils/prisma";
import { redirect } from "next/navigation";

export default async function Navbar() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	let isAdmin = false;
	if (user) {
		const userRecord = await prisma.user.findUnique({
			where: { id: user.id },
		});
		isAdmin = userRecord?.isAdmin || false;
	}

	const handleSignOut = async () => {
		"use server";
		const supabase = await createClient();
		await supabase.auth.signOut();
		redirect("/");
	};

	// Get user initials for avatar
	const getInitials = () => {
		if (user?.user_metadata?.full_name) {
			const names = user.user_metadata.full_name.split(" ");
			return names.length > 1
				? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
				: names[0][0].toUpperCase();
		}
		return user?.email?.[0].toUpperCase() || "U";
	};

	return (
		<nav className="px-6 py-6 border-b border-black/10">
			<div className="max-w-6xl mx-auto flex justify-between items-center">
				<Link href="/explore" className="flex items-center gap-3">
					<Image
						src="/favicon.ico"
						alt="App logo"
						width={28}
						height={28}
						className="rounded-md shadow-sm"
						priority
					/>
					<span className="text-xl font-serif italic text-black">Waterloo.works</span>
				</Link>
				<div className="flex items-center gap-4">
					<Link
						href="/jobs"
						className="text-black hover:opacity-70 transition-opacity"
					>
						Browse Jobs
					</Link>
					{user && (
						<>
							<Link
								href="/explore"
								className="text-black hover:opacity-70 transition-opacity"
							>
								Explore
							</Link>
							{isAdmin && (
								<Link
									href="/admin"
									className="px-3 py-1 bg-black text-[#F5F1E8] rounded-full text-sm hover:bg-gray-800 transition-colors"
								>
									Admin
								</Link>
							)}
							<div className="relative group">
								{/* Avatar */}
								<button className="w-10 h-10 bg-black text-[#F5F1E8] rounded-full flex items-center justify-center font-medium hover:bg-gray-800 transition-colors">
									{getInitials()}
								</button>
								{/* Dropdown Menu */}
								<div className="absolute right-0 mt-3 w-56 bg-[#F5F1E8] border border-black/20 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="py-3">
										<div className="px-5 py-3 border-b border-black/10">
											<p className="text-sm font-medium text-black truncate">
												{user.user_metadata?.full_name ||
													user.email}
											</p>
											<p className="text-xs text-gray-600 truncate mt-0.5">
												{user.email}
											</p>
										</div>
										<div className="py-2">
											<Link
												href="/my-jobs"
												className="flex items-center gap-2 px-5 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
											>
												<span className="text-base">📋</span>
												<span>My Job Submissions</span>
											</Link>
											<Link
												href="/post-job"
												className="flex items-center gap-2 px-5 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
											>
												<span className="text-base">✏️</span>
												<span>Post a Job</span>
											</Link>
										</div>
										<form
											action={handleSignOut}
											className="pt-2 border-t border-black/10"
										>
											<button
												type="submit"
												className="w-full flex items-center gap-2 text-left px-5 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
											>
												<span className="text-base">👋</span>
												<span>Sign out</span>
											</button>
										</form>
									</div>
								</div>
							</div>
						</>
					)}
					{!user && (
						<Link
							href="/login"
							className="px-5 py-2.5 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors"
						>
							Sign in
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
}
