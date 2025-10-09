import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getJobById } from "@/app/actions/jobs";
import JobForm from "@/components/JobForm";

export default async function EditJobPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	const job = await getJobById(id);

	if (!job) {
		redirect("/my-jobs");
	}

    return (
        <JobForm
            mode="edit"
            jobId={job.id}
            initialData={{
                company: job.company,
                companyUrl: job.companyUrl || undefined,
                position: job.position,
                contact: job.contact,
                contactUrl: job.contactUrl || undefined,
                location: job.location,
                employmentType: job.employmentType,
                salaryMin: job.salaryMin || undefined,
                salaryMax: job.salaryMax || undefined,
                notes: job.notes || undefined,
            }}
        />
    );
}
