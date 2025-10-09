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
		<nav className="sticky top-0 z-50 px-6 py-6 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
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
					<span className="text-xl font-serif italic text-zinc-900">waterloo[dot]works</span>
				</Link>
				<div className="flex items-center gap-4">
					<Link
						href="/jobs"
						className="text-zinc-900 hover:text-zinc-700 transition-colors"
					>
						Browse Jobs
					</Link>
					{user && (
						<>
							<Link
								href="/explore"
								className="text-zinc-900 hover:text-zinc-700 transition-colors"
							>
								Explore
							</Link>
							{isAdmin && (
								<Link
									href="/admin"
									className="px-3 py-1 bg-black text-[#F5F1E8] rounded-full text-sm hover:bg-zinc-800 transition-colors"
								>
									Admin
								</Link>
							)}
							<div className="relative group">
								{/* Avatar */}
								<button className="w-10 h-10 bg-black text-[#F5F1E8] rounded-full flex items-center justify-center font-medium hover:bg-zinc-800 transition-colors">
									{getInitials()}
								</button>
								{/* Dropdown Menu */}
								<div className="absolute right-0 mt-3 w-56 rounded-2xl border border-zinc-200 bg-white shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="py-3">
										<div className="px-5 py-3 border-b border-zinc-200">
											<p className="text-sm font-medium text-zinc-900 truncate">
												{user.user_metadata?.full_name ||
													user.email}
											</p>
											<p className="text-xs text-zinc-600 truncate mt-0.5">
												{user.email}
											</p>
										</div>
										<div className="py-2">
											<Link
												href="/my-jobs"
												className="flex items-center gap-3 px-5 py-2.5 text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
											>
												<span>My Job Submissions</span>
											</Link>
											<Link
												href="/post-job"
												className="flex items-center gap-3 px-5 py-2.5 text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
											>
												<span>Post a Job</span>
											</Link>
										</div>
										<form
											action={handleSignOut}
											className="pt-2 border-t border-zinc-200"
										>
											<button
												type="submit"
												className="w-full flex items-center gap-3 text-left px-5 py-2.5 text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
											>
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
							className="px-5 py-2.5 bg-black text-[#F5F1E8] rounded-full hover:bg-zinc-800 transition-colors"
						>
							Sign in
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
}
