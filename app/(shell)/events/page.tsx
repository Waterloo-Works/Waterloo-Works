import LumaCalendarEmbed from "@/components/events/LumaCalendarEmbed";
import LumaCalendarButton from "@/components/events/LumaCalendarButton";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const calendarId = process.env.NEXT_PUBLIC_LUMA_CALENDAR_ID?.trim();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-2">Events</h1>
        <p className="font-body text-zinc-700">Community‑hosted events and meetups. Powered by Luma.</p>
      </div>

      {calendarId ? (
        <div className="space-y-4">
          <LumaCalendarEmbed calendarId={calendarId} height={820} />
          <div className="flex items-center justify-between">
            <div className="font-body text-sm text-zinc-600">Tip: Click an event to see details and RSVP on Luma.</div>
            <LumaCalendarButton calendarId={calendarId} label="Open calendar" />
          </div>
          <div className="font-body text-sm text-zinc-600">
            Having trouble? <a className="underline" href={`https://lu.ma/${calendarId}`} target="_blank" rel="noopener noreferrer">Open on Luma ↗</a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
          <div className="font-title text-lg text-zinc-900">Calendar not configured</div>
          <p className="font-body text-zinc-700 mt-1">Set <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_LUMA_CALENDAR_ID</code> in your environment to embed the calendar.</p>
        </div>
      )}
    </main>
  );
}

