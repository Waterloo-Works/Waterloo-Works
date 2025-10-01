import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
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
		<div className="min-h-screen bg-[#F5F1E8]">
			<Navbar />
			<PostJobForm />
		</div>
	);
}
