"use client";

import { useEffect, useState } from "react";
import { SourceCollectionModal } from "@/components/SourceCollectionModal";
import { useSession } from "@/providers/SessionProvider";

interface SourceCollectionWrapperProps {
	initialHasSource: boolean;
	children: React.ReactNode;
}

export function SourceCollectionWrapper({
	initialHasSource,
	children,
}: SourceCollectionWrapperProps) {
	const { user, loading } = useSession();
	const [hasSource, setHasSource] = useState(initialHasSource);

	useEffect(() => {
		// Update hasSource when the user state changes
		if (!loading && user) {
			setHasSource(initialHasSource);
		}
	}, [user, loading, initialHasSource]);

	// Don't show modal if user is not logged in or still loading
	const shouldShowModal = !loading && user && !hasSource;

	return (
		<>
			<SourceCollectionModal hasSource={!shouldShowModal} />
			{children}
		</>
	);
}
