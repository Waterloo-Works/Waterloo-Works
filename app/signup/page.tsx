"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { createUserRecord } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [source, setSource] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();
	const router = useRouter();

	const handleGoogleSignUp = async () => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) {
				setError(error.message);
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validate source field
		if (!source.trim()) {
			setError("Please tell us how you found us");
			setLoading(false);
			return;
		}

		try {
			const { data: authData, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
						source,
					},
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (signUpError) {
				setError(signUpError.message);
				return;
			}

			// Create user record in our database
			if (authData.user) {
				await createUserRecord({
					userId: authData.user.id,
					email,
					fullName,
					source,
				});
			}

			router.push("/dashboard");
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			{/* Navigation */}
			<nav className="px-6 py-6">
				<div className="max-w-6xl mx-auto flex justify-between items-center">
					<Link href="/" className="text-xl font-serif italic text-black">
						Waterloo.works
					</Link>
				</div>
			</nav>

			{/* Content */}
			<div className="flex items-center justify-center px-6 py-12">
				<div className="max-w-md w-full">
					<div className="mb-8 text-center">
						<h1 className="text-4xl md:text-5xl font-serif italic mb-4 text-black">
							Join us
						</h1>
						<p className="text-lg text-gray-700">
							Create an account to access the job board
						</p>
					</div>

					<form onSubmit={handleSignUp} className="space-y-5">
						{/* Full Name */}
						<div>
							<label
								htmlFor="fullName"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Full Name
							</label>
							<input
								type="text"
								id="fullName"
								value={fullName}
								onChange={e => setFullName(e.target.value)}
								className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
								required
							/>
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Email
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
								required
							/>
						</div>

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
								required
							/>
						</div>

						{/* How did you find us */}
						<div>
							<label
								htmlFor="source"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								How did you find us? *
							</label>
							<input
								type="text"
								id="source"
								value={source}
								onChange={e => setSource(e.target.value)}
								placeholder="e.g., Twitter, LinkedIn, Friend, Google Search..."
								className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
								required
							/>
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
							disabled={loading}
							className="w-full px-6 py-3 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
						>
							{loading ? "Creating account..." : "Create account"}
						</button>
					</form>

					{/* Divider */}
					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-black/20"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-[#F5F1E8] text-gray-500">
								Or continue with
							</span>
						</div>
					</div>

					{/* Google Button */}
					<button
						type="button"
						onClick={handleGoogleSignUp}
						className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-black/20 rounded-full bg-white hover:bg-gray-50 transition-colors font-medium"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</button>

					{/* Sign in link */}
					<div className="mt-6 text-center">
						<Link
							href="/login"
							className="text-gray-700 hover:text-black transition-colors"
						>
							Already have an account?{" "}
							<span className="underline">Sign in</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
