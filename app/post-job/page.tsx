import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import HeaderMinimal from "@/components/HeaderMinimal";
import PostJobForm from "./PostJobForm";

export default async function PostJobPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

    return (
        <div className="min-h-svh bg-white">
            <HeaderMinimal />
            <PostJobForm />
        </div>
    );
}
