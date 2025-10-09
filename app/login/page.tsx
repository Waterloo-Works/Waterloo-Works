"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    // UWaterloo magic link state only
    const [uwEmail, setUwEmail] = useState("");
    const [uwError, setUwError] = useState<string | null>(null);
    const [uwLoading, setUwLoading] = useState(false);
    const router = useRouter();

    const handleSendMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setUwError(null);
        setUwLoading(true);
        try {
            const normalized = uwEmail.trim().toLowerCase();
            if (!normalized.endsWith("@uwaterloo.ca")) {
                setUwError("Use your @uwaterloo.ca email.");
                return;
            }

            const res = await fetch("/api/auth/magic-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalized }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setUwError(body?.error || "Could not send magic link.");
                return;
            }
            router.push("/auth/check-email");
        } catch (err) {
            setUwError("Something went wrong. Please try again.");
        } finally {
            setUwLoading(false);
        }
    };

	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			{/* Navigation */}
			<nav className="px-6 py-6">
				<div className="max-w-6xl mx-auto flex justify-between items-center">
					<Link href="/" className="text-xl font-serif italic text-black">
						waterloo[dot]works
					</Link>
				</div>
			</nav>

			{/* Content */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="max-w-md w-full">
                    {/* UWaterloo Magic Link */}
                    <div className="rounded-2xl bg-white border border-black/20 p-6 shadow-sm">
                        <h2 className="text-2xl font-serif italic mb-2 text-black">Sign in with your UWaterloo email</h2>
                        <p className="text-gray-700 mb-4 text-sm">We’ll email you a magic link. Only @uwaterloo.ca emails are accepted.</p>
                        <form onSubmit={handleSendMagicLink} className="space-y-3">
                            <input
                                type="email"
                                placeholder="name@uwaterloo.ca"
                                value={uwEmail}
                                onChange={e => setUwEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-black/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                                required
                            />
                            {uwError && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{uwError}</div>
                            )}
                            <button
                                type="submit"
                                disabled={uwLoading}
                                className="w-full px-6 py-2.5 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {uwLoading ? "Sending..." : "Send magic link"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
