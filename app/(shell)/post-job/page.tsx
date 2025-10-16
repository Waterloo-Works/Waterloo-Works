import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PostJobForm from "./PostJobForm";

export default async function PostJobPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		// Redirect to login with next parameter to return here after auth
		redirect("/login?next=/post-job");
	}

    return <PostJobForm />;
}
