"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ENABLE_AUTO_REDIRECTS } from "@/lib/config";

type AuthData = {
	user: User | null;
	loading: boolean;
};

const SessionContext = createContext<AuthData>({
	user: null,
	loading: true,
});

export const useSession = () => {
	return useContext(SessionContext);
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		// Check active session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			router.refresh();
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [router, supabase]);

	useEffect(() => {
		if (!loading && !user && ENABLE_AUTO_REDIRECTS) {
			router.push("/login");
		}
	}, [loading, user, router]);

	const value = {
		user,
		loading,
	};

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
