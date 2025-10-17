"use client";

export default function FaviconImage({
	src,
	alt,
	company,
	className,
}: {
	src: string | null;
	alt?: string;
	company: string;
	className?: string;
}) {
	if (!src) return null;

	return (
		<img
			src={src}
			alt={alt || `${company} logo`}
			className={"rounded-lg object-cover flex-shrink-0 bg-white " + (className || "w-10 h-10")}
			onError={e => {
				e.currentTarget.style.display = "none";
			}}
		/>
	);
}
