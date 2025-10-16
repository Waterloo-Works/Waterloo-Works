"use client";

import { useState, KeyboardEvent } from "react";

interface SkillsInputProps {
	skills: string[];
	onChange: (skills: string[]) => void;
	label?: string;
	placeholder?: string;
	maxSkills?: number;
}

export function SkillsInput({
	skills,
	onChange,
	label = "Skills",
	placeholder = "Type a skill and press Enter",
	maxSkills,
}: SkillsInputProps) {
	const [inputValue, setInputValue] = useState("");

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addSkill();
		}
	};

	const addSkill = () => {
		const trimmed = inputValue.trim();

		if (!trimmed) return;

		// Check if skill already exists (case-insensitive)
		if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
			setInputValue("");
			return;
		}

		// Check max skills limit
		if (maxSkills && skills.length >= maxSkills) {
			setInputValue("");
			return;
		}

		onChange([...skills, trimmed]);
		setInputValue("");
	};

	const removeSkill = (skillToRemove: string) => {
		onChange(skills.filter((s) => s !== skillToRemove));
	};

	return (
		<div className="space-y-2">
			{label && (
				<label className="block text-sm font-medium text-zinc-700">
					{label}
					{maxSkills && (
						<span className="ml-2 text-xs text-zinc-500">
							({skills.length}/{maxSkills})
						</span>
					)}
				</label>
			)}

			{/* Skills Display */}
			{skills.length > 0 && (
				<div className="flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
					{skills.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white"
						>
							{skill}
							<button
								type="button"
								onClick={() => removeSkill(skill)}
								className="ml-1 hover:text-zinc-300"
								aria-label={`Remove ${skill}`}
							>
								<svg
									className="h-3 w-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</span>
					))}
				</div>
			)}

			{/* Input Field */}
			<div className="flex gap-2">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={maxSkills ? skills.length >= maxSkills : false}
					className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-100 disabled:cursor-not-allowed"
				/>
				<button
					type="button"
					onClick={addSkill}
					disabled={
						!inputValue.trim() || (maxSkills ? skills.length >= maxSkills : false)
					}
					className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Add
				</button>
			</div>

			<p className="text-xs text-zinc-500">
				Press Enter or click Add to add a skill
			</p>
		</div>
	);
}
