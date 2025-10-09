import { createClient } from "@/utils/supabase/server";
import { listNotifications, markAllRead } from "@/app/actions/notifications";
import HeaderMinimal from "@/components/HeaderMinimal";
import Link from "next/link";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const notifications = await listNotifications();

  async function markAll() {
    "use server";
    await markAllRead();
  }

  return (
    <div className="min-h-svh bg-white">
      <HeaderMinimal />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-title text-2xl font-semibold tracking-tight text-zinc-900">Inbox</h1>
          {user && notifications.length > 0 && (
            <form action={markAll}>
              <button className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50">Mark all as read</button>
            </form>
          )}
        </div>

        {(!user || notifications.length === 0) && (
          <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-zinc-200">
            <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-zinc-100" />
            <div className="font-title text-lg text-zinc-900">No notifications</div>
            <div className="font-body text-zinc-600">New job alerts will appear here.</div>
          </div>
        )}

        <ul className="space-y-3">
          {notifications.map((n) => {
            if (n.type === "job_alert") {
              const p = n.payload as { jobId: string; company: string; position: string; location: string };
              return (
                <li key={n.id} className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-title text-zinc-900">New job posted: {p.position}</div>
                      <div className="font-body text-sm text-zinc-700">{p.company} · {p.location}</div>
                    </div>
                    <Link href={{ pathname: "/job-search", query: { selected: p.jobId } }} className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800">View job</Link>
                  </div>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </main>
    </div>
  );
}
