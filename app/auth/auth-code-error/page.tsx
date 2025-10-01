"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthCodeErrorContent() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	const getErrorMessage = (errorCode: string | null) => {
		switch (errorCode) {
			case "no_code":
				return "No authentication code was provided.";
			case "unknown":
				return "An unexpected error occurred during authentication.";
			default:
				return (
					errorCode ||
					"There was an error processing your authentication request."
				);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Authentication Error
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						{getErrorMessage(error)}
					</p>
				</div>
				<div className="flex flex-col gap-3">
					<Link
						href="/login"
						className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						Return to Login
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function AuthCodeError() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-gray-50">
					<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
						<div className="text-center">Loading...</div>
					</div>
				</div>
			}
		>
			<AuthCodeErrorContent />
		</Suspense>
	);
}
