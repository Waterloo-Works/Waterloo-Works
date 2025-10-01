"use client";

import { useSession } from "@/providers/SessionProvider";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { BiHelpCircle } from "react-icons/bi";
import { FiLogOut } from "react-icons/fi";
import Image from "next/image";

interface AvatarProps {
	name: string;
	imageUrl?: string | null;
	className?: string;
}

function Avatar({ name, imageUrl, className = "" }: AvatarProps) {
	const initials = name
		.split(" ")
		.map(word => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	if (imageUrl) {
		return (
			<div 
				className={`w-8 h-8 rounded-full overflow-hidden bg-gray-100 ${className}`}
				aria-hidden="true"
			>
				<Image
					src={imageUrl}
					alt={name}
					width={32}
					height={32}
					className="w-full h-full object-cover"
				/>
			</div>
		);
	}

	return (
		<div 
			className={`w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm ${className}`}
			aria-hidden="true"
		>
			{initials}
		</div>
	);
}

export function Navbar() {
	const { user, loading } = useSession();
	const router = useRouter();
	const supabase = createClient();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push("/login");
		router.refresh();
	};

	const closeDropdown = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				closeDropdown();
			}
		};

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeDropdown();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscapeKey);
		
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, []);

	if (loading) {
		return null;
	}

	return (
		<nav className="bg-white shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex-shrink-0 flex items-center">
						<h1 className="text-xl font-bold text-gray-800">Lucy</h1>
					</div>
					{user && (
						<div className="relative flex items-center" ref={dropdownRef}>
							<button
								ref={buttonRef}
								onClick={() => setIsOpen(!isOpen)}
								className="flex items-center gap-1.5 py-[5px] pl-1.5 pr-2 rounded-full border border-gray-300 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition-all duration-200"
								aria-expanded={isOpen}
								aria-haspopup="true"
								aria-label="User menu"
							>
								<HiMenu className="w-5 h-5 text-gray-600" aria-hidden="true" />
								<Avatar 
									name={user.user_metadata.full_name} 
									imageUrl={user.user_metadata.avatar_url}
									className="w-7 h-7" 
								/>
							</button>

							<div
								className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.12)] py-1 z-10
									transition-all duration-200 origin-top-right top-full
									${isOpen 
										? 'opacity-100 scale-100 translate-y-0' 
										: 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="user-menu-button"
							>
								<div className="px-4 py-2 border-b border-gray-100">
									<p className="text-sm font-semibold text-gray-900">{user.user_metadata.full_name}</p>
									<p className="text-sm text-gray-500 truncate">{user.email}</p>
								</div>
								
								<div className="py-1">
									<button
										className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
										role="menuitem"
									>
										<IoSettingsOutline className="w-4 h-4 text-gray-500" />
										<span>Settings</span>
									</button>
									<button
										className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
										role="menuitem"
									>
										<BiHelpCircle className="w-4 h-4 text-gray-500" />
										<span>Help</span>
									</button>
								</div>

								<div className="border-t border-gray-100">
									<button
										onClick={handleSignOut}
										className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
										role="menuitem"
									>
										<FiLogOut className="w-4 h-4 text-gray-500" />
										<span>Sign out</span>
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
