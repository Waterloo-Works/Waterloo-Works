"use client";

export default function FaviconImage({
	src,
	alt,
	company,
}: {
	src: string | null;
	alt?: string;
	company: string;
}) {
	if (!src) return null;

	return (
		<img
			src={src}
			alt={alt || `${company} logo`}
			className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-white"
			onError={e => {
				e.currentTarget.style.display = "none";
			}}
		/>
	);
}
