import Link from "next/link";
import { listNotifications, markAllRead } from "@/app/actions/notifications";
import { getRegionAlertMap } from "@/app/actions/alerts";
import PageHeaderPortal from "@/components/PageHeaderPortal";
import { createClient } from "@/utils/supabase/server";
import { timeAgo } from "@/lib/timeAgo";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const notifications = await listNotifications();
  const alerts = await getRegionAlertMap();

  async function markAll() {
    "use server";
    await markAllRead();
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <PageHeaderPortal>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Inbox</h1>
      </PageHeaderPortal>
      <div className="mb-6 flex items-center justify-between md:hidden">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Inbox</h1>
        {user && notifications.length > 0 && (
          <form action={markAll}>
            <button className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {(!user || notifications.length === 0) && (
        <EmptyState />
      )}

      {/* Show active job alerts so users can see subscriptions */}
      {user && alerts.size > 0 && (
        <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 font-body text-sm text-zinc-700">
          <div className="mb-1 font-medium text-zinc-900">Active job alerts</div>
          <div className="flex flex-wrap gap-2">
            {Array.from(alerts.entries())
              .filter(([, active]) => active)
              .map(([region]) => (
                <span key={region} className="rounded-full border border-zinc-200 bg-white px-3 py-1">{region === 'ALL' ? 'Global' : region}</span>
              ))}
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {notifications.map((n) => (
          <li key={n.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-header text-zinc-900">
                  {n.type === "job_alert" ? "New job posted" : "Notification"}
                </div>
                <div className="font-body text-sm text-zinc-700">
                  {renderBody(n)}
                </div>
                <div className="font-body text-xs text-zinc-500 mt-1">{timeAgo(n.createdAt)}</div>
              </div>
              {n.type === "job_alert" && (
                <Link
                  href={{ pathname: "/job-search", query: { selected: (n.payload as { jobId: string }).jobId } }}
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
                >
                  View job
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderBody(n: { type: string; payload: unknown }) {
  if (n.type === "job_alert") {
    const p = n.payload as { company: string; position: string; location: string };
    return (
      <span>
        {p.position} at {p.company} · {p.location}
      </span>
    );
  }
  return null;
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-zinc-200">
      <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-zinc-100" />
      <div className="font-header text-lg text-zinc-900">No notifications</div>
      <div className="font-body text-zinc-600">New job alerts will appear here.</div>
    </div>
  );
}
