import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/utils/prisma";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userRecord = await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email || "",
      fullName: user.user_metadata?.full_name || user.user_metadata?.name,
      source: user.user_metadata?.source,
    },
    update: {},
  });
  const isAdmin = !!userRecord.isAdmin;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-2">Dashboard</h1>
        <p className="font-body text-zinc-700">Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
          <h2 className="font-title text-lg text-zinc-900 mb-3">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/explore" className="block rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50">Explore jobs →</Link>
            <Link href="/post-job" className="block rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50">Post a job →</Link>
            <Link href="/my-jobs" className="block rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50">My submissions →</Link>
            {isAdmin && (
              <Link href="/admin" className="block rounded-lg bg-zinc-900 px-4 py-3 text-white hover:bg-zinc-800">Admin panel →</Link>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
          <h2 className="font-title text-lg text-zinc-900 mb-3">Your Profile</h2>
          <div className="space-y-2 text-zinc-700">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            {user.user_metadata?.full_name && (<p><span className="font-medium">Name:</span> {user.user_metadata.full_name}</p>)}
            {user.user_metadata?.source && (<p><span className="font-medium">Found us via:</span> {user.user_metadata.source}</p>)}
          </div>
        </div>
      </div>
    </main>
  );
}

